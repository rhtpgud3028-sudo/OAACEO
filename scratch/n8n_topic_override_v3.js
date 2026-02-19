// GPT 주제선정 결과 Topic 검증 + 강제 + 폴백
// 버전: 3.0 (2026-02-11) - 7개 카테고리 최적화! - 주제 누락 시 채널별 기본 주제 자동 생성!

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
    "건강": ["건강", "혈당", "당뇨", "혈압", "운동", "식단", "노화", "혈관", "면역", "관절", "무릎", "허리"],
    "재테크": ["재테크", "연금", "투자", "ETF", "금", "부동산", "세금", "상속", "은퇴", "적금", "저축", "보험"],
    "전원": ["귀농", "귀촌", "시골", "농촌", "자연인", "전원", "토지", "텃밭", "농사"],
    "인생지혜": ["인생", "자녀", "부부", "관계", "처세", "가족", "지혜", "마음", "심리", "행복", "소통", "화해"],
    "디지털부업": ["부업", "수입", "온라인", "재취업", "창업", "쇼핑몰", "블로그", "스마트스토어", "수익", "돈벌기"],
    "중년뷰티": ["피부", "주름", "동안", "자세", "거북목", "탈모", "화장", "뷰티", "스킨케어", "교정", "스트레칭"],
    "스마트폰AI": ["스마트폰", "앱", "AI", "인공지능", "디지털", "챗봇", "인터넷", "보안", "갤럭시", "아이폰"],
    "default": []
};

// 🔴 채널별 폴백 주제 (GPT 주제선정이 빈 결과일 때!)
// v5.0: 최적화된 7개 카테고리
const FALLBACK_TOPICS = {
    "건강": {
        topics: ["아침에 물 한잔의 효과", "걷기 운동으로 혈당 관리", "50대 이후 꼭 먹어야 할 음식", "면역력 높이는 생활습관", "혈압 관리 핵심 수칙", "무릎 통증 잡는 간단 운동", "혈관 나이 되돌리는 습관"],
        hooks: ["이것 모르면 건강 잃습니다", "50대 70%가 잘못 알고 있어요", "의사들이 꼭 하는 습관", "매일 이것만 하면 혈관이 살아납니다", "절대 하면 안 되는 건강 습관", "무릎이 아프면 이것부터 하세요", "혈당 수치가 뚝 떨어집니다"],
        angles: ["손해회피", "숫자충격", "반전폭격", "비밀공개", "질문폭탄", "손해회피", "숫자충격"]
    },
    "재테크": {
        topics: ["국민연금 수령 전략", "ISA 절세 꿀팁", "50대 ETF 투자법", "퇴직금 굴리는 법", "부동산 대출 이자 줄이기", "상속세 줄이는 합법적 방법", "보험 리모델링으로 돈 아끼기"],
        hooks: ["이거 모르면 매년 100만원 손해", "은행원도 안 알려주는 비밀", "90%가 모르는 연금 수령 전략", "세금 아끼는 가장 쉬운 방법", "지금 안 하면 노후가 위험합니다", "상속세 폭탄 피하는 법", "보험료 절반으로 줄이는 방법"],
        angles: ["손해회피", "비밀공개", "숫자충격", "반전폭격", "거대숫자", "손해회피", "비밀공개"]
    },
    "전원": {
        topics: ["귀촌 첫 해 실수", "시골집 리모델링 비용", "텃밭 초보 가이드", "귀농 지원금 받는 법", "전원주택 장단점"],
        hooks: ["귀촌 전 이것만 알았어도", "시골살이 1년차의 현실", "정부 지원금 이렇게 많았어?", "전원주택의 숨겨진 비용", "이것 모르고 귀촌하면 후회합니다"],
        angles: ["손해회피", "반전폭격", "숫자충격", "비밀공개", "질문폭탄"]
    },
    "인생지혜": {
        topics: ["행복한 부부 대화법", "자녀와 거리두기 지혜", "60대 인간관계 정리법", "노후 외로움 극복 비결", "인생 2막 의미 찾기", "용서와 화해의 심리학", "감사 일기의 놀라운 효과"],
        hooks: ["은퇴 후 가장 후회하는 것", "자녀에게 절대 하면 안 되는 말", "노후 행복의 비결은 이것", "60대 부부가 꼭 알아야 할 것", "인생 2막의 숨겨진 기회", "이 한마디가 관계를 살립니다", "매일 이것만 하면 우울감이 사라져요"],
        angles: ["반전폭격", "손해회피", "비밀공개", "질문폭탄", "숫자충격", "반전폭격", "비밀공개"]
    },
    "디지털부업": {
        topics: ["50대 스마트스토어 시작법", "블로그로 월 100만원 벌기", "중년 재취업 성공 전략", "쿠팡 파트너스 수익 공개", "유튜브 없이 온라인 수익 내기", "AI로 부업하는 방법", "중년 프리랜서 되는 법"],
        hooks: ["50대도 월 100만원 부업 가능해요", "컴퓨터 못해도 됩니다 진짜로", "재취업 성공한 60대의 비결", "하루 1시간으로 용돈 벌기", "이 부업은 나이 상관없어요", "AI가 대신 돈 벌어줍니다", "퇴직 후 프리랜서로 성공한 비결"],
        angles: ["거대숫자", "비밀공개", "반전폭격", "숫자충격", "질문폭탄", "비밀공개", "반전폭격"]
    },
    "중년뷰티": {
        topics: ["10살 어려 보이는 세안법", "거북목 교정 5분 운동", "50대 피부 탄력 살리는 법", "주름 예방 생활습관", "자세교정으로 통증 잡기", "탈모 예방 두피 관리법", "동안 비결 TOP 5"],
        hooks: ["이것만 바꿔도 10살 어려 보여요", "거북목 방치하면 이렇게 됩니다", "피부과 의사가 매일 하는 습관", "이 자세가 당신을 늙게 만들어요", "탈모 시작되기 전에 이것 하세요", "50대가 꼭 써야 할 화장품 3가지", "동안인 사람들의 공통점"],
        angles: ["비밀공개", "손해회피", "숫자충격", "반전폭격", "질문폭탄", "비밀공개", "숫자충격"]
    },
    "스마트폰AI": {
        topics: ["스마트폰 숨은 기능 5가지", "AI 챗봇 활용법 초보편", "보이스피싱 예방 설정법", "카카오톡 유용한 기능", "갤럭시 배터리 오래 쓰는 법", "ChatGPT로 일상 편리하게", "스마트폰 사진 잘 찍는 법"],
        hooks: ["이 기능 아시면 진짜 편해져요", "AI가 이것까지 해준다고요?", "이 설정 안 하면 돈 뺏깁니다", "카톡에 이런 기능이 있었어요?", "배터리 50% 더 오래 가는 비밀", "ChatGPT 이렇게 쓰면 비서가 생겨요", "프로 사진작가 뺨치는 꿀팁"],
        angles: ["비밀공개", "숫자충격", "손해회피", "반전폭격", "비밀공개", "질문폭탄", "비밀공개"]
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

