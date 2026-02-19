// GPT 주제선정 결과 Topic 검증 + 강제 + 폴백
// 버전: 2.2 (2026-02-09) - 주제 누락 시 채널별 기본 주제 자동 생성!

// ✅ 안전한 접근 (Optional Chaining)
const brandingData = $('Branding Router').first()?.json;
const topicFromBranding = brandingData?.topic || "default";
const channelName = brandingData?.channelName || "";

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

// 🔥 채널별 키워드 검증 (한국어 topic 키 사용!)
const CHANNEL_KEYWORDS = {
    "건강": ["건강", "혈당", "당뇨", "혈압", "운동", "식단", "노화", "혈관", "면역"],
    "재테크": ["재테크", "연금", "투자", "ETF", "금", "부동산", "세금", "상속", "은퇴", "적금", "저축"],
    "전원": ["귀농", "귀촌", "시골", "농촌", "자연인", "전원", "토지"],
    "음식": ["음식", "식품", "먹거리", "건강식", "약초", "영양", "다이어트", "식단"],
    "노후": ["인생", "자녀", "부부", "노후", "처세", "가족", "관계", "은퇴생활"],
    "운동": ["운동", "걷기", "스트레칭", "근력", "헬스", "필라테스", "등산", "건강체조"],
    "국뽕": ["한국", "K-", "대한민국", "한류", "세계", "수출", "반도체", "BTS", "한식"],
    "default": []
};

// 🔴 채널별 폴백 주제 (GPT 주제선정이 빈 결과일 때!)
const FALLBACK_TOPICS = {
    "건강": {
        topics: ["아침에 물 한잔의 효과", "걷기 운동으로 혈당 관리", "50대 이후 꼭 먹어야 할 음식", "면역력 높이는 생활습관", "혈압 관리 핵심 수칙"],
        hooks: ["이것 모르면 건강 잃습니다", "50대 70%가 잘못 알고 있어요", "의사들이 꼭 하는 습관", "매일 이것만 하면 혈관이 살아납니다", "절대 하면 안 되는 건강 습관"],
        angles: ["손해회피", "숫자충격", "반전폭격", "비밀공개", "질문폭탄"]
    },
    "재테크": {
        topics: ["국민연금 수령 전략", "ISA 절세 꿀팁", "50대 ETF 투자법", "퇴직금 굴리는 법", "부동산 대출 이자 줄이기"],
        hooks: ["이거 모르면 매년 100만원 손해", "은행원도 안 알려주는 비밀", "90%가 모르는 연금 수령 전략", "세금 아끼는 가장 쉬운 방법", "지금 안 하면 노후가 위험합니다"],
        angles: ["손해회피", "비밀공개", "숫자충격", "반전폭격", "거대숫자"]
    },
    "전원": {
        topics: ["귀촌 첫 해 실수", "시골집 리모델링 비용", "텃밭 초보 가이드", "귀농 지원금 받는 법", "전원주택 장단점"],
        hooks: ["귀촌 전 이것만 알았어도", "시골살이 1년차의 현실", "정부 지원금 이렇게 많았어?", "전원주택의 숨겨진 비용", "이것 모르고 귀촌하면 후회합니다"],
        angles: ["손해회피", "반전폭격", "숫자충격", "비밀공개", "질문폭탄"]
    },
    "음식": {
        topics: ["공복에 먹으면 독이 되는 음식", "당뇨 예방 식단", "50대 꼭 먹어야 할 슈퍼푸드", "건강하게 나이 드는 식습관", "면역력 높이는 음식"],
        hooks: ["이거 아침에 먹으면 큰일납니다", "매일 먹는 이것이 독이었다", "의사가 매일 먹는 음식 3가지", "70%가 잘못 먹고 있는 음식", "이 음식 하나로 혈당이 뚝"],
        angles: ["반전폭격", "손해회피", "비밀공개", "숫자충격", "질문폭탄"]
    },
    "노후": {
        topics: ["행복한 은퇴 생활 비결", "자녀와 좋은 관계 유지법", "60대 취미 추천", "노후 외로움 극복법", "부부 관계 개선 대화법"],
        hooks: ["은퇴 후 가장 후회하는 것", "자녀에게 절대 하면 안 되는 말", "노후 행복의 비결은 이것", "60대 부부가 꼭 알아야 할 것", "인생 2막의 숨겨진 기회"],
        angles: ["반전폭격", "손해회피", "비밀공개", "질문폭탄", "숫자충격"]
    },
    "운동": {
        topics: ["50대 무릎 보호 운동", "매일 10분 걷기 효과", "근감소증 예방 운동", "집에서 하는 스트레칭", "등산이 몸에 좋은 이유"],
        hooks: ["이 운동만 하면 무릎 통증 사라집니다", "하루 10분이면 혈관이 살아납니다", "근육이 빠지면 이렇게 됩니다", "50대 절대 하면 안 되는 운동", "걷기만 했는데 혈당이 뚝"],
        angles: ["손해회피", "숫자충격", "반전폭격", "비밀공개", "질문폭탄"]
    },
    "국뽕": {
        topics: ["세계가 놀란 한국 기술", "외국인이 극찬한 한국 문화", "한국이 세계 1위인 분야", "K-푸드 열풍의 비밀", "한국 반도체 세계 시장 점유율"],
        hooks: ["세계가 한국을 부러워하는 이유", "외국인 90%가 놀라는 한국 문화", "이 분야에서 한국이 세계 1위", "전 세계가 한국 음식에 열광하는 이유", "한국이 또 해냈습니다"],
        angles: ["거대숫자", "숫자충격", "반전폭격", "비밀공개", "손해회피"]
    }
};

// 🔴 주제 누락 감지 및 폴백!
const hasTopic = gptOutput.topic || gptOutput.selected_topic;
const hasHook = gptOutput.hook;
const hasAngle = gptOutput.angle;

if (!hasTopic || !hasHook) {
    // 폴백 주제 생성!
    const fallback = FALLBACK_TOPICS[topicFromBranding];
    if (fallback) {
        const idx = Math.floor(Math.random() * fallback.topics.length);
        gptOutput.topic = gptOutput.topic || fallback.topics[idx];
        gptOutput.selected_topic = gptOutput.selected_topic || gptOutput.topic;
        gptOutput.hook = gptOutput.hook || fallback.hooks[idx];
        gptOutput.angle = gptOutput.angle || fallback.angles[idx];
        gptOutput._fallbackUsed = true;
        gptOutput._fallbackReason = "GPT 주제선정에서 topic/hook 누락 → 채널 기본 주제 사용";
    }
}

// 키워드 검증
const keywords = CHANNEL_KEYWORDS[topicFromBranding] || [];
const checkText = (gptOutput.selected_topic || "") + " " + (gptOutput.topic || "") + " " + (gptOutput.hook || "");
const isValid = topicFromBranding === "default" || keywords.length === 0 || keywords.some(kw => checkText.includes(kw));

if (!isValid) {
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
