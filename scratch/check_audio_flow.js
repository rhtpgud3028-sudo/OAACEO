const {execSync} = require("child_process");
const DB_PATH = "/root/.n8n/.n8n/database.sqlite";
const WF_ID = "mhPPIHjYTH4sFUDK";

var rawNodes = execSync(
    "sqlite3 \"" + DB_PATH + "\" \"SELECT nodes FROM workflow_entity WHERE id='" + WF_ID + "';\"",
    {maxBuffer: 10*1024*1024}
).toString().trim();
var nodes = JSON.parse(rawNodes);

var rawConns = execSync(
    "sqlite3 \"" + DB_PATH + "\" \"SELECT connections FROM workflow_entity WHERE id='" + WF_ID + "';\"",
    {maxBuffer: 10*1024*1024}
).toString().trim();
var conns = JSON.parse(rawConns);

// 오디오 관련 노드 찾기
console.log("=== 오디오 관련 노드 ===");
var audioNodes = ["Save Audio", "Boost Body Audio", "Convert Audio", "Decode Audio", "6. ElevenLabs TTS"];
audioNodes.forEach(function(name) {
    nodes.forEach(function(n, i) {
        if (n.name === name) {
            console.log(i + ": " + n.name + " [" + n.type + "]");
            // 해당 노드의 outgoing connections
            var nodeConns = conns[name];
            if (nodeConns && nodeConns.main) {
                nodeConns.main.forEach(function(outputs, outIdx) {
                    if (outputs) {
                        outputs.forEach(function(c) {
                            console.log("   → " + c.node);
                        });
                    }
                });
            }
        }
    });
});

// Code 노드가 어떤 노드에서 TTS URL을 참조하는지
console.log("\n=== Code 노드 TTS URL 참조 ===");
var code = nodes[25].parameters.jsCode;
var ttsRefMatch = code.match(/\$\(['"](.*?)['"].*Save Audio|ttsAudioUrl.*?=.*?\$/gm);
if (ttsRefMatch) {
    ttsRefMatch.forEach(function(m) { console.log("  " + m); });
}

// Save Audio 직후 흐름 확인
console.log("\n=== Save Audio → Code 흐름 ===");
var saveAudioConns = conns["Save Audio"];
if (saveAudioConns && saveAudioConns.main) {
    saveAudioConns.main.forEach(function(outputs, outIdx) {
        if (outputs) {
            outputs.forEach(function(c) {
                console.log("  Save Audio → " + c.node);
            });
        }
    });
}

// Boost Body Audio 확인
console.log("\n=== Boost Body Audio 노드 설정 ===");
nodes.forEach(function(n, i) {
    if (n.name === "Boost Body Audio") {
        console.log("  인덱스:", i);
        console.log("  URL:", n.parameters.url || "N/A");
        console.log("  Method:", n.parameters.method || "N/A");
        var body = JSON.stringify(n.parameters).substring(0, 500);
        console.log("  Params:", body);
    }
});

// Boost Body Audio의 outgoing
var boostConns = conns["Boost Body Audio"];
if (boostConns && boostConns.main) {
    boostConns.main.forEach(function(outputs) {
        if (outputs) {
            outputs.forEach(function(c) {
                console.log("  Boost Body Audio → " + c.node);
            });
        }
    });
}

// 누가 Code 노드에 연결되는지
console.log("\n=== Code 노드(인덱스25) 수신 연결 ===");
Object.keys(conns).forEach(function(nodeName) {
    var main = conns[nodeName].main || [];
    main.forEach(function(outputs, outIdx) {
        if (outputs) {
            outputs.forEach(function(c) {
                if (c.node === "Code") {
                    console.log("  " + nodeName + " → Code");
                }
            });
        }
    });
});
