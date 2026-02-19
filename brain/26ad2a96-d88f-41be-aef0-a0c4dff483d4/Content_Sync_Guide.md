# 완전한 노드 수정 가이드 (v17.0 Final)

> GPT 출력이 `script_full` → `segments[]` 구조로 변경됨에 따라
> **모든 관련 노드** 수정 필요

---

## 📋 수정 필요 노드 체크리스트

| # | 노드 | 변경 이유 | 상태 |
|---|------|----------|------|
| 1 | 3. GPT 스크립트 | System Prompt 교체 | ✅ 완료 |
| 2 | 5a. Kling 생성 Intro | intro_video_prompt 사용 | ⬜ |
| 3 | 5b. Kling 생성 Outro | outro_video_prompt 사용 | ⬜ |
| 4 | **6. Typecast TTS** | segments[].text 합치기 | ⬜ |
| 5 | 4. GPT 이미지 | segments[].image_prompt | ⬜ |
| 6 | 6. Shotstack Code | v17.0 코드 | ⬜ |

---

## 1️⃣ 「3. GPT 스크립트」 ✅ 완료

(이미 적용됨)

---

## 2️⃣ 「5a. Kling 생성 Intro」

**Body 전체 교체:**
```json
{
  "model": "kling",
  "task_type": "video_generation",
  "input": {
    "prompt": {{ JSON.stringify(JSON.parse($('3. GPT 스크립트').first().json.message.content).intro_video_prompt || "A happy Korean senior in modern apartment") }},
    "aspect_ratio": "9:16",
    "duration": 5,
    "mode": "std",
    "cfg_scale": 0.5
  }
}
```

---

## 3️⃣ 「5b. Kling 생성 Outro」

**Body 전체 교체:**
```json
{
  "model": "kling",
  "task_type": "video_generation",
  "input": {
    "prompt": {{ JSON.stringify(JSON.parse($('3. GPT 스크립트').first().json.message.content).outro_video_prompt || "Korean senior smiling, thumbs up") }},
    "aspect_ratio": "9:16",
    "duration": 5,
    "mode": "std",
    "cfg_scale": 0.5
  }
}
```

---

## 4️⃣ 「6. Typecast TTS」⚠️ 중요

**Body 전체 교체:**
```json
{
  "text": {{ JSON.stringify(JSON.parse($('3. GPT 스크립트').first().json.message.content).segments.map(s => s.text).join(' ')) }},
  "lang": "ko",
  "voice_id": "tc_5c789c32dabcfa0008b0a38d",
  "model": "ssfm-v21"
}
```

---

## 5️⃣ 「4. GPT 이미지」

**두 가지 옵션:**

### 옵션 A: 노드 삭제 (권장)
GPT 스크립트가 이미 image_prompt 생성하므로 불필요

### 옵션 B: 유지 시 Prompt 변경
```
{{ JSON.stringify(JSON.parse($('3. GPT 스크립트').first().json.message.content).segments.map(s => s.image_prompt)) }}
```

---

## 6️⃣ 「Shotstack Code」

`n8n_shotstack_builder.js` v17.0 전체 교체

---

## ⚠️ 적용 순서

1. 모든 6개 노드 수정
2. 저장
3. 전체 워크플로우 실행
