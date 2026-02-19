// n8n DB에서 Shotstack API 키와 실패한 렌더 데이터 추출
const {execSync} = require("child_process");
const DB_PATH = "/root/.n8n/.n8n/database.sqlite";
const WF_ID = "mhPPIHjYTH4sFUDK";

// 1) credentials에서 Shotstack API 키 찾기
console.log("=== Shotstack API 키 확인 ===");
var credRows = execSync(
    'sqlite3 "' + DB_PATH + '" "SELECT id, name, type FROM credentials_entity;"'
).toString().trim();
console.log("Credentials:", credRows);

// 2) Shotstack 렌더링 노드(인덱스 17)의 설정 확인
console.log("\n=== Shotstack 렌더링 노드 설정 ===");
var rawNodes = execSync(
    "sqlite3 \"" + DB_PATH + "\" \"SELECT nodes FROM workflow_entity WHERE id='" + WF_ID + "';\"",
    {maxBuffer: 10*1024*1024}
).toString().trim();
var nodes = JSON.parse(rawNodes);

// 7. Shotstack 렌더링 (인덱스 17)
var shotNode = nodes[17];
console.log("Name:", shotNode.name);
console.log("URL:", shotNode.parameters.url || "N/A");
var headers = shotNode.parameters.headerParameters || shotNode.parameters.sendHeaders;
console.log("Headers:", JSON.stringify(headers).substring(0, 300));

// Shotstack Polling (인덱스 18)
var pollNode = nodes[18];
console.log("\n=== Shotstack Polling 노드 ===");
console.log("Name:", pollNode.name);
console.log("URL:", pollNode.parameters.url || "N/A");

// 3) 최근 실행에서 Code 노드의 bodyString 확인
// execution_data에서 직접 가져오기
console.log("\n=== 최근 실행 데이터 ===");
var execRows = execSync(
    'sqlite3 "' + DB_PATH + '" "SELECT id, status, startedAt, stoppedAt FROM execution_entity WHERE workflowId=\'' + WF_ID + '\' ORDER BY startedAt DESC LIMIT 3;"'
).toString().trim();
console.log(execRows);
