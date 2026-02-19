// GPT 주제선정 결과 Topic 검증 + 강제
// 버전: 2.1 (2026-02-05) - Branding Router 없이도 동작하도록 수정!

// ✅ 안전한 접근 (Optional Chaining)
const brandingData = $('Branding Router').first()?.json;
const topicFromBranding = brandingData?.topic || "default";

const gptContent = $input.first().json.message?.content || "{}";

// JSON 파싱
let gptOutput;
try {
    let cleaned = gptContent.trim();
    if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
    if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
    if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
    gptOutput = JSON.parse(cleaned.trim());
} catch (e) {
    throw new Error("GPT 출력 파싱 실패: " + e.message);
}

// 🔥 채널별 키워드 검증!
const CHANNEL_KEYWORDS = {
    "health": ["건강", "혈당", "당뇨", "혈압", "운동", "식단", "노화", "혈관", "면역"],
    "finance": ["재테크", "연금", "투자", "ETF", "금", "부동산", "세금", "상속", "은퇴"],
    "rural": ["귀농", "귀촌", "시골", "농촌", "자연인", "전원", "토지"],
    "wisdom": ["인생", "자녀", "부부", "노후", "처세", "가족", "관계"],
    "sidejob": ["부업", "창업", "소자본", "온라인수익", "중년창업"],
    "beauty": ["피부", "동안", "미용", "자세", "패션", "주름", "화장"],
    "tech": ["스마트폰", "AI", "앱", "디지털", "IT", "유튜브", "아이폰", "갤럭시", "인공지능"],
    "default": []  // 기본값일 경우 검증 스킵
};

const keywords = CHANNEL_KEYWORDS[topicFromBranding] || [];
const checkText = (gptOutput.selected_topic || "") + " " + (gptOutput.topic || "") + " " + (gptOutput.hook || "");

// default인 경우 검증 스킵
const isValid = topicFromBranding === "default" || keywords.length === 0 || keywords.some(kw => checkText.includes(kw));

if (!isValid) {
    // 🔴 불일치 → 오류 throw → 워크플로우 실패 → 재실행!
    throw new Error(
        `❌ TOPIC MISMATCH!\n` +
        `채널: ${topicFromBranding}\n` +
        `GPT가 선택한 주제: ${gptOutput.selected_topic}\n` +
        `→ 워크플로우를 다시 실행해주세요!`
    );
}

// 일치하면 통과
gptOutput.channel = topicFromBranding;
gptOutput._validated = true;

return [{
    json: gptOutput
}];
