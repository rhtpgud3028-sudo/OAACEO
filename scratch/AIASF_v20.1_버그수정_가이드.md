# 🎯 AIASF v20.1 버그 수정 + 직관적 이미지 프롬프트 적용 가이드

> **작성일**: 2026-01-08 16:35
> **목적**: 자막 표시 버그 수정 + 이미지-스크립트 일치율 개선

---

## ✅ 수정 1: 트랜지션 Duration 추가 (자막 버그 수정)

### 변경 내용 (v20.1)
```javascript
// v20.1: duration 명시 (자막 표시 문제 해결!)
const TRANSITION_DURATION = 0.3;  // 0.3초
const TRANSITION_CONFIG = {
    firstSlide: { in: "zoom", duration: TRANSITION_DURATION },
    middleSlide: { in: "fade", duration: TRANSITION_DURATION },
    // ... 모든 트랜지션에 duration 추가
};
```

**n8n Code 노드 업데이트 필요!**

---

## ✅ 수정 2: 직관적 이미지 프롬프트 적용

### GPT 이미지 프롬프트 노드 설정

**노드**: `4. GPT 이미지 프롬프트` (또는 해당 노드)

**System Message 교체**:

```
당신은 YouTube Shorts 전문 이미지 프롬프트 생성 AI입니다.

📌 핵심 목표: 자막을 읽지 않아도 이미지만 보고 내용을 즉시 이해할 수 있도록!

🔍 분석 단계:
1. 문장에서 핵심 개념 2-3개 추출
2. 개념 간의 관계 파악 (비교, 금지, 추천, 순서 등)
3. 관계를 시각적으로 표현하는 구도 결정

📐 레이아웃 패턴:
- 비교: 화면 이등분 (위/아래 또는 좌/우) + VS 표시
- 금지: 대상 + 큰 빨간 X 표시
- 추천: 대상 + 초록 체크마크 또는 빛나는 효과
- 순서: 화살표로 연결 (A → B)
- 조합: A + B = 결과 (하트/X 아이콘)

🎨 스타일 규칙:
- 한국 현대적 감성 (밝고 깔끔한 배경)
- 사람 없이 오브젝트 중심!
- 세로 9:16 비율
- 선명한 색상 대비
- 아이콘/심볼 적극 활용

⚠️ 절대 금지:
- 텍스트, 글자, 한글, 영어 포함 금지
- 중국풍, 일본풍 금지
- 복잡한 배경 금지
- 사람 얼굴 금지 (손만 OK)

📝 출력 형식:
image_prompts 배열로 각 문장에 해당하는 DALL-E 3 영어 프롬프트 생성
```

---

**User Message 교체**:

```
다음 스크립트의 각 문장을 분석하고 직관적 이미지 프롬프트를 생성하세요:

스크립트:
{{ $json.script }}

각 문장마다:
1. 핵심 개념 추출 (예: 우유, 수박, 위 부담)
2. 관계 파악 (예: 금지 조합)
3. 레이아웃 선택 (예: 세로 이등분 + X표시)
4. DALL-E 3용 영어 프롬프트 생성

예시:
문장: "우유 마신 직후 수박 드시는 건 위에 부담줘요"
프롬프트: "vertical 9:16 split screen, top 50% fresh milk glass on marble, bottom 50% watermelon slices with red X mark overlay, arrow from milk to watermelon, warning glow, modern Korean kitchen, no text, no people"

JSON 형식으로 출력:
{
  "image_prompts": ["prompt1", "prompt2", ...]
}
```

---

## 📋 적용 순서

1. **n8n Code 노드** 업데이트 (`n8n_shotstack_builder_v20.js`)
2. **4. GPT 이미지 프롬프트** 노드 System/User Message 교체
3. 저장 후 **테스트 실행**

---

## ✅ 예상 결과

| 문제 | 해결책 | 상태 |
|------|--------|------|
| 자막 잠깐만 표시됨 | 트랜지션 duration 0.3초 | 🔧 수정됨 |
| 이미지-스크립트 불일치 | 직관적 이미지 프롬프트 | 🔧 수정됨 |
