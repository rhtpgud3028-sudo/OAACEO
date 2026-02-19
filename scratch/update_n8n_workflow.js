/**
 * n8n 워크플로우 DB 직접 수정 스크립트
 * 대상: mhPPIHjYTH4sFUDK (AI Shorts Factory - Master Workflow_GPT5.2 Adj)
 *
 * 수정 내용:
 * 1. Code 노드 (인덱스 25) → v20.34 PHASE2-FULL
 * 2. Wait 30s_2 노드 (인덱스 7) → 5초
 * 3. If3 노드 (인덱스 10) → done OR failed 체크
 */

const { execSync } = require("child_process");
const fs = require("fs");

const DB_PATH = "/root/.n8n/.n8n/database.sqlite";
const WF_ID = "mhPPIHjYTH4sFUDK";

try {
    // 1) 현재 노드 가져오기
    console.log("📌 Step 1: 현재 워크플로우 노드 로드...");

    const rawNodes = execSync(
        `sqlite3 "${DB_PATH}" "SELECT nodes FROM workflow_entity WHERE id='${WF_ID}';"`,
        { maxBuffer: 10 * 1024 * 1024 }
    ).toString().trim();

    const nodes = JSON.parse(rawNodes);
    console.log("   총 노드 수:", nodes.length);
    console.log("   Code 노드:", nodes[25].name);
    console.log("   Wait 노드:", nodes[7].name);
    console.log("   If3 노드:", nodes[10].name);

    // 2) Code 노드 (인덱스 25) 수정 → v20.34 PHASE2-FULL
    console.log("\n📌 Step 2: Code 노드 → v20.34 PHASE2-FULL...");
    const newCode = fs.readFileSync("/tmp/v20_34_code.js", "utf8");
    nodes[25].parameters.jsCode = newCode;
    console.log("   ✅ Code 업데이트 완료 (", newCode.length, "bytes)");

    // 3) Wait 30s_2 노드 (인덱스 7) → 5초
    console.log("\n📌 Step 3: Wait 노드 30s → 5s...");
    console.log("   이전:", nodes[7].parameters.amount, "초");
    nodes[7].parameters.amount = 5;
    nodes[7].name = "Wait 5s";
    console.log("   이후:", nodes[7].parameters.amount, "초");
    console.log("   ✅ Wait 업데이트 완료");

    // 4) If3 노드 (인덱스 10) → done OR failed
    console.log("\n📌 Step 4: If3 노드 → done OR failed...");
    nodes[10].parameters = {
        conditions: {
            options: {
                caseSensitive: true,
                leftValue: "",
                typeValidation: "strict",
                version: 2
            },
            conditions: [
                {
                    id: "6afee127-c529-42d5-bf38-86dbc2b551d2",
                    leftValue: "={{ $json.response.status }}",
                    rightValue: "done",
                    operator: {
                        type: "string",
                        operation: "equals"
                    }
                },
                {
                    id: "poll-limit-failed",
                    leftValue: "={{ $json.response.status }}",
                    rightValue: "failed",
                    operator: {
                        type: "string",
                        operation: "equals"
                    }
                }
            ],
            combinator: "or"
        },
        options: {}
    };
    console.log("   ✅ If3 업데이트 완료 (done OR failed → exit loop)");

    // 5) DB에 저장
    console.log("\n📌 Step 5: DB 저장...");
    const nodesJson = JSON.stringify(nodes);

    // SQL 인젝션 방지를 위해 임시 파일 사용
    const tempJsonPath = "/tmp/nodes_update.json";
    fs.writeFileSync(tempJsonPath, nodesJson);

    // Node.js에서 직접 sqlite3 업데이트 (파라미터 바인딩 대신 임시 파일)
    const sqlContent = `UPDATE workflow_entity SET nodes = readfile('${tempJsonPath}'), updatedAt = datetime('now') WHERE id = '${WF_ID}';`;

    // readfile은 blob으로 읽으니 다른 방식 사용
    // SQL에서 JSON을 직접 넣되, 작은따옴표를 이스케이프
    const escapedJson = nodesJson.replace(/'/g, "''");
    const sql = `UPDATE workflow_entity SET nodes = '${escapedJson}', updatedAt = datetime('now') WHERE id = '${WF_ID}';`;

    const sqlPath = "/tmp/update_workflow.sql";
    fs.writeFileSync(sqlPath, sql);

    execSync(`sqlite3 "${DB_PATH}" < "${sqlPath}"`, { maxBuffer: 10 * 1024 * 1024 });
    console.log("   ✅ DB 저장 완료!");

    // 6) 검증
    console.log("\n📌 Step 6: 검증...");
    const verifyRaw = execSync(
        `sqlite3 "${DB_PATH}" "SELECT nodes FROM workflow_entity WHERE id='${WF_ID}';"`,
        { maxBuffer: 10 * 1024 * 1024 }
    ).toString().trim();

    const verifyNodes = JSON.parse(verifyRaw);

    const codeOk = verifyNodes[25].parameters.jsCode.includes("v20.34 PHASE2-FULL");
    const waitOk = verifyNodes[7].parameters.amount === 5;
    const if3Ok = verifyNodes[10].parameters.conditions.conditions.length === 2;

    console.log("   Code v20.34:", codeOk ? "✅" : "❌");
    console.log("   Wait 5s:", waitOk ? "✅" : "❌");
    console.log("   If3 (2 conditions):", if3Ok ? "✅" : "❌");

    if (codeOk && waitOk && if3Ok) {
        console.log("\n🎉🎉🎉 모든 수정 및 검증 완료! 🎉🎉🎉");
        console.log("⚠️  n8n을 리로드하면 적용됩니다.");
    } else {
        console.log("\n❌ 일부 검증 실패! 백업에서 복구 필요.");
    }

} catch (err) {
    console.error("❌ 오류 발생:", err.message);
    console.error("   롤백 방법: sqlite3 " + DB_PATH + " < /root/.n8n/backups/database_backup_20260209_pre_v2034.sqlite");
    process.exit(1);
}
