const {execSync} = require("child_process");
const DB_PATH = "/root/.n8n/.n8n/database.sqlite";
const WF_ID = "mhPPIHjYTH4sFUDK";

var rawConns = execSync(
    "sqlite3 \"" + DB_PATH + "\" \"SELECT connections FROM workflow_entity WHERE id='" + WF_ID + "';\"",
    {maxBuffer: 10*1024*1024}
).toString().trim();
var conns = JSON.parse(rawConns);

// 3. GPT 스크립트 수신 연결
console.log("=== 3. GPT 스크립트 수신 연결 ===");
Object.keys(conns).forEach(function(nodeName) {
    var main = conns[nodeName].main || [];
    main.forEach(function(outputs) {
        if (outputs) {
            outputs.forEach(function(c) {
                if (c.node === "3. GPT 스크립트") console.log("  " + nodeName + " → 3. GPT 스크립트");
            });
        }
    });
});

// 전체 연결 맵 (주요 노드)
console.log("\n=== 전체 초반 연결 맵 ===");
var keyNodes = [
    "Schedule Trigger", "Manual Trigger (백업)", "Edit Fields",
    "Branding Router", "AI Persona Router", "Session ID 생성",
    "1. YouTube Trends", "Trend Filter", "2. GPT 주제선정",
    "Topic Override", "3. GPT 스크립트", "4. GPT 이미지 프롬프트",
    "Parse Prompts", "Split Prompts", "5. DALL-E 3 이미지",
    "Merge Images", "DALL-E Thumbnail", "GPT Vision 분석",
    "6. ElevenLabs TTS", "ElevenLabs TTS (Hook)",
    "체크포인트 조회", "5a. Kling 생성 Intro"
];

keyNodes.forEach(function(name) {
    var nodeConns = conns[name];
    if (nodeConns && nodeConns.main) {
        nodeConns.main.forEach(function(outputs, outIdx) {
            if (outputs) {
                outputs.forEach(function(c) {
                    console.log("  " + name + " [" + outIdx + "] → " + c.node);
                });
            }
        });
    }
});
