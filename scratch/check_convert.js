const {execSync} = require("child_process");
const DB_PATH = "/root/.n8n/.n8n/database.sqlite";
const WF_ID = "mhPPIHjYTH4sFUDK";

var rawNodes = execSync(
    "sqlite3 \"" + DB_PATH + "\" \"SELECT nodes FROM workflow_entity WHERE id='" + WF_ID + "';\"",
    {maxBuffer: 10*1024*1024}
).toString().trim();
var nodes = JSON.parse(rawNodes);

// Boost Body Audio (50)
console.log("=== Boost Body Audio (50) ===");
console.log(JSON.stringify(nodes[50].parameters, null, 2));

// Convert Audio (44)
console.log("\n=== Convert Audio (44) ===");
console.log(JSON.stringify(nodes[44].parameters, null, 2));

// CP 저장 - TTS (35)
console.log("\n=== CP 저장 - TTS (35) ===");
console.log(JSON.stringify(nodes[35].parameters, null, 2));

// Code 노드의 ttsAudioUrl 부분만 추출
console.log("\n=== Code 노드 TTS 참조 코드 ===");
var code = nodes[25].parameters.jsCode;
var lines = code.split("\n");
lines.forEach(function(line, i) {
    if (line.indexOf("ttsAudioUrl") !== -1 || line.indexOf("Save Audio") !== -1 || line.indexOf("Boost") !== -1 || line.indexOf("Convert") !== -1) {
        console.log("  L" + (i+1) + ": " + line.trim());
    }
});
