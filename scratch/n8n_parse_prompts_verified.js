// ============================================================
// Parse Prompts 노드 코드 (검증완료 2026-01-20)
// ============================================================
// n8n 공식 문서 확인: 여러 아이템 반환 시 { json: {...} } 형식 필수
// https://docs.n8n.io/code/cookbook/code-node/
// ============================================================

const inputData = $('4. GPT 이미지 프롬프트').first()?.json;

let rawText = "";

// 새로운 OpenAI API 응답 구조 (2024년 이후)
if (inputData?.output?.[0]?.content?.[0]?.text) {
    rawText = inputData.output[0].content[0].text;
}
// 기존 OpenAI API 응답 구조
else if (inputData?.message?.content) {
    rawText = inputData.message.content;
}
// 직접 content 접근
else if (inputData?.content?.[0]?.text) {
    rawText = inputData.content[0].text;
}

if (!rawText) {
    return [];
}

// JSON 블록 추출
let cleaned = rawText;
if (cleaned.includes('```json')) {
    cleaned = cleaned.split('```json')[1].split('```')[0];
} else if (cleaned.includes('```')) {
    cleaned = cleaned.split('```')[1].split('```')[0];
}

// image_prompts 배열 추출
let prompts = [];
try {
    const parsed = JSON.parse(cleaned.trim());
    prompts = parsed.image_prompts || [];
} catch (e) {
    // JSON 파싱 실패 시 정규식으로 추출
    const match = rawText.match(/"image_prompts"\s*:\s*\[([\s\S]*?)\]/);
    if (match) {
        try {
            prompts = JSON.parse('[' + match[1] + ']');
        } catch (e2) {
            return [];
        }
    }
}

// ============================================================
// 핵심: n8n 여러 아이템 반환 형식!
// 반드시 { json: {...} } 형식으로 반환해야 함!
// ============================================================
return prompts.map(p => ({
    json: { prompt: p }
}));
