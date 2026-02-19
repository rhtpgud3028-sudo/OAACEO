# 콘텐츠 동기화 시스템 설계 v1.0

> **목표**: 스크립트 내용 → 이미지/영상 자동 매칭 → 하나의 톤으로 통일된 콘텐츠

---

## 🔴 현재 문제

```
자막: "호두 5알, 블루베리 한 줌은 뇌 기능 향상에..."
이미지: 의사가 환자 혈압 재는 장면 ❌
```

**원인**: GPT가 스크립트 전체 주제로 이미지 8개를 한 번에 생성 → 개별 문장과 매칭 안 됨

---

## ✅ 해결 방안: 1:1 문장-이미지 매칭

### 새로운 데이터 구조

```json
{
  "topic": "치매 예방 식단",
  "visual_theme": "modern Korean senior health lifestyle",
  "segments": [
    {
      "index": 1,
      "text": "매일 아침 호두 5알, 블루베리 한 줌은 뇌 기능 향상에 좋습니다.",
      "image_prompt": "A bright modern Korean kitchen, a bowl of 5 walnuts and fresh blueberries on a white plate, morning sunlight, clean minimal style",
      "duration": 5
    },
    {
      "index": 2,
      "text": "오메가3가 풍부한 고등어, 연어는 주 2회 섭취하세요.",
      "image_prompt": "Grilled mackerel and salmon on a Korean dining table, healthy meal, warm lighting, appetizing presentation",
      "duration": 5
    }
    // ... 8개 세그먼트
  ],
  "intro_prompt": "A happy Korean senior couple in their 60s enjoying a healthy breakfast together, modern Korean apartment, morning light",
  "outro_prompt": "Same Korean senior couple smiling at camera, thumbs up, subscribe gesture, bright and positive mood"
}
```

---

## 📐 새로운 워크플로우 설계

### Phase 1: GPT 스크립트 + 시각화 통합

```
[현재]
GPT 스크립트 → 별도 GPT 이미지 프롬프트 → DALL-E

[개선]
GPT 통합 → 스크립트 + 각 문장별 이미지 프롬프트 + 인트로/아웃트로 프롬프트
```

### 수정할 노드

#### [MODIFY] 3. GPT 스크립트

**새로운 System Prompt:**

```
You are a content creator for Korean seniors (50-60 years old).

Create a YouTube Shorts script with SYNCHRONIZED visual descriptions.

OUTPUT FORMAT (JSON):
{
  "youtube_title": "string",
  "category": "건강|재테크|운동|음식|노후|국뽕",
  "visual_theme": "overall visual style description",
  "intro_prompt": "DALL-E prompt for intro video scene",
  "outro_prompt": "DALL-E prompt for outro video scene",
  "segments": [
    {
      "text": "First sentence of script",
      "image_prompt": "DALL-E prompt that EXACTLY matches this sentence"
    },
    // ... exactly 8 segments
  ]
}

CRITICAL RULES:
1. Each segment.image_prompt MUST visually represent segment.text
2. All prompts share same visual_theme for consistency
3. Style: Modern Korean, warm colors, clean design
4. NO Chinese/Japanese elements
5. Characters: Korean people with modern fashion
```

---

### Phase 2: Shotstack 코드 수정

#### [MODIFY] n8n_shotstack_builder.js

**변경점:**
- 기존: `images[i]`로 순서대로 배치
- 개선: `segments[i].image_prompt`로 매칭된 이미지 사용

---

### Phase 3: Kling 인트로/아웃트로 동기화

#### [MODIFY] Kling Request 노드

**변경점:**
- 기존: 별도 프롬프트 사용
- 개선: GPT가 생성한 `intro_prompt`, `outro_prompt` 사용

---

## 🎨 시각적 통일성 보장

### 통일 요소

| 요소 | 일관성 방법 |
|------|------------|
| **색상** | visual_theme에 "warm pastel colors" 지정 |
| **인물** | "Korean senior couple/person" 반복 |
| **배경** | "modern Korean" 스타일 통일 |
| **분위기** | "bright, friendly, trustworthy" |

---

## 📝 수정 필요 파일

1. **GPT 스크립트 노드** - System Prompt 전체 교체
2. **GPT 이미지 노드** - 삭제 또는 통합
3. **n8n_shotstack_builder.js** - segments 구조 파싱
4. **Kling Request 노드** - prompt 소스 변경

---

## 🔧 폰트 문제 해결

**현재**: `family: "Noto Sans KR"` → 여전히 기본 폰트 표시

**원인 분석**: 
- Shotstack에서 폰트 로딩 실패
- TTF 파일 URL 접근 문제일 수 있음

**확인 필요**:
1. `https://autoshort.site/fonts/static/NotoSansKR-Bold.ttf` 접근 가능?
2. timeline.fonts 설정 확인

---

## ✅ 실행 순서

1. [ ] GPT 스크립트 노드 System Prompt 교체
2. [ ] GPT 이미지 노드 통합/수정
3. [ ] n8n_shotstack_builder.js 업데이트
4. [ ] Kling 노드 prompt 소스 변경
5. [ ] 폰트 로딩 문제 해결
6. [ ] 전체 테스트
