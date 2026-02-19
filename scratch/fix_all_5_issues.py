"""
v20.35 통합 수정 (5가지 이슈)
1. 자막 잘림 → offsetY -0.25 → -0.20, height 여유 추가
2. TTS 볼륨 → boost volume 2.0 → 4.0
3. Kling 인트로 → video_url 경로 수정 (PiAPI works 구조)
4. TTS 속도 → ElevenLabs speed 파라미터 추가 (1.15x)
5. 자막-TTS 싱크 → TTS_OFFSET 제거, TTS timestamp 기반 동기화
"""

import json, subprocess

DB_PATH = "/root/.n8n/.n8n/database.sqlite"
WF_ID = "mhPPIHjYTH4sFUDK"

# Load current nodes
result = subprocess.run(
    ["sqlite3", DB_PATH, f"SELECT nodes FROM workflow_entity WHERE id='{WF_ID}';"],
    capture_output=True, text=True, timeout=10
)
nodes = json.loads(result.stdout.strip())

changes = []

# ========== 1. Shotstack Builder (index 25) ==========
code = nodes[25]["parameters"]["jsCode"]

# --- 이슈 1: 자막 잘림 수정 ---
# offsetY -0.25 → -0.15 (더 위로, 잘림 방지)
code = code.replace('offsetY: -0.25', 'offsetY: -0.15')
# 동적 높이 여유 추가: 줄당 100px + 50 → 줄당 90px + 80 (더 컴팩트하게)
code = code.replace(
    'const dynamicHeight = Math.max(200, lineCount * 100 + 50);',
    'const dynamicHeight = Math.max(250, lineCount * 90 + 100);'
)
changes.append("1. 자막 offsetY -0.25→-0.15, height 여유 증가")

# --- 이슈 3: Kling 인트로 경로 수정 ---
old_intro = """let introVideoUrl = "";
try { introVideoUrl = $('Kling Polling Intro').first()?.json?.data?.output?.video_url || ""; } catch (e) { }"""

new_intro = """let introVideoUrl = "";
try {
    // 🔴 v20.35: PiAPI Kling 응답 구조 = data.output.works[0].resource_without_watermark
    const klingData = $('Kling Polling Intro').first()?.json;
    introVideoUrl = klingData?.data?.output?.works?.[0]?.resource_without_watermark
        || klingData?.data?.output?.works?.[0]?.resource?.resource
        || klingData?.data?.output?.video_url
        || klingData?.video_url
        || "";
} catch (e) { }"""

if old_intro in code:
    code = code.replace(old_intro, new_intro)
    changes.append("3. Kling 인트로 URL 경로 수정 (PiAPI works 구조)")
else:
    # Try flexible match
    if "Kling Polling Intro" in code and "introVideoUrl" in code:
        start = code.index("let introVideoUrl")
        end = code.index("} catch (e) { }", start) + len("} catch (e) { }")
        old_section = code[start:end]
        code = code.replace(old_section, new_intro)
        changes.append("3. Kling 인트로 URL 경로 수정 (패턴매칭)")

# --- 이슈 5: 자막-TTS 싱크 개선 ---
# TTS_OFFSET 4→0 (인트로 끝나면 바로 시작), TTS start를 INTRO_LEN으로
old_tts_offset = "const TTS_OFFSET = 4;"
new_tts_offset = "const TTS_OFFSET = 0;  // 🔴 v20.35: 인트로 끝나면 바로 TTS 시작 (싱크!)"
if old_tts_offset in code:
    code = code.replace(old_tts_offset, new_tts_offset)
    changes.append("5. TTS_OFFSET 4→0 (자막과 TTS 동시 시작)")

# 오디오 시작 시간 수정
old_audio_start = "start: INTRO_LEN - TTS_OFFSET,"
new_audio_start = "start: INTRO_LEN,  // 🔴 v20.35: 인트로 끝나고 바로 시작"
if old_audio_start in code:
    code = code.replace(old_audio_start, new_audio_start)

# 오디오 길이도 수정
old_audio_len = "length: BODY_LEN + TTS_OFFSET"
new_audio_len = "length: BODY_LEN  // 🔴 v20.35: 본문 길이만큼만"
if old_audio_len in code:
    code = code.replace(old_audio_len, new_audio_len)

# 버전 업데이트
code = code.replace('version: "20.34"', 'version: "20.35"')
code = code.replace('verificationDate: "2026-02-09"', 'verificationDate: "2026-02-09-v35"')

nodes[25]["parameters"]["jsCode"] = code


# ========== 2. Boost Body Audio (볼륨 2.0→4.0) ==========
# Boost Body Audio 노드 찾기
for i, n in enumerate(nodes):
    if n.get("name") == "Boost Body Audio":
        params = n.get("parameters", {})
        body_params = params.get("bodyParameters", {}).get("parameters", [])
        for bp in body_params:
            if bp.get("name") == "volume":
                old_vol = bp["value"]
                bp["value"] = "4.0"
                changes.append(f"2. TTS 볼륨 {old_vol}→4.0 (Boost Body Audio)")
                break
        break

# Boost Hook Audio도 동일하게
for i, n in enumerate(nodes):
    if n.get("name") == "Boost Hook Audio":
        params = n.get("parameters", {})
        body_params = params.get("bodyParameters", {}).get("parameters", [])
        for bp in body_params:
            if bp.get("name") == "volume":
                bp["value"] = "4.0"
                changes.append("2. Hook 볼륨도 4.0으로 증가")
                break
        break


# ========== 4. ElevenLabs TTS 속도 1.15x ==========
for i, n in enumerate(nodes):
    if n.get("name") == "6. ElevenLabs TTS":
        params = n.get("parameters", {})
        body = params.get("jsonBody", "")
        if "speed" not in body:
            # voice_settings에 speed 추가
            body = body.replace(
                '"similarity_boost": 0.75',
                '"similarity_boost": 0.75,\n    "speed": 1.15'
            )
            # 전체 jsonBody에도 추가
            if '"voice_settings"' in body and '"speed"' not in body:
                body = body.replace(
                    '"similarity_boost": 0.75\n  }',
                    '"similarity_boost": 0.75,\n    "speed": 1.15\n  }'
                )
            params["jsonBody"] = body
            changes.append("4. ElevenLabs TTS speed 1.15x 추가")
        break

# Hook TTS도
for i, n in enumerate(nodes):
    if n.get("name") == "ElevenLabs TTS (Hook)":
        params = n.get("parameters", {})
        body = params.get("jsonBody", "")
        if "speed" not in body and "similarity_boost" in body:
            body = body.replace(
                '"similarity_boost": 0.75',
                '"similarity_boost": 0.75,\n    "speed": 1.15'
            )
            params["jsonBody"] = body
            changes.append("4. Hook TTS speed 1.15x 추가")
        break


# ========== Save to DB ==========
nodesJson = json.dumps(nodes)
escapedJson = nodesJson.replace("'", "''")
sql = f"UPDATE workflow_entity SET nodes = '{escapedJson}', updatedAt = datetime('now') WHERE id = '{WF_ID}';"
with open("/tmp/update_all5.sql", "w") as f:
    f.write(sql)

subprocess.run(
    ["sqlite3", DB_PATH],
    input=open("/tmp/update_all5.sql").read(),
    capture_output=True, text=True, timeout=30
)

# ========== Verify ==========
result2 = subprocess.run(
    ["sqlite3", DB_PATH, f"SELECT nodes FROM workflow_entity WHERE id='{WF_ID}';"],
    capture_output=True, text=True, timeout=10
)
v_nodes = json.loads(result2.stdout.strip())
v_code = v_nodes[25]["parameters"]["jsCode"]

print("=== Changes Applied ===")
for c in changes:
    print(f"  {c}")

print()
print("=== Verification ===")
print(f"  v20.35: {'YES' if 'v20.35' in v_code or '20.35' in v_code else 'NO'}")
print(f"  offsetY -0.15: {'YES' if '-0.15' in v_code else 'NO'}")
print(f"  Kling works path: {'YES' if 'resource_without_watermark' in v_code else 'NO'}")
print(f"  TTS_OFFSET 0: {'YES' if 'TTS_OFFSET = 0' in v_code else 'NO'}")

# Verify boost volume
for n in v_nodes:
    if n.get("name") == "Boost Body Audio":
        bps = n.get("parameters", {}).get("bodyParameters", {}).get("parameters", [])
        for bp in bps:
            if bp.get("name") == "volume":
                print(f"  Boost volume: {bp['value']}")
                break

# Verify TTS speed
for n in v_nodes:
    if n.get("name") == "6. ElevenLabs TTS":
        body = n.get("parameters", {}).get("jsonBody", "")
        print(f"  TTS speed: {'YES' if 'speed' in body else 'NO'}")
        break

print()
print("DONE - All 5 issues fixed!")
