# 🚀 AIASF Phase 2 n8n 적용 가이드

> **버전**: v20.16 PHASE2-DYNAMIC-BRANDING
> **작성일**: 2026-01-21
> **예상 소요시간**: 2-3시간

---

## 📋 적용 순서 체크리스트

```
[ ] Step 1: Branding Router Code 노드 추가
[ ] Step 2: ElevenLabs 노드 수정 (voice_id 동적화 + Flash 모델)
[ ] Step 3: GPT 노드 수정 (System Prompt 동적화)
[ ] Step 4: Shotstack Code 노드 업데이트 (v20.15 → v20.16)
[ ] Step 5: 테스트 실행
```

---

## Step 1: Branding Router Code 노드 추가

### 위치
Schedule Trigger → **[새 노드]** → 기존 워크플로우

### 노드 설정
- **노드 유형**: Code
- **노드 이름**: `Branding Router` (정확히!)
- **언어**: JavaScript

### 코드
파일: `n8n_branding_router.js` 전체 내용 복사

### 출력 예시
```json
{
  "channelId": "ch_1",
  "topic": "health",
  "branding": {
    "primaryColor": "#228B22",
    "subtitleBg": "rgba(34, 139, 34, 0.85)",
    ...
  },
  "voice": {
    "voiceId": "w5eZjob1kXfLB9HjpFqU",
    "voiceName": "ChulSu"
  },
  "cta": "고정 댓글에서 혈당 관리 비법 바로 확인하세요"
}
```

---

## Step 2: ElevenLabs 노드 수정

### 2-1. voice_id 동적화

**기존 (하드코딩):**
```
voice_id: "기존고정값"
```

**변경 (동적):**
```
voice_id: {{ $('Branding Router').first().json.voice.voiceId }}
```

### 2-2. Flash 모델 변경 (비용 절감!)

**기존:**
```
model_id: "eleven_multilingual_v2"
```

**변경:**
```
model_id: "eleven_flash_v2_5"
```

> ⚠️ **중요**: Flash 모델 사용 시 Pro $99로 월 100만자 사용 가능!

---

## Step 3: GPT 노드 수정 (선택사항)

### 21채널 각기 다른 페르소나 적용 시

**System Prompt 동적화:**
```
{{ $('AI Persona Router').first().json.systemPrompt }}
```

### AI Persona Router 노드 추가
파일: `n8n_ai_persona_prompts.js` 사용

---

## Step 4: Shotstack Code 노드 업데이트

### 변경 사항
- `n8n_shotstack_builder_v20.15.js` → `n8n_shotstack_builder_v20.16.js`

### 주요 변경점
```javascript
// v20.16 핵심 변경:
// 1. Phase 2 동적 브랜딩 지원 (21채널)
// 2. Branding Router 노드에서 설정 가져오기
// 3. 자막 배경색 채널별 동적 적용
// 4. BGM 볼륨 0.15로 조정
// 5. 기존 v20.15 모든 기능 유지
```

### 하위 호환성
- Branding Router 노드가 없으면 기존 Phase 1 방식으로 동작
- **기존 워크플로우에서도 v20.16 사용 가능!**

---

## Step 5: 테스트 실행

### 테스트 방법
1. Schedule Trigger 수동 실행
2. 각 노드 출력 확인:
   - Branding Router: channelId, voiceId 확인
   - ElevenLabs: 올바른 음성 사용 확인
   - Shotstack: debug.phase2Enabled = true 확인

### 성공 기준
```json
{
  "debug": {
    "version": "20.16-PHASE2-DYNAMIC-BRANDING",
    "phase2Enabled": true,
    "channelId": "ch_1",
    "brandingTopic": "health"
  }
}
```

---

## 💰 비용 업데이트

### ElevenLabs (수정됨!)

| 항목 | 기존 가정 | 검증 결과 |
|------|----------|----------|
| 플랜 | Scale $330 | **Pro $99** ✅ |
| 모델 | Multilingual v2 | **Flash v2.5** |
| 월 한도 | 500K자 | **1,000K자** (Flash 모델) |

### 월 총비용 (수정됨)

| 서비스 | 비용 |
|--------|------|
| DALL-E 3 | $480 |
| **ElevenLabs Pro** | **$99** |
| Kling AI | $360 |
| Shotstack | $117 |
| LightNode | $27 |
| **합계** | **~$1,083/월** |

> 기존 $1,314 → **$1,083** (월 $231 절약!)

---

## 📁 관련 파일

| 파일 | 용도 |
|------|------|
| `n8n_branding_router.js` | 21채널 브랜딩 설정 |
| `n8n_ai_persona_prompts.js` | 21채널 AI 페르소나 |
| `n8n_shotstack_builder_v20.16.js` | Shotstack Code 노드 |
| `AIASF_Logo_Banner_Prompts.json` | 로고/배너 생성 프롬프트 |
