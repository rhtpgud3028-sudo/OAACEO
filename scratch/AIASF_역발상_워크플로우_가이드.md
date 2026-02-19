# AIASF 역발상 워크플로우 n8n 가이드

> **v18.1 (2026-01-02)**
> - 역발상 워크플로우: 이미지 먼저 → 스크립트 역생성
> - GPT Vision 연동

---

## 🔄 역발상 워크플로우 개요

```
기존: 주제 → 스크립트 → 이미지
역발상: 키워드 → 썸네일 이미지 → 이미지 분석 → 스크립트 역생성
```

---

## 📋 n8n 노드 추가 가이드

### 1️⃣ 새로운 노드 추가 순서

| 순서 | 노드 이름 | 타입 | 연결 위치 |
|------|----------|------|----------|
| NEW-1 | **트렌드 키워드** | HTTP Request | Trigger 다음 |
| NEW-2 | **DALL-E Thumbnail** | OpenAI | 키워드 다음 |
| NEW-3 | **GPT Vision 분석** | OpenAI | 썸네일 생성 다음 |
| 기존 | 3. GPT 스크립트 | OpenAI | Vision 분석 다음 |

### 2️⃣ 트렌드 키워드 노드 (선택적)

**HTTP Request 노드 설정:**
```
Method: GET
URL: https://trends.google.com/trends/api/dailytrends?geo=KR
```

> 💡 간단하게는 수동으로 키워드 입력도 가능

### 3️⃣ DALL-E Thumbnail 노드

**OpenAI 노드 설정:**
```
Operation: Create Image (DALL-E 3)
Prompt: {{ $json.thumbnail_prompt }}
Size: 1024x1792 (9:16 비율)
Quality: standard
```

**썸네일 프롬프트 예시:**
```
Dramatic, eye-catching thumbnail for YouTube Shorts about [주제].
Korean 50-60 age group style.
Vibrant colors, high contrast, impactful visual.
photorealistic, no text, no letters, no words, clean background
```

### 4️⃣ GPT Vision 분석 노드 ⭐

**OpenAI 노드 설정:**
```
Operation: Chat
Model: gpt-4o (Vision 지원)
```

**System Prompt:**
```
당신은 이미지 분석 전문가입니다. 
주어진 이미지를 분석하고 5060세대 한국인을 위한 유튜브 숏츠 스크립트를 역생성합니다.

분석 후 다음 JSON을 반환하세요:
{
  "image_description": "이미지 상세 설명 (한국어)",
  "mood": "분위기 (예: 따뜻한, 활기찬, 진지한)",
  "suggested_topic": "이미지 기반 추천 주제",
  "key_elements": ["요소1", "요소2", "요소3"],
  "target_emotion": "목표 감정 (호기심, 충격, 공감 등)"
}
```

**User Prompt:**
```
이 이미지를 분석해주세요.
이미지 URL: {{ $json.data[0].url }}
키워드: {{ $json.keyword }}
```

### 5️⃣ GPT 스크립트 노드 수정

기존 GPT 스크립트 노드의 **User Prompt**에 추가:

```
주제: {{ $json.topic }}
훅: {{ $json.hook }}
접근각도: {{ $json.angle }}

🔄 [역발상 모드] 이미지 분석 결과:
- 이미지 설명: {{ $('GPT Vision 분석').item.json.message.content }}
- 이 이미지에 맞는 스크립트를 작성하세요!

규칙:
1. 이미지 분석 결과를 반영한 스크립트 작성!
2. 정확히 6개 문장! 이모지 필수!
3. 각 55~65자!
4. 첫 문장은 5가지 후킹 유형 중 선택!
5. image_analysis 필드에 분석 결과 포함!
```

**GPT 출력에 추가되는 필드:**
```json
{
  "title": "...",
  "hook_type": "...",
  "script": "...",
  "image_analysis": {  // 역발상 모드 표시
    "description": "...",
    "mood": "..."
  },
  ...
}
```

---

## 🔧 n8n 워크플로우 연결 구조

```
[Trigger]
    ↓
[Code: 키워드 준비] (선택적)
    ↓
[DALL-E Thumbnail] ← NEW!
    ↓
[GPT Vision 분석] ← NEW!
    ↓
[3. GPT 스크립트] ← 수정됨 (이미지 분석 결과 포함)
    ↓
[4. Kling Intro]
    ↓
... (기존 플로우 유지)
    ↓
[Code: Shotstack JSON Builder v18.1] ← 역발상 모드 자동 감지!
```

---

## ✅ Code 노드 v18.1 자동 감지

`n8n_shotstack_builder.js` v18.1은 **자동으로 역발상 모드를 감지**합니다:

```javascript
// GPT 출력에 image_analysis 필드가 있으면 역발상 모드
if (gptData.image_analysis) {
    isReverseMode = true;
}

// 역발상 모드면 썸네일 이미지 우선 사용
if (isReverseMode && thumbnailImage) {
    // 인트로에 썸네일 사용
}
```

---

## 📋 체크리스트

### 필수 노드 추가
- [ ] DALL-E Thumbnail 노드 추가
- [ ] GPT Vision 분석 노드 추가
- [ ] GPT 스크립트 노드 User Prompt 수정
- [ ] Code 노드 v18.1로 교체

### 연결 확인
- [ ] DALL-E → GPT Vision 연결
- [ ] GPT Vision → GPT 스크립트 연결
- [ ] 전체 워크플로우 테스트
