import json, subprocess

DB_PATH = "/root/.n8n/.n8n/database.sqlite"
WF_ID = "mhPPIHjYTH4sFUDK"

# Load current nodes
result = subprocess.run(
    ["sqlite3", DB_PATH, f"SELECT nodes FROM workflow_entity WHERE id='{WF_ID}';"],
    capture_output=True, text=True, timeout=10
)
nodes = json.loads(result.stdout.strip())
code = nodes[25]["parameters"]["jsCode"]

# Find logo section and comment it out
if "const logoClips = [];" in code and "channelConfig.logoUrl" in code:
    start = code.index("const logoClips = [];")
    if_start = code.index("if (channelConfig.logoUrl)", start)

    # Find the matching closing brace
    brace_count = 0
    end = if_start
    for idx in range(if_start, len(code)):
        if code[idx] == "{":
            brace_count += 1
        elif code[idx] == "}":
            brace_count -= 1
            if brace_count == 0:
                end = idx + 1
                break

    old_section = code[start:end]

    new_section = """const logoClips = [];
// 🔴 v20.34: 로고 파일 미생성 → 스킵 (404 시 Shotstack 렌더 실패!)
// TODO: 로고 파일 생성 후 활성화
// if (channelConfig.logoUrl) {
//     logoClips.push({...});
// }"""

    code = code[:start] + new_section + code[end:]
    nodes[25]["parameters"]["jsCode"] = code
    print("OK: logo section commented out")
else:
    print("WARN: logo section not found or already modified")

# Save
nodesJson = json.dumps(nodes)
escapedJson = nodesJson.replace("'", "''")
sql = f"UPDATE workflow_entity SET nodes = '{escapedJson}', updatedAt = datetime('now') WHERE id = '{WF_ID}';"
with open("/tmp/update_logo.sql", "w") as f:
    f.write(sql)

subprocess.run(
    ["sqlite3", DB_PATH],
    input=open("/tmp/update_logo.sql").read(),
    capture_output=True, text=True, timeout=10
)
print("OK: DB saved")

# Verify
result2 = subprocess.run(
    ["sqlite3", DB_PATH, f"SELECT nodes FROM workflow_entity WHERE id='{WF_ID}';"],
    capture_output=True, text=True, timeout=10
)
v_nodes = json.loads(result2.stdout.strip())
v_code = v_nodes[25]["parameters"]["jsCode"]

has_comment = "// if (channelConfig.logoUrl)" in v_code or "로고 파일 미생성" in v_code
has_empty = "const logoClips = [];" in v_code
no_active_logo = "logoClips.push" not in v_code or "// " in v_code.split("logoClips.push")[0].split("\n")[-1]

print(f"Verify - commented: {has_comment}, empty array: {has_empty}")
print("DONE")
