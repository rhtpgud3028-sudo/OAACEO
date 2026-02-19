# 🚀 AIASF v20.0 추가 작업 가이드 (3가지)

> **작성일**: 2026-01-08
> **대상**: n8n 워크플로우

---

## 📋 작업 순서

```
1단계: v20.0 코드 적용 (3분)
2단계: 품질 체크 노드 추가 (5분)
3단계: 역발상 노드 추가 (15분) - 옵션
4단계: 효과음 파일 업로드 (10분) - 옵션
5단계: 테스트 (5분)
```

---

## ✅ 1단계: v20.0 코드 적용

### 작업 내용
1. n8n 열기
2. **Code 노드** (현재 `n8n_shotstack_builder.js`) 선택
3. **전체 코드 삭제**
4. `n8n_shotstack_builder_v20.js` 내용 **전체 복사**
5. **붙여넣기**
6. **저장**

### 파일 위치
```
c:\Users\user\.gemini\antigravity\scratch\n8n_shotstack_builder_v20.js
```

---

## ✅ 2단계: 품질 체크 노드 추가

### n8n 설정

| 항목 | 값 |
|------|---|
| 노드 타입 | **Code** |
| 노드 이름 | **품질 체크** |
| 위치 | Shotstack Polling 노드 **다음** |

### 코드 (전체 복사)

```javascript
// ============================================================
// AIASF 품질 자동 체크 노드
// v20.0 (2026-01-08)
// ============================================================

const renderResult = $input.first().json;

// Shotstack 응답 구조 확인
const response = renderResult.response || renderResult;
const status = response.status || response.data?.status || "unknown";
const videoUrl = response.url || response.data?.url || "";

// 품질 체크 결과
const qualityCheck = {
    status: status,
    isSuccess: status === "done",
    hasVideo: !!videoUrl,
    videoUrl: videoUrl,
    timestamp: new Date().toISOString()
};

// 실패 시 에러 발생
if (!qualityCheck.isSuccess) {
    throw new Error(`🔴 렌더링 실패! 상태: ${status}`);
}

if (!qualityCheck.hasVideo) {
    throw new Error(`🔴 비디오 URL 없음! 렌더링 확인 필요`);
}

// 성공 시 다음 노드로 전달
return [{
    json: {
        ...renderResult,
        qualityCheck: qualityCheck,
        finalVideoUrl: videoUrl
    }
}];
```

### 연결
```
[Shotstack Polling] → [품질 체크] → [YouTube Upload 또는 다음 노드]
```

---

## ✅ 3단계: 역발상 노드 추가 (옵션)

> ⚠️ 역발상 모드를 사용하려면 아래 3개 노드 추가 필요!

### 3-1. DALL-E Thumbnail 노드

| 항목 | 값 |
|------|---|
| 노드 타입 | **OpenAI** |
| Resource | **Image** |
| Operation | **Generate an Image** |
| Model | **dall-e-3** |
| 노드 이름 | **DALL-E Thumbnail** (정확히!) |

**Options 설정**:
- Resolution: **1024x1792**
- Quality: **Standard**

**Prompt**:
```
Dramatic, eye-catching thumbnail for YouTube Shorts.
Topic: {{ $json.topic || "건강한 노후" }}
Korean 50-60 age group style.
Vibrant colors, high contrast, impactful visual.
photorealistic, no text, no letters, no words, clean background
```

---

### 3-2. GPT Vision 분석 노드

| 항목 | 값 |
|------|---|
| 노드 타입 | **OpenAI** |
| Resource | **Chat** |
| Model | **gpt-4o** |
| 노드 이름 | **GPT Vision 분석** |

**System Message**:
```
당신은 이미지 분석 전문가입니다. 주어진 이미지를 분석하고 5060세대 한국인을 위한 유튜브 숏츠 스크립트를 역생성하기 위한 정보를 제공합니다.

분석 후 다음 JSON을 반환하세요:
{
  "image_description": "이미지 상세 설명 (한국어)",
  "mood": "분위기",
  "suggested_topic": "추천 주제",
  "key_elements": ["요소1", "요소2", "요소3"],
  "target_emotion": "목표 감정"
}
```

**User Message 설정**:
1. Content Type → **Array** 선택!
2. 아래 JSON 입력:

```json
[
  { "type": "text", "text": "이 이미지를 분석해주세요." },
  { "type": "image_url", "image_url": { "url": "{{ $json.data[0].url }}" } }
]
```

---

### 3-3. GPT 스크립트 노드 User Prompt 수정

기존 User Prompt **끝에** 아래 내용 추가:

```
🔄 [역발상 모드] 이미지 분석 결과:
{{ $('GPT Vision 분석').first().json.message.content }}

이 이미지 분석 결과를 반영하여 스크립트를 작성하세요!
image_analysis 필드에 위 분석 결과를 포함하세요.
```

---

### 역발상 노드 연결

**기존**:
```
[Trigger] → [3. GPT 스크립트] → ...
```

**변경**:
```
[Trigger] → [DALL-E Thumbnail] → [GPT Vision 분석] → [3. GPT 스크립트] → ...
```

---

## ✅ 4단계: 효과음 파일 업로드 (옵션)

### 다운로드 링크 (Mixkit - 무료!)

1. **Impact Sound**: https://mixkit.co/free-sound-effects/hit/
   - "Punch or kick blow" 또는 비슷한 것 선택
   - 저장: `sfx_impact.mp3`

2. **Ding Sound**: https://mixkit.co/free-sound-effects/notification/
   - "Correct answer tone" 또는 비슷한 것 선택
   - 저장: `sfx_ding.mp3`

3. **Whoosh Sound**: https://mixkit.co/free-sound-effects/whoosh/
   - "Fast swoosh" 또는 비슷한 것 선택
   - 저장: `sfx_whoosh.mp3`

### 서버 업로드

**SSH 접속 후 폴더 생성**:
```bash
ssh root@YOUR_SERVER_IP
sudo mkdir -p /var/www/html/sfx
```

**파일 업로드 (SCP)**:
```bash
scp sfx_impact.mp3 sfx_ding.mp3 sfx_whoosh.mp3 root@YOUR_SERVER_IP:/var/www/html/sfx/
```

**권한 설정**:
```bash
sudo chmod 644 /var/www/html/sfx/*.mp3
```

### 코드에서 활성화

`n8n_shotstack_builder_v20.js` 44줄:
```javascript
const ENABLE_SFX = true;  // false → true로 변경!
```

---

## ✅ 5단계: 테스트

1. **Manual Trigger** 클릭
2. 각 노드 출력 확인
3. **품질 체크** 노드에서 에러 없는지 확인
4. 최종 영상 재생

### 확인 사항

```
[ ] Code 노드 debug.checksumOK = true?
[ ] 품질 체크 노드 통과?
[ ] 자막이 이미지 위에 보이는가?
[ ] BGM 볼륨이 구간별로 다른가?
[ ] 총 영상 길이 ~50초인가?
```

---

## 📊 최종 요약

| 작업 | 시간 | 필수? |
|------|------|-------|
| v20.0 코드 적용 | 3분 | ✅ 필수 |
| 품질 체크 노드 | 5분 | ✅ 필수 |
| 역발상 노드 | 15분 | 옵션 |
| 효과음 파일 | 10분 | 옵션 |

**총 예상 시간**: 필수만 하면 **8분**, 전체 하면 **33분**

---

**대표님, 하나씩 진행하시면 됩니다!** 🔥
