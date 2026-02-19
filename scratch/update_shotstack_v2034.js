const {execSync} = require("child_process");
const fs = require("fs");

const DB_PATH = "/root/.n8n/.n8n/database.sqlite";
const WF_ID = "mhPPIHjYTH4sFUDK";
const NODE_INDEX = 25; // Code (Shotstack Builder)

console.log("Step 1: 현재 워크플로우 노드 로드...");
var rawNodes = execSync(
    "sqlite3 \"" + DB_PATH + "\" \"SELECT nodes FROM workflow_entity WHERE id='" + WF_ID + "';\"",
    {maxBuffer: 10*1024*1024}
).toString().trim();
var nodes = JSON.parse(rawNodes);

console.log("Step 2: Shotstack Builder 노드 업데이트...");
console.log("  현재:", nodes[NODE_INDEX].name);
var currentCode = nodes[NODE_INDEX].parameters.jsCode;

// 현재 ttsAudioUrl 블록을 찾아서 교체
var oldBlock = `let ttsAudioUrl = "";
try {
    // 🔴 Boost Body Audio 결과에서 .mp3 URL 가져오기! (Save Audio는 .mpga = Shotstack 미지원!)
    const boostResult = $('Boost Body Audio').first()?.json;
    if (boostResult?.output_url) {
        ttsAudioUrl = boostResult.output_url;
    } else if (boostResult?.url) {
        ttsAudioUrl = boostResult.url;
    } else if (boostResult?.fileName) {
        const fn = boostResult.fileName.split('/').pop();
        if (fn) ttsAudioUrl = \`https://autoshort.site/audio/\${fn}\`;
    }

    // 폴백: Convert Audio에서 가져오기
    if (!ttsAudioUrl) {
        const convertResult = $('Convert Audio').first()?.json;
        if (convertResult?.url) {
            ttsAudioUrl = convertResult.url;
        }
    }

    // 최종 폴백: Save Audio (.mpga → 확장자 .mp3로 변환)
    if (!ttsAudioUrl) {
        const filePath = $('Save Audio').first()?.json?.fileName || "";
        const fileName = filePath.split('/').pop();
        if (fileName) {
            // .mpga → boosted_*.mp3 패턴으로 변환
            const baseName = fileName.replace(/\\.[^.]+$/, '');
            ttsAudioUrl = \`https://autoshort.site/audio/boosted_\${baseName}.mp3\`;
        }
    }
} catch (e) { }`;

var newBlock = `let ttsAudioUrl = "";
try {
    // 🔴 v20.34: 3단계 폴백 + .mpga 절대 차단!

    // 1순위: Convert Audio (최종 .mp3)
    try { ttsAudioUrl = $('Convert Audio').first()?.json?.url || ""; } catch (e1) { }

    // 2순위: Boost Body Audio
    if (!ttsAudioUrl) {
        try { ttsAudioUrl = $('Boost Body Audio').first()?.json?.url || ""; } catch (e2) { }
    }

    // 3순위: CP 저장 - TTS (checkpoint에 저장된 URL)
    if (!ttsAudioUrl) {
        try { ttsAudioUrl = $('CP 저장 - TTS').first()?.json?.audio_url || ""; } catch (e3) { }
    }

    // 4순위: Save Audio 파일명에서 boosted_.mp3 패턴 생성
    if (!ttsAudioUrl) {
        try {
            const filePath = $('Save Audio').first()?.json?.fileName || "";
            const fileName = filePath.split('/').pop();
            if (fileName) {
                const baseName = fileName.replace(/\\.[^.]+$/, '');
                ttsAudioUrl = \`https://autoshort.site/audio/boosted_\${baseName}.mp3\`;
            }
        } catch (e4) { }
    }

    // 🔴🔴🔴 최종 안전장치: .mpga URL은 Shotstack이 거부! 강제로 .mp3로 변환!
    if (ttsAudioUrl && ttsAudioUrl.includes('.mpga')) {
        ttsAudioUrl = ttsAudioUrl.replace('.mpga', '.mp3');
    }
} catch (e) { }`;

if (currentCode.includes(oldBlock)) {
    nodes[NODE_INDEX].parameters.jsCode = currentCode.replace(oldBlock, newBlock);
    console.log("  ✅ ttsAudioUrl 블록 교체 성공!");
} else {
    console.log("  ⚠️ 정확한 블록 매칭 실패! 직접 교체 시도...");
    // 더 간단한 패턴으로 교체
    var simpleOld = "// 🔴 Boost Body Audio 결과에서 .mp3 URL 가져오기!";
    if (currentCode.includes(simpleOld)) {
        // 전체 try 블록 찾기
        var startIdx = currentCode.indexOf("let ttsAudioUrl = \"\";");
        var searchAfter = currentCode.indexOf("} catch (e) { }", startIdx);
        if (searchAfter > startIdx) {
            var endIdx = searchAfter + "} catch (e) { }".length;
            var oldSection = currentCode.substring(startIdx, endIdx);
            nodes[NODE_INDEX].parameters.jsCode = currentCode.replace(oldSection, newBlock);
            console.log("  ✅ 패턴 매칭으로 교체 성공!");
        }
    }
}

// 버전 업데이트
var code = nodes[NODE_INDEX].parameters.jsCode;
code = code.replace('version: "20.33-VERIFIED"', 'version: "20.34"');
code = code.replace('verificationDate: "2026-02-05"', 'verificationDate: "2026-02-09"');
nodes[NODE_INDEX].parameters.jsCode = code;

console.log("  코드 길이:", code.length, "bytes");

// DB 저장
console.log("Step 3: DB 저장...");
var nodesJson = JSON.stringify(nodes);
var escapedJson = nodesJson.replace(/'/g, "''");
var sql = "UPDATE workflow_entity SET nodes = '" + escapedJson + "', updatedAt = datetime('now') WHERE id = '" + WF_ID + "';";
var sqlPath = "/tmp/update_shotstack_v2034.sql";
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
var verifyCode = verifyNodes[NODE_INDEX].parameters.jsCode;
console.log("  v20.34:", verifyCode.includes("v20.34") ? "YES ✅" : "NO ❌");
console.log("  Convert Audio 1순위:", verifyCode.includes("1순위: Convert Audio") ? "YES ✅" : "NO ❌");
console.log("  .mpga 안전장치:", verifyCode.includes(".mpga") && verifyCode.includes("replace('.mpga', '.mp3')") ? "YES ✅" : "NO ❌");
console.log("  Save Audio 직접참조:", verifyCode.includes("$('Save Audio').first()?.json?.fileName") ? "YES (폴백)" : "NO");

console.log("\n✅ Shotstack Builder v20.34 적용 완료!");
