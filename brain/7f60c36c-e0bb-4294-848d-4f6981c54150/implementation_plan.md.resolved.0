# AIASF 7가지 품질 개선 구현 계획

> 📅 작성일: 2025-12-23  
> 🎯 목표: 5060세대 최적화 숏츠 품질 향상

---

## User Review Required

> [!IMPORTANT]
> **BGM 자동 선별(7번)** 구현 방식에 대한 확인 필요:
> - 옵션 A: 주제별 미리 준비된 BGM 라이브러리에서 선택
> - 옵션 B: 외부 API 연동 (예: Epidemic Sound, Pixabay Music)
> - **어떤 방식을 선호하시나요?**

> [!WARNING]
> **썸네일 자동생성(5번)**은 YouTube API에서 Shorts 업로드 시 썸네일 설정이 제한적입니다.
> - Shorts는 영상의 특정 프레임이 자동 선택됨
> - 별도 API로 커스텀 썸네일 설정 가능 여부 확인 필요

---

## Proposed Changes

### 1️⃣ 인트로 영상 프롬프트 수정

#### [MODIFY] n8n 노드: Kling 인트로 생성

**현재 문제:**
- 무섭게 생긴 아저씨
- 말하지 않고 가만히 있음 (TTS와 싱크 안 맞음)

**수정 프롬프트:**
```
A warm, friendly Korean man in his 50s with a genuine smile, 
wearing a comfortable casual outfit, 
looking directly at camera and speaking naturally with gentle hand gestures,
soft studio lighting, clean background,
approachable and trustworthy appearance
```

**핵심 포인트:**
- `genuine smile` + `speaking naturally` 추가
- `gentle hand gestures` 추가로 동작감
- `warm, friendly` 톤 강조

---

### 2️⃣ 스크립트 길이 수정 (20초 → 47초)

#### [MODIFY] n8n 노드: 3. GPT 스크립트

**현재 문제:**
- 스크립트가 20초 분량으로 너무 짧음
- 나머지 30초는 무의미하게 흘러감

**수정할 System Prompt:**
```
당신은 5060세대용 유튜브 숏츠 스크립트 작가입니다.

필수 조건:
1. 스크립트 길이: 정확히 47초 분량 (마지막 3초는 CTA용 예약)
2. 문장 수: 9-10개 문장 (각 5초씩 자막 표시)
3. 구조:
   - 문장 1-2: 후킹 (궁금증 유발)
   - 문장 3-7: 핵심 정보 전달
   - 문장 8-9: 결론 + CTA 유도

출력 형식 (JSON):
{
  "title": "임팩트 있는 영상 제목 (5060 타겟, 40자 이내)",
  "script": "전체 스크립트 (47초 분량)",
  "thumbnail_text": "썸네일 핵심 문구 (10자 이내)",
  "intro_prompt": "인트로 영상 프롬프트 (영어)",
  "outro_prompt": "아웃트로 영상 프롬프트 (영어)"
}
```

---

### 3️⃣ 자막 양옆 간격 + 폰트 크기 수정

#### [MODIFY] [n8n_shotstack_builder.js](file:///C:/Users/user/.gemini/antigravity/scratch/n8n_shotstack_builder.js)

**현재 문제:**
- Shotstack HTML 렌더링에서 padding이 제대로 적용 안 됨
- 폰트 46px → 더 크게

**수정 방안 - width 제한 방식:**
```javascript
// Line 77 수정
html: `<div style="width: 900px; margin: 0 auto; display: flex; justify-content: center; align-items: flex-end; height: 100%;">
  <span style="font-family: 'Noto Sans KR'; font-size: 52px; font-weight: bold; color: white; background: rgba(0,0,0,0.85); padding: 20px 40px; border-radius: 14px; text-align: center; word-break: keep-all; line-height: 1.5;">
    ${displayText}
  </span>
</div>`,
width: 1080,  // 전체 너비는 1080 유지
```

**변경 사항:**
- div width: 900px (양옆 90px 여백 확보)
- margin: 0 auto (중앙 정렬)
- font-size: 52px (46 → 52)

---

### 4️⃣ 영상제목 자동화

#### [MODIFY] [n8n_shotstack_builder.js](file:///C:/Users/user/.gemini/antigravity/scratch/n8n_shotstack_builder.js)

**이미 구현됨 (Line 43):**
```javascript
videoTitle = parsed.title || "AI 숏츠";
```

**필요한 수정:**
- GPT 프롬프트에서 `title` 필드 생성 조건 강화 (2번에서 처리)
- YouTube 업로드 노드에서 `videoTitle` 변수 사용 확인

---

### 5️⃣ 썸네일 자동생성 (추가 구현)

#### [NEW] n8n 노드: 썸네일 생성 (DALL-E 3)

**구현 계획:**
1. GPT에서 `thumbnail_text` 생성 (2번 프롬프트에 포함)
2. DALL-E 3로 썸네일 이미지 생성
3. YouTube 업로드 시 썸네일 설정

**프롬프트 예시:**
```
YouTube Shorts thumbnail, 
bold Korean text "${thumbnail_text}" prominently displayed,
vibrant colors, high contrast,
elderly-friendly design, large readable text,
eye-catching and curiosity-inducing
```

---

### 6️⃣ 인트로/아웃트로 분리

#### [MODIFY] n8n 워크플로우 구조

**현재:** Kling 노드 1개 → 동일 영상 인트로/아웃트로 사용

**변경:**
1. Kling 인트로 노드: `intro_prompt` 사용
2. Kling 아웃트로 노드: `outro_prompt` 사용 (CTA 강조)

**아웃트로 프롬프트 예시:**
```
Same Korean man from intro, now smiling warmly while making 
a "thumbs up" and "subscribe" gesture, 
pointing finger animation toward subscribe button area,
friendly call-to-action expression
```

#### [MODIFY] [n8n_shotstack_builder.js](file:///C:/Users/user/.gemini/antigravity/scratch/n8n_shotstack_builder.js)

```javascript
// Line 10-19 수정
let introVideoUrl = "";
try {
    introVideoUrl = $('Kling Polling Intro').first()?.json?.data?.output?.video_url || "";
} catch (e) {
    introVideoUrl = "";
}

let outroVideoUrl = "";
try {
    outroVideoUrl = $('Kling Polling Outro').first()?.json?.data?.output?.video_url || "";
} catch (e) {
    outroVideoUrl = "";
}
```

---

### 7️⃣ BGM 주제별 자동 선별

#### [MODIFY] [n8n_shotstack_builder.js](file:///C:/Users/user/.gemini/antigravity/scratch/n8n_shotstack_builder.js)

**옵션 A: 주제별 BGM 라이브러리**

```javascript
// BGM 매핑 테이블
const BGM_LIBRARY = {
    "건강": "https://autoshort.site/bgm/health_calm.mp3",
    "재테크": "https://autoshort.site/bgm/finance_upbeat.mp3",
    "운동": "https://autoshort.site/bgm/exercise_energetic.mp3",
    "음식": "https://autoshort.site/bgm/food_cozy.mp3",
    "노후": "https://autoshort.site/bgm/lifestyle_peaceful.mp3",
    "default": "https://autoshort.site/bgm/default_warm.mp3"
};

// GPT에서 카테고리 추출
const category = parsed.category || "default";
const bgmUrl = BGM_LIBRARY[category] || BGM_LIBRARY["default"];
```

> [!NOTE]
> BGM 파일은 autoshort.site 서버에 미리 업로드 필요

---

## Verification Plan

### 수동 테스트 (대표님 확인)

1. **전체 워크플로우 실행**
   - n8n에서 Manual Trigger 클릭
   - 모든 노드 정상 실행 확인

2. **결과 영상 확인 체크리스트:**
   - [ ] 인트로 영상이 친근하고 말하는 듯한 제스처가 있는가?
   - [ ] 스크립트가 47초 분량으로 충분히 긴가?
   - [ ] 자막 양옆에 여백이 있고 글씨가 더 큰가?
   - [ ] 영상 제목이 임팩트 있게 자동 생성되었는가?
   - [ ] 인트로와 아웃트로가 서로 다른 영상인가?
   - [ ] BGM이 주제와 어울리는가?

3. **YouTube 업로드 후 확인:**
   - 제목이 올바르게 설정되었는가?
   - 썸네일이 적용되었는가? (가능한 경우)

---

## 구현 순서 (권장)

| 순서 | 항목 | 난이도 | 예상 시간 |
|------|------|--------|----------|
| 1 | 자막 간격 + 폰트 (3번) | ⭐ | 10분 |
| 2 | 스크립트 길이 (2번) | ⭐⭐ | 15분 |
| 3 | 인트로 프롬프트 (1번) | ⭐ | 10분 |
| 4 | 영상제목 확인 (4번) | ⭐ | 5분 |
| 5 | 인트로/아웃트로 분리 (6번) | ⭐⭐⭐ | 30분 |
| 6 | BGM 선별 (7번) | ⭐⭐ | 20분 |
| 7 | 썸네일 (5번) | ⭐⭐⭐ | 30분 |
