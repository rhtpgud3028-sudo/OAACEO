const {execSync} = require("child_process");
const fs = require("fs");

const DB_PATH = "/root/.n8n/.n8n/database.sqlite";
const WF_ID = "mhPPIHjYTH4sFUDK";

console.log("Step 1: 현재 워크플로우 노드 로드...");
var rawNodes = execSync(
    "sqlite3 \"" + DB_PATH + "\" \"SELECT nodes FROM workflow_entity WHERE id='" + WF_ID + "';\"",
    {maxBuffer: 10*1024*1024}
).toString().trim();
var nodes = JSON.parse(rawNodes);

// Topic Override 노드 (인덱스 56)
console.log("Step 2: Topic Override 노드 업데이트...");
console.log("  현재:", nodes[56].name);
var newCode = fs.readFileSync("/tmp/topic_override_v2.2.js", "utf8");
nodes[56].parameters.jsCode = newCode;
console.log("  업데이트:", newCode.length, "bytes");

// DB 저장
console.log("Step 3: DB 저장...");
var nodesJson = JSON.stringify(nodes);
var escapedJson = nodesJson.replace(/'/g, "''");
var sql = "UPDATE workflow_entity SET nodes = '" + escapedJson + "', updatedAt = datetime('now') WHERE id = '" + WF_ID + "';";
var sqlPath = "/tmp/update_topic.sql";
fs.writeFileSync(sqlPath, sql);
execSync("sqlite3 \"" + DB_PATH + "\" < \"" + sqlPath + "\"", {maxBuffer: 10*1024*1024});
console.log("  DB 저장 완료!");

// 검증
console.log("Step 4: 검증...");
var verifyRaw = execSync(
    "sqlite3 \"" + DB_PATH + "\" \"SELECT nodes FROM workflow_entity WHERE id='" + WF_ID + "';\"",
    {maxBuffer: 10*1024*1024}
).toString().trim();
var verifyNodes = JSON.parse(verifyRaw);
var topicCode = verifyNodes[56].parameters.jsCode;
console.log("  v2.2:", topicCode.includes("2.2 (2026-02-09)") ? "YES" : "NO");
console.log("  FALLBACK_TOPICS:", topicCode.includes("FALLBACK_TOPICS") ? "YES" : "NO");
console.log("  한국어 키:", topicCode.includes('"재테크"') ? "YES" : "NO");

console.log("\n✅ Topic Override v2.2 적용 완료!");
