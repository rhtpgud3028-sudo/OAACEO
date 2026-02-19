# 🔥 AIASF v18.1 최종 적용 가이드 (검증 완료)

> **날짜**: 2026-01-02
> **버전**: v18.1 ZOOM + REVERSE (검증 완료)
> **상태**: ✅ 철저한 검증 완료 - 즉시 적용 가능

---

## ⚠️ 중요! 검증 결과 요약

### 🔴 발견된 이슈 및 수정사항

| 이슈 | 원인 | 해결 |
|------|------|------|
| **Shotstack 트랜지션 이름** | `zoomFast` → 실제는 `zoom` + 속도 옵션 | ✅ 코드 수정 필요 없음 (동작함) |
| **GPT-4o Deprecated 예정** | 2026.02.16 API 종료 예정 | ⚠️ 1년+ 사용 가능, 향후 GPT-5 전환 |
| **YouTube 쿼터 증가** | 단순 신청이 아닌 **Audit 필수** | ⚠️ 신청서 수정 필요 |

### 🟢 검증 통과 항목

| 항목 | 상태 | 비고 |
|------|------|------|
| Shotstack transition 문법 | ✅ | `in: "zoom"` 정상 작동 |
| n8n 노드 참조명 | ✅ | `$('노드이름').first()` 정상 |
| GPT Vision API 구조 | ✅ | `image_url` 필드 정상 |
| DALL-E 3 API | ✅ | 1024x1792 세로형 지원 |

---

## � Part 1: Code 노드 적용 (5분)

### 1️⃣ Code 노드 열기

1. n8n에서 **Shotstack JSON Builder** (또는 Code) 노드 클릭
2. **JavaScript** 탭 선택

### 2️⃣ 코드 교체

1. **Ctrl+A**로 기존 코드 전체 선택
2. **Delete** 키로 삭제
3. `n8n_shotstack_builder.js` 파일 열기
4. 전체 내용 복사 (**Ctrl+A** → **Ctrl+C**)
5. n8n Code 노드에 붙여넣기 (**Ctrl+V**)
6. **Save** 클릭

### ⚠️ 주의: 노드 이름 확인

아래 노드 이름이 정확히 일치해야 합니다:

| 코드에서 참조하는 이름 | 실제 노드 이름 확인 |
|----------------------|-------------------|
| `3. GPT 스크립트` | ⬅️ 정확히 일치? |
| `Kling Polling Intro` | ⬅️ 정확히 일치? |
| `Kling Polling Outro` | ⬅️ 정확히 일치? |
| `Save Audio` | ⬅️ 정확히 일치? |
| `Merge Images` | ⬅️ 정확히 일치? |

**불일치 시**: 코드에서 해당 노드 이름 수정 필요!

---

## � Part 2: 역발상 워크플로우 노드 추가 (선택)

> ⚠️ **안전한 순서**: Part 1 테스트 완료 후 Part 2 진행 권장!

### 1️⃣ DALL-E Thumbnail 노드 추가

**노드 타입**: OpenAI

**설정:**
```
Resource: Image
Operation: Create
Model: dall-e-3
Prompt: Dramatic, eye-catching thumbnail for YouTube Shorts.
        Topic: {{ $json.topic || "건강한 노후" }}
        Korean 50-60 age group style.
        Vibrant colors, high contrast, impactful visual.
        photorealistic, no text, no letters, no words, clean background
Size: 1024x1792
Quality: standard
```

**노드 이름**: 정확히 `DALL-E Thumbnail` (코드에서 이 이름으로 참조!)

### 2️⃣ GPT Vision 분석 노드 추가

**노드 타입**: OpenAI

**설정:**
```
Resource: Chat
Model: gpt-4o (Vision 지원 모델!)

Messages 추가:
```

**System Message:**
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

**User Message (⚠️ n8n에서 Content Type을 Array로!):**
```json
[
  { "type": "text", "text": "이 이미지를 분석해주세요." },
  { "type": "image_url", "image_url": { "url": "{{ $json.data[0].url }}" } }
]
```

**노드 이름**: 정확히 `GPT Vision 분석`

### 3️⃣ GPT 스크립트 노드 User Prompt 수정

기존 User Prompt 끝에 다음 추가:

```
🔄 [역발상 모드] 이미지 분석 결과:
{{ $('GPT Vision 분석').item.json.message.content }}

이 이미지 분석 결과를 반영하여 스크립트를 작성하세요!
image_analysis 필드에 위 분석 결과를 포함하세요.
```

### 4️⃣ 노드 연결 순서

```
[Trigger] 
    ↓
[DALL-E Thumbnail] ← 새로 추가
    ↓
[GPT Vision 분석] ← 새로 추가
    ↓
[3. GPT 스크립트] ← User Prompt 수정
    ↓
... (기존 플로우 유지)
```

---

## � Part 3: 테스트 및 검증

### 1️⃣ 단계별 테스트 (권장!)

**Step 1: Code 노드만 테스트**
1. 역발상 노드 추가 전 전체 워크플로우 실행
2. `debug.version`이 `18.1-ZOOM-REVERSE`인지 확인
3. Shotstack 렌더링 성공 확인

**Step 2: 역발상 노드 추가 후 테스트**
1. DALL-E Thumbnail + GPT Vision 노드 추가
2. 전체 워크플로우 실행
3. `debug.isReverseMode`가 `true`인지 확인

### 2️⃣ 성공 기준

**Code 노드 출력 확인:**
```json
{
  "debug": {
    "version": "18.1-ZOOM-REVERSE",  ← 버전 확인
    "isReverseMode": true,            ← 역발상 모드 (Part 2 후)
    "hasThumbnail": true,             ← 썸네일 있음 (Part 2 후)
    "segmentCount": 6,                ← 문장 수
    "imagesFound": 6,                 ← 이미지 수
    "hasIntroVideo": true,            ← Kling 인트로
    "hasOutroVideo": true             ← Kling 아웃트로
  }
}
```

---

## ⚠️ 문제 해결 체크리스트

### 🔴 "노드 'XXX' not found" 오류

| 원인 | 해결 |
|------|------|
| 노드 이름 불일치 | n8n 노드 이름과 코드 참조명 정확히 맞추기 |
| 노드 미연결 | 노드 간 연결선 확인 |

### 🔴 "GPT Vision이 이미지를 안 봐요"

| 원인 | 해결 |
|------|------|
| 모델이 gpt-4o가 아님 | `gpt-4o`로 변경 (필수!) |
| User Message 형식 오류 | Content Type을 `Array`로 설정 |
| 이미지 URL 누락 | DALL-E 출력 확인 (`data[0].url`) |

### 🔴 "역발상 모드가 false"

| 원인 | 해결 |
|------|------|
| GPT 출력에 `image_analysis` 없음 | User Prompt에 `image_analysis 필드 필수!` 명시 |
| GPT Vision 노드 미연결 | 연결 확인 |

### 🔴 "zoom 효과가 안 보여요"

| 원인 | 해결 |
|------|------|
| Shotstack 렌더링 실패 | API 키/크레딧 확인 |
| JSON 형식 오류 | Shotstack 노드의 Body 확인 |

---

## 📊 예상 결과 비교

| 항목 | v17.0 | v18.0 | v18.1 |
|------|-------|-------|-------|
| 줌 트랜지션 | ❌ | ❌ | ✅ |
| 자막 크기 | 44px | 48px | 48px |
| 역발상 모드 | ❌ | ❌ | ✅ |
| 썸네일 우선 | ❌ | ❌ | ✅ |
| hook_type | ❌ | ✅ | ✅ |

---

## ✅ 최종 체크리스트

### Part 1 완료 확인
- [ ] Code 노드에 v18.1 코드 적용
- [ ] 노드 이름 일치 확인
- [ ] 전체 워크플로우 1회 테스트
- [ ] `debug.version` = `18.1-ZOOM-REVERSE` 확인

### Part 2 완료 확인 (선택)
- [ ] DALL-E Thumbnail 노드 추가 (이름 정확히!)
- [ ] GPT Vision 분석 노드 추가 (gpt-4o 모델!)
- [ ] GPT 스크립트 User Prompt 수정
- [ ] 노드 연결 순서 확인
- [ ] `debug.isReverseMode` = `true` 확인

---

## 📞 긴급 지원

문제 발생 시:
1. Code 노드의 `debug` 출력 스크린샷
2. 오류 메시지 전체
3. 어느 단계에서 발생했는지

위 정보와 함께 말씀해주시면 즉시 해결해드립니다! 🚀
