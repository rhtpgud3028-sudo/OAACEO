// ============================================================
// Parse Prompts v2.0 - GPT v6.19 대응 (2026-02-26 수정)
// ============================================================
// 수정 내용:
// 1. 노드 참조 변경: '4. GPT 이미지 프롬프트' → '3. GPT 스크립트'
// 2. 데이터 구조 수정: inputData[0].json.message.content 대응
// 3. Markdown 코드 블록 파싱 보강
// ============================================================

// '3. GPT 스크립트' 노드에서 데이터 가져오기
const items = $('3. GPT 스크립트').all();

if (!items || items.length === 0) {
    console.log('[Parse Prompts] ERROR: 3. GPT 스크립트 노드에서 데이터를 찾을 수 없습니다');
    return [];
}

// 첫 번째 아이템의 json 추출
const inputData = items[0].json;
let rawText = "";

// GPT 응답 구조 확인 (여러 가능성 대응)
if (inputData?.message?.content) {
    // 실제 구조: inputData.message.content
    rawText = inputData.message.content;
    console.log('[Parse Prompts] inputData.message.content에서 데이터 추출 성공');
}
else if (inputData?.output?.[0]?.content?.[0]?.text) {
    // 새로운 OpenAI API 구조
    rawText = inputData.output[0].content[0].text;
    console.log('[Parse Prompts] inputData.output[0].content[0].text에서 데이터 추출 성공');
}
else if (inputData?.content) {
    // 직접 content 접근
    if (typeof inputData.content === 'string') {
        rawText = inputData.content;
    } else if (inputData.content[0]?.text) {
        rawText = inputData.content[0].text;
    }
    console.log('[Parse Prompts] inputData.content에서 데이터 추출 성공');
}

if (!rawText) {
    console.log('[Parse Prompts] ERROR: rawText가 비어있습니다. inputData 구조:', JSON.stringify(inputData, null, 2).substring(0, 500));
    return [];
}

console.log('[Parse Prompts] rawText 추출 성공, 길이:', rawText.length);

// Markdown 코드 블록 제거 (```json ... ``` 또는 ``` ... ```)
let cleaned = rawText.trim();
if (cleaned.includes('```json')) {
    const parts = cleaned.split('```json');
    if (parts.length > 1) {
        const jsonPart = parts[1].split('```')[0];
        cleaned = jsonPart.trim();
        console.log('[Parse Prompts] ```json 블록 제거 완료');
    }
} else if (cleaned.includes('```')) {
    const parts = cleaned.split('```');
    if (parts.length > 2) {
        cleaned = parts[1].trim();
        console.log('[Parse Prompts] ``` 블록 제거 완료');
    }
}

// image_prompts 배열 추출
let prompts = [];
try {
    const parsed = JSON.parse(cleaned);
    prompts = parsed.image_prompts || [];
    console.log('[Parse Prompts] JSON 파싱 성공, image_prompts 개수:', prompts.length);
} catch (e) {
    console.log('[Parse Prompts] JSON 파싱 실패, 정규식으로 재시도:', e.message);

    // JSON 파싱 실패 시 정규식으로 추출
    const match = rawText.match(/"image_prompts"\s*:\s*\[([\s\S]*?)\]/);
    if (match) {
        try {
            const promptsText = '[' + match[1] + ']';
            prompts = JSON.parse(promptsText);
            console.log('[Parse Prompts] 정규식 추출 성공, image_prompts 개수:', prompts.length);
        } catch (e2) {
            console.log('[Parse Prompts] ERROR: 정규식 추출도 실패:', e2.message);
            return [];
        }
    } else {
        console.log('[Parse Prompts] ERROR: image_prompts 배열을 찾을 수 없습니다');
        return [];
    }
}

// 프롬프트 검증
if (!Array.isArray(prompts) || prompts.length === 0) {
    console.log('[Parse Prompts] ERROR: image_prompts가 비어있거나 배열이 아닙니다');
    return [];
}

console.log('[Parse Prompts] 최종 반환: ', prompts.length, '개 프롬프트');

// ============================================================
// 핵심: n8n 여러 아이템 반환 형식!
// 반드시 { json: {...} } 형식으로 반환해야 함!
// ============================================================
return prompts.map((p, index) => ({
    json: {
        prompt: p,
        index: index
    }
}));
