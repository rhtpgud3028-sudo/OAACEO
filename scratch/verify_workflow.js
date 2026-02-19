const {execSync} = require("child_process");
const out = execSync("sqlite3 /root/.n8n/.n8n/database.sqlite \"SELECT nodes FROM workflow_entity WHERE id='mhPPIHjYTH4sFUDK';\"", {maxBuffer:10*1024*1024}).toString().trim();
const nodes = JSON.parse(out);

const code = nodes[25].parameters.jsCode;
console.log("=== 최종 검증 ===");
console.log("[Code 노드]");
console.log("  PHASE2-FULL:", code.includes("PHASE2-FULL") ? "YES" : "NO");
console.log("  TARGET_TOTAL:", (code.match(/TARGET_TOTAL\s*=\s*(\d+)/) || [])[1]);
console.log("  TARGET_SEGMENTS:", (code.match(/TARGET_SEGMENTS\s*=\s*(\d+)/) || [])[1]);
console.log("  OUTRO 없음:", !code.includes("OUTRO_LEN") ? "YES" : "NO");
console.log("  베리에이션:", code.includes("TRANSITION_PRESETS") ? "YES" : "NO");
console.log("  maxRetries:", (code.match(/maxRetries:\s*(\d+)/) || [])[1]);

console.log("[Wait 노드]");
console.log("  이름:", nodes[7].name);
console.log("  초:", nodes[7].parameters.amount);

console.log("[If3 노드]");
var conds = nodes[10].parameters.conditions.conditions;
console.log("  조건수:", conds.length);
conds.forEach(function(c,i) { console.log("  ", i+1, c.rightValue); });
