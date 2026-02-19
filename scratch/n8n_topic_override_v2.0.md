# n8n Topic Override Code Node
# 버전: 2.0 (2026-01-27)
# 위치: "2. GPT 주제선정" 노드 바로 뒤에 Code 노드로 추가

## 목적
GPT 주제선정이 채널과 맞지 않는 주제를 선택했을 때 검증하고 오류 발생시킴.
이를 통해 잘못된 콘텐츠 생성 방지.

## 코드

```javascript
// GPT 주제선정 결과 Topic 검증 + 강제
// 버전: 2.0 (2026-01-27) - 불일치 시 오류!

const topicFromBranding = $('Branding Router').first().json.topic;
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
    "tech": ["스마트폰", "AI", "앱", "디지털", "IT", "유튜브", "아이폰", "갤럭시", "인공지능"]
};

const keywords = CHANNEL_KEYWORDS[topicFromBranding] || [];
const checkText = (gptOutput.selected_topic || "") + " " + (gptOutput.topic || "") + " " + (gptOutput.hook || "");

const isValid = keywords.some(kw => checkText.includes(kw));

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
```

## 적용 방법
1. n8n에서 "2. GPT 주제선정" 노드 뒤에 Code 노드 추가
2. 노드 이름: "Topic Override"
3. 위 코드 붙여넣기
4. 다음 노드들은 이 노드에서 출력받도록 연결
