const {execSync} = require("child_process");
const out = execSync("sqlite3 /root/.n8n/.n8n/database.sqlite \"SELECT connections FROM workflow_entity WHERE id='mhPPIHjYTH4sFUDK';\"", {maxBuffer:10*1024*1024}).toString().trim();
const conns = JSON.parse(out);

// Wait 5s (구 Wait 30s_2) 관련 연결 확인
console.log("=== 폴링 루프 연결 확인 ===\n");

// 어떤 노드가 Wait로 연결되는지
var waitIncoming = [];
var waitOutgoing = conns["Wait 5s"] || conns["Wait 30s_2"] || null;

Object.keys(conns).forEach(function(nodeName) {
    var main = conns[nodeName].main || [];
    main.forEach(function(outputs, outIdx) {
        if (outputs) {
            outputs.forEach(function(conn) {
                if (conn.node === "Wait 5s" || conn.node === "Wait 30s_2") {
                    waitIncoming.push(nodeName + " [output " + outIdx + "] → " + conn.node);
                }
            });
        }
    });
});

console.log("[Wait 5s 수신 연결]");
waitIncoming.forEach(function(c) { console.log("  " + c); });

if (waitOutgoing) {
    console.log("\n[Wait 5s 발신 연결]");
    var main = waitOutgoing.main || [];
    main.forEach(function(outputs, outIdx) {
        if (outputs) {
            outputs.forEach(function(conn) {
                console.log("  Wait 5s [output " + outIdx + "] → " + conn.node);
            });
        }
    });
}

// If3 관련 연결
console.log("\n[If3 발신 연결]");
var if3Out = conns["If3"];
if (if3Out) {
    var main = if3Out.main || [];
    main.forEach(function(outputs, outIdx) {
        if (outputs) {
            outputs.forEach(function(conn) {
                var label = outIdx === 0 ? "true" : "false";
                console.log("  If3 [" + label + "] → " + conn.node);
            });
        }
    });
}

// Shotstack Polling 관련 연결
console.log("\n[Shotstack Polling 발신 연결]");
var spOut = conns["Shotstack Polling"];
if (spOut) {
    var main = spOut.main || [];
    main.forEach(function(outputs, outIdx) {
        if (outputs) {
            outputs.forEach(function(conn) {
                console.log("  Shotstack Polling [output " + outIdx + "] → " + conn.node);
            });
        }
    });
}

console.log("\n=== 올바른 폴링 루프 순서 ===");
console.log("7. Shotstack 렌더링 → Wait 5s → Shotstack Polling → If3");
console.log("  If3 [true=done/failed] → 품질 체크 → Download → ...");
console.log("  If3 [false=아직 진행중] → Wait 5s (루프 반복)");
