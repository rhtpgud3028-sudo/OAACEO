const {execSync} = require("child_process");
const fs = require("fs");

const DB_PATH = "/root/.n8n/.n8n/database.sqlite";
const WF_ID = "mhPPIHjYTH4sFUDK";

// 1) connections 가져오기
console.log("Step 1: connections 로드...");
const rawConns = execSync(
    "sqlite3 \"" + DB_PATH + "\" \"SELECT connections FROM workflow_entity WHERE id='" + WF_ID + "';\"",
    {maxBuffer: 10*1024*1024}
).toString().trim();
var conns = JSON.parse(rawConns);

// 2) "Wait 30s_2" → "Wait 5s"로 일괄 교체
console.log("Step 2: Wait 30s_2 → Wait 5s 참조 정리...");

var fixCount = 0;

// 2a) conns 키 이름 교체 (Wait 30s_2 → Wait 5s)
if (conns["Wait 30s_2"] && !conns["Wait 5s"]) {
    conns["Wait 5s"] = conns["Wait 30s_2"];
    delete conns["Wait 30s_2"];
    fixCount++;
    console.log("  키 이름 교체: Wait 30s_2 → Wait 5s");
} else if (conns["Wait 30s_2"] && conns["Wait 5s"]) {
    // 양쪽 다 있으면 구 이름 삭제
    delete conns["Wait 30s_2"];
    fixCount++;
    console.log("  중복 키 삭제: Wait 30s_2 제거 (Wait 5s 유지)");
}

// 2b) 모든 노드의 connection 대상에서 "Wait 30s_2" → "Wait 5s" 교체 + 중복 제거
Object.keys(conns).forEach(function(nodeName) {
    var main = conns[nodeName].main || [];
    main.forEach(function(outputs, outIdx) {
        if (!outputs) return;

        // Wait 30s_2 참조를 Wait 5s로 변경
        outputs.forEach(function(conn) {
            if (conn.node === "Wait 30s_2") {
                conn.node = "Wait 5s";
                fixCount++;
                console.log("  " + nodeName + " [" + outIdx + "] → Wait 30s_2 를 Wait 5s로 변경");
            }
        });

        // 중복 제거 (같은 node로의 연결이 2개 이상이면 1개만 유지)
        var seen = {};
        var cleaned = [];
        outputs.forEach(function(conn) {
            var key = conn.node + "_" + (conn.type || "main") + "_" + (conn.index || 0);
            if (!seen[key]) {
                seen[key] = true;
                cleaned.push(conn);
            } else {
                fixCount++;
                console.log("  중복 연결 제거: " + nodeName + " → " + conn.node);
            }
        });
        conns[nodeName].main[outIdx] = cleaned;
    });
});

console.log("  총 " + fixCount + "개 수정");

// 3) DB 저장
console.log("\nStep 3: DB 저장...");
var connsJson = JSON.stringify(conns);
var escapedJson = connsJson.replace(/'/g, "''");
var sql = "UPDATE workflow_entity SET connections = '" + escapedJson + "', updatedAt = datetime('now') WHERE id = '" + WF_ID + "';";

var sqlPath = "/tmp/fix_connections.sql";
fs.writeFileSync(sqlPath, sql);
execSync("sqlite3 \"" + DB_PATH + "\" < \"" + sqlPath + "\"", {maxBuffer: 10*1024*1024});
console.log("  DB 저장 완료!");

// 4) 검증
console.log("\nStep 4: 검증...");
var verifyRaw = execSync(
    "sqlite3 \"" + DB_PATH + "\" \"SELECT connections FROM workflow_entity WHERE id='" + WF_ID + "';\"",
    {maxBuffer: 10*1024*1024}
).toString().trim();
var verifyConns = JSON.parse(verifyRaw);

// Wait 30s_2 참조가 남아있는지 체크
var oldRefFound = false;
var jsonStr = JSON.stringify(verifyConns);
if (jsonStr.indexOf("Wait 30s_2") !== -1) {
    oldRefFound = true;
}

console.log("  Wait 30s_2 잔존:", oldRefFound ? "❌ 아직 있음" : "✅ 제거 완료");
console.log("  Wait 5s 키 존재:", verifyConns["Wait 5s"] ? "✅" : "❌");

// 최종 루프 연결 확인
var waitIncoming = [];
Object.keys(verifyConns).forEach(function(nodeName) {
    var main = verifyConns[nodeName].main || [];
    main.forEach(function(outputs, outIdx) {
        if (outputs) {
            outputs.forEach(function(conn) {
                if (conn.node === "Wait 5s") {
                    var label = "";
                    if (nodeName === "If3") label = outIdx === 0 ? "true" : "false";
                    else label = "output " + outIdx;
                    waitIncoming.push(nodeName + " [" + label + "] → Wait 5s");
                }
            });
        }
    });
});

console.log("\n=== 정리된 폴링 루프 ===");
waitIncoming.forEach(function(c) { console.log("  " + c); });

var waitOut = verifyConns["Wait 5s"];
if (waitOut && waitOut.main) {
    waitOut.main.forEach(function(outputs, outIdx) {
        if (outputs) {
            outputs.forEach(function(conn) {
                console.log("  Wait 5s → " + conn.node);
            });
        }
    });
}

var if3Out = verifyConns["If3"];
if (if3Out && if3Out.main) {
    if3Out.main.forEach(function(outputs, outIdx) {
        if (outputs) {
            outputs.forEach(function(conn) {
                var label = outIdx === 0 ? "true" : "false";
                console.log("  If3 [" + label + "] → " + conn.node);
            });
        }
    });
}

console.log("\n✅ 완료!");
