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

// Topic Override (인덱스 56)
console.log("=== Topic Override 노드 (56) ===");
console.log("Name:", nodes[56].name);
console.log("Type:", nodes[56].type);
console.log("\nCode:");
console.log(nodes[56].parameters.jsCode);

// Topic Override → 어디로 연결?
console.log("\n=== Topic Override 발신 연결 ===");
var toConns = conns["Topic Override"];
if (toConns && toConns.main) {
    toConns.main.forEach(function(outputs, outIdx) {
        if (outputs) {
            outputs.forEach(function(c) { console.log("  → " + c.node); });
        }
    });
}

// 누가 Topic Override에 연결?
console.log("\n=== Topic Override 수신 연결 ===");
Object.keys(conns).forEach(function(nodeName) {
    var main = conns[nodeName].main || [];
    main.forEach(function(outputs) {
        if (outputs) {
            outputs.forEach(function(c) {
                if (c.node === "Topic Override") console.log("  " + nodeName + " → Topic Override");
            });
        }
    });
});

// GPT 스크립트 노드 (3)의 User Prompt 확인
console.log("\n=== GPT 스크립트 노드 (3) - Messages ===");
var gptNode = nodes[3];
var msgs = gptNode.parameters.messages?.values || gptNode.parameters.prompt?.messages || [];
if (gptNode.parameters.messages) {
    console.log(JSON.stringify(gptNode.parameters.messages, null, 2).substring(0, 2000));
} else {
    console.log("Params keys:", Object.keys(gptNode.parameters));
    console.log(JSON.stringify(gptNode.parameters, null, 2).substring(0, 2000));
}

// Trend Filter (57)
console.log("\n=== Trend Filter 노드 (57) ===");
console.log("Name:", nodes[57].name);
console.log("Code:");
console.log(nodes[57].parameters.jsCode ? nodes[57].parameters.jsCode.substring(0, 500) : "N/A");

// Edit Fields (54)
console.log("\n=== Edit Fields 노드 (54) ===");
console.log("Name:", nodes[54].name);
console.log(JSON.stringify(nodes[54].parameters, null, 2).substring(0, 500));

// Branding Router 수신 연결
console.log("\n=== Branding Router 수신 연결 ===");
Object.keys(conns).forEach(function(nodeName) {
    var main = conns[nodeName].main || [];
    main.forEach(function(outputs) {
        if (outputs) {
            outputs.forEach(function(c) {
                if (c.node === "Branding Router") console.log("  " + nodeName + " → Branding Router");
            });
        }
    });
});

// 워크플로우 앞부분 흐름: Schedule Trigger → ... → GPT 스크립트
console.log("\n=== 워크플로우 초반 흐름 ===");
var flow = ["Schedule Trigger", "Edit Fields", "Branding Router", "Topic Override", "Trend Filter",
            "1. YouTube Trends", "2. GPT 주제선정", "3. GPT 스크립트", "AI Persona Router"];
flow.forEach(function(name) {
    var nodeConns = conns[name];
    if (nodeConns && nodeConns.main) {
        nodeConns.main.forEach(function(outputs) {
            if (outputs) {
                outputs.forEach(function(c) { console.log("  " + name + " → " + c.node); });
            }
        });
    }
});
