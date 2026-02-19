# AIASF v20.6 + v6.10 적용 가이드

> **버전**: v20.6 HOOK-TTS-SEPARATION (2026-01-14)
> **목표**: 첫 1초부터 TTS 나레이션 → 이탈률 대폭 감소

---

## 🎯 핵심 변경 요약

| 구간 | 이전 (v20.5) | 이후 (v20.6) |
|------|-------------|--------------|
| 0-3초 | 인트로 영상 (무음) | **훅 TTS + 인트로 영상** |
| 3-5초 | 인트로 영상 (무음) | 인트로 타이틀 + 인트로 영상 |
| 5-50초 | 본문 TTS | 본문 TTS (동일) |

---

## 📋 적용 순서

### 1️⃣ GPT 프롬프트 업데이트 (n8n에서)

**노드**: `3. GPT 스크립트`

1. **System Prompt** 탭 열기
2. 기존 내용 → [AIASF_GPT_Prompt.md](file:///C:/Users/user/.gemini/antigravity/scratch/AIASF_GPT_Prompt.md)의 **System Prompt** 섹션 복사/붙여넣기
3. **User Prompt** 탭도 동일하게 업데이트

> ⚠️ **핵심 변경**: GPT가 `hook_text` 필드를 추가로 출력합니다!

---

### 2️⃣ ElevenLabs TTS (Hook) 노드 추가 ⭐

**위치**: 기존 `ElevenLabs TTS` 노드 **앞에** 새 노드 추가

1. **노드 추가**: `HTTP Request` 노드 생성
2. **이름**: `ElevenLabs TTS (Hook)`
3. **설정**:

```
Method: POST
URL: https://api.elevenlabs.io/v1/text-to-speech/{{ $json.voiceId }}

⚠️ Authentication 설정 (중요!):
- Authentication: Generic Credential Type 선택
- Generic Auth Type: Header Auth 선택
- Header Auth 자격증명:
  - Name: xi-api-key
  - Value: [ElevenLabs API 키 직접 입력]

Body (JSON):
{
  "text": {{ JSON.stringify($('Parse Prompts').first().json.hook_text) }},
  "model_id": "eleven_multilingual_v2",
  "voice_settings": {
    "stability": 0.5,
    "similarity_boost": 0.75
  }
}

Options:
- Response Format: File
```

> ⚠️ **주의**: `$credentials`는 expression에서 직접 접근 불가! 
> n8n의 **Authentication** 섹션에서 **Header Auth**를 설정하세요.

---

### 3️⃣ Save Hook Audio 노드 추가

**위치**: `ElevenLabs TTS (Hook)` 노드 **다음에**

1. **노드 추가**: `Code` 노드 생성
2. **이름**: `Save Hook Audio`
3. **코드**:

```javascript
const fs = require('fs');
const path = require('path');

// 고유 파일명 생성
const timestamp = Date.now();
const fileName = `hook_${timestamp}.mp3`;
const filePath = `/var/www/audio/${fileName}`;

// ElevenLabs에서 받은 바이너리 데이터 저장
const binaryData = $input.first().binary.data;
const buffer = Buffer.from(binaryData.data, 'base64');

fs.writeFileSync(filePath, buffer);

return [{
  json: {
    fileName: filePath,
    url: `https://autoshort.site/audio/${fileName}`
  }
}];
```

---

### 4️⃣ Parse Prompts 노드 수정

**노드**: `Parse Prompts` (또는 GPT 결과 파싱 노드)

**추가할 필드**:
```javascript
// 기존 필드들...
hook_text: $json.message?.content ? JSON.parse($json.message.content).hook_text : ""
```

---

### 5️⃣ Shotstack Builder Code 노드 업데이트

**노드**: `Shotstack Builder` (Code 노드)

1. 기존 코드 **전체 삭제**
2. [n8n_shotstack_builder_v20.6.js](file:///C:/Users/user/.gemini/antigravity/scratch/n8n_shotstack_builder_v20.6.js) 내용 복사/붙여넣기
3. **저장**

---

### 6️⃣ 노드 연결

```
[GPT 스크립트] 
    ↓
[Parse Prompts] (hook_text 추가!)
    ↓
┌──────────────────┬──────────────────┐
↓                  ↓                  ↓
[Kling Intro]   [DALL-E 이미지들]   [ElevenLabs TTS (Hook)] ← 🆕
    ↓              ↓                  ↓
    ↓              ↓           [Save Hook Audio] ← 🆕
    ↓              ↓                  ↓
└──────────────────┴──────────────────┘
                   ↓
            [ElevenLabs TTS] (본문)
                   ↓
            [Save Audio]
                   ↓
            [Merge Images]
                   ↓
            [Shotstack Builder] (v20.6!)
                   ↓
            [Shotstack Render]
```

---

## ✅ 테스트 체크리스트

1️⃣ 워크플로우 **Manual Trigger** 클릭

2️⃣ 각 노드 OUTPUT 확인:
- [ ] `Parse Prompts`: `hook_text` 필드 있는지?
- [ ] `Save Hook Audio`: `fileName` 있는지?
- [ ] `Shotstack Builder`: `debug.hasHookTts: true`?

3️⃣ 최종 영상 확인:
- [ ] **첫 1초부터** TTS 나레이션 들리는지?
- [ ] 훅 멘트 (0-3초) → 본문 (5초~) 자연스럽게 연결?
- [ ] 자막 정상 표시?

---

## 💰 비용 영향

| 항목 | 변경 전 | 변경 후 | 차이 |
|------|---------|---------|------|
| ElevenLabs TTS | 1회/영상 | 2회/영상 | **+$3/월** |

> 📊 **효과 예상**: 조회수 +30-50%, 리텐션 +20% → ROI 충분!

---

## ❗ 문제 발생 시

### Q: hook_text가 비어있어요
**A**: GPT 프롬프트가 v6.10으로 업데이트되었는지 확인

### Q: Save Hook Audio 에러
**A**: `/var/www/audio/` 폴더 권한 확인 (`chmod 777`)

### Q: 영상에서 훅 TTS 안 들려요
**A**: `Shotstack Builder` 코드가 v20.6인지 확인, `debug.hasHookTts` 값 체크
