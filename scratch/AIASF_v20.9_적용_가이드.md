# AIASF v20.9 TTS-SYNC-PERFECT 적용 가이드

> **작성일**: 2026-01-16
> **버전**: v20.9 TTS-SYNC-PERFECT
> **목표**: TTS 65초 + 물흐르듯 자연스러운 자막/슬라이드 싱크

---

## 📋 변경 사항 요약

| 항목 | 변경 전 (v20.8) | 변경 후 (v20.9) |
|------|----------------|----------------|
| **GPT 프롬프트** | v6.11 (45-55자/문장, 600자) | **v6.12** (55-65자/문장, **720자+**) |
| **TTS 길이** | ~50초 (부족) | **65초** (보장!) |
| **싱크 방식** | 글자수 추정 (고정) | **ElevenLabs alignment** (동적!) |
| **ElevenLabs API** | 일반 TTS | **with-timestamps** |

---

## 🔧 적용 순서

### Step 1️⃣: ElevenLabs TTS 노드 수정

**n8n에서 ElevenLabs TTS (HTTP Request) 노드 열기**

#### 현재 설정:
```
URL: https://api.elevenlabs.io/v1/text-to-speech/{{ $json.voice_id }}
Method: POST
```

#### 변경 후:
```
URL: https://api.elevenlabs.io/v1/text-to-speech/{{ $json.voice_id }}/with-timestamps
Method: POST
Response Format: JSON (!) ← 중요! 기존 Binary → JSON으로 변경
```

#### Body 설정:
```json
{
  "text": "{{ $json.script }}",
  "model_id": "eleven_multilingual_v2",
  "voice_settings": {
    "stability": 0.5,
    "similarity_boost": 0.75
  }
}
```

#### 응답 형식 (자동으로 받음):
```json
{
  "audio_base64": "...",
  "alignment": {
    "characters": ["이", "거", " ", "진", "짜", ...],
    "character_start_times_seconds": [0.0, 0.1, 0.2, ...],
    "character_end_times_seconds": [0.1, 0.2, 0.25, ...]
  }
}
```

---

### Step 2️⃣: Audio Base64 → 파일 저장 노드 추가

ElevenLabs with-timestamps는 `audio_base64`로 오디오를 반환합니다.

#### 새 노드 추가: "Decode Audio" (Code 노드)

```javascript
// audio_base64를 바이너리로 변환
const audioBase64 = $('ElevenLabs TTS').first().json.audio_base64;
const alignment = $('ElevenLabs TTS').first().json.alignment;

// Base64 → Buffer
const binaryData = Buffer.from(audioBase64, 'base64');

return [{
  json: {
    alignment: alignment,  // alignment 데이터 전달!
    fileName: `tts_${Date.now()}.mp3`
  },
  binary: {
    data: {
      data: audioBase64,
      mimeType: 'audio/mpeg',
      fileName: `tts_${Date.now()}.mp3`
    }
  }
}];
```

#### 연결: ElevenLabs TTS → Decode Audio → Write Binary File → Upload Audio

---

### Step 3️⃣: Code 노드 업데이트 (v20.8 → v20.9)

**n8n에서 Code 노드 열기**

1️⃣ 기존 코드 전체 삭제
2️⃣ `n8n_shotstack_builder_v20.9.js` 내용 복사해서 붙여넣기
3️⃣ 저장

**v20.9 핵심 변경:**
- `USE_DYNAMIC_SYNC` 플래그 추가
- `ttsAlignment` 데이터 파싱 로직
- 문장별 실제 시간 계산 로직
- 자막/슬라이드 동적 시간 배치

---

### Step 4️⃣: GPT 스크립트 노드 프롬프트 업데이트

**n8n에서 GPT 스크립트 노드 열기**

**System Prompt 변경:**
- `AIASF_GPT_Prompt.md`의 System Prompt 섹션 복사

**User Prompt 변경 (핵심!):**
```
⛔ v6.12 절대 규칙 (TTS 65초 / 65초 영상!):
1. 정확히 12개 문장! 이모지 3-4개만!
2. 각 55~65자! ⚠️ 55자 미만 금지! (총 720자 이상 필수!)
3. 마침표로만 구분!
...
10. 🔴 최종 검증: 스크립트 총 글자수 720자 이상 확인!
```

---

## ✅ 적용 체크리스트

```
[ ] 1. ElevenLabs TTS URL에 /with-timestamps 추가
[ ] 2. ElevenLabs 응답 형식 JSON으로 변경
[ ] 3. Decode Audio 노드 추가 (audio_base64 → 바이너리)
[ ] 4. alignment 데이터가 Code 노드로 전달되는지 확인
[ ] 5. Code 노드 v20.9 코드 적용
[ ] 6. GPT 프롬프트 v6.12 적용 (55-65자, 720자+)
[ ] 7. 전체 워크플로우 테스트 실행
[ ] 8. 영상 확인 (TTS 65초, 자막 싱크)
```

---

## 🔍 디버그 확인

테스트 후 Code 노드 OUTPUT에서 확인:

```json
{
  "debug": {
    "version": "20.9-TTS-SYNC-PERFECT",
    "useDynamicSync": true,        // ← true여야 함!
    "hasAlignment": true,          // ← true여야 함!
    "syncOffset": "dynamic",       // ← "dynamic"이어야 함!
    "segmentTimes": ["5.20", "4.80", ...],  // ← 동적 시간
    "parseErrors": ["✅ Dynamic sync enabled with alignment data!"]
  }
}
```

**만약 `useDynamicSync: false`라면:**
- ElevenLabs 응답에서 alignment 데이터가 없는 것
- API URL 확인 (`/with-timestamps` 있는지)
- Response Format 확인 (JSON인지)

---

## 📝 노드 연결 순서

```
[Manual Trigger]
    ↓
[GPT 주제 선정]
    ↓
[3. GPT 스크립트] ← v6.12 프롬프트 적용!
    ↓
[ElevenLabs TTS] ← /with-timestamps API!
    ↓
[Decode Audio] ← 🆕 추가!
    ↓
[Write Binary File]
    ↓
[Upload Audio]
    ↓
[Kling Polling Intro]
    ↓
[DALL-E Images...]
    ↓
[Merge Images]
    ↓
[Code 노드] ← v20.9 적용!
    ↓
[Shotstack 렌더링]
    ↓
[YouTube 업로드]
```

---

## ⚠️ 주의사항

1. **ElevenLabs with-timestamps는 동일 비용!**
   - 일반 TTS와 가격 동일 ($0.30/1K chars)
   - 추가 과금 없음

2. **alignment 정확도**
   - ElevenLabs alignment는 문자 수준 정확도
   - 한글 지원 완벽

3. **폴백 모드**
   - alignment 데이터 없으면 자동으로 기존 방식 사용
   - 기존 워크플로우와 호환됨

---

## 📌 예상 결과

| 항목 | 변경 전 | 변경 후 |
|------|--------|--------|
| TTS 길이 | 50초 | **65초** |
| 자막 싱크 | 1-2초 오차 | **0.1초 이내** |
| 슬라이드 싱크 | 부자연스러움 | **물흐르듯 자연스러움** |

---

**Phase1 완성까지 한 발 남았습니다!** 🚀
