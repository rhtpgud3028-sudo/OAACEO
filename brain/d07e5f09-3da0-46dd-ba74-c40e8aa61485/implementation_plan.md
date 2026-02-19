# 인트로 TTS 분리 구현 계획

## 목표

첫 1초부터 TTS 나레이션 시작으로 이탈률 대폭 감소

| 현재 | 개선 후 |
|------|---------|
| 0-5초: 인트로 영상 (무음) | 0-3초: 훅 TTS + 인트로 영상 |
| 5-45초: 본문 TTS | 3-5초: 인트로 영상 (무음) |
| 45-50초: 아웃트로 (무음) | 5-50초: 본문 TTS |

**예상 효과**: 조회수 +30-50%, 리텐션 +20%

---

## Proposed Changes

### GPT 프롬프트

#### [MODIFY] [AIASF_GPT_Prompt.md](file:///C:/Users/user/.gemini/antigravity/scratch/AIASF_GPT_Prompt.md)

**변경 내용**:
1. `hook_text` 필드 추가 (3초 분량 훅 멘트, 15-20자)
2. 기존 `script` 8문장은 그대로 유지

**출력 JSON 변경**:
```json
{
  "hook_text": "⚠️ 약만 믿고 식사 조절 안 하면 큰일이에요!",
  "script": "문장1. 문장2. ...",
  // 기타 기존 필드
}
```

---

### Shotstack 코드

#### [MODIFY] [n8n_shotstack_builder.js](file:///C:/Users/user/.gemini/antigravity/scratch/n8n_shotstack_builder.js)

**변경 내용**:

1. **타임라인 재구성** (v20.6):
```
0-3초: 훅 TTS 오디오 + 인트로 영상 (소리 ON)
3-5초: 인트로 영상 (무음)
5-45초: 본문 TTS + 슬라이드
45-50초: 아웃트로
```

2. **훅 TTS URL 수신** (새 노드에서):
```javascript
let hookTtsUrl = "";
try {
    const filePath = $('Save Hook Audio').first()?.json?.fileName || "";
    const fileName = filePath.split('/').pop();
    if (fileName) hookTtsUrl = `https://autoshort.site/audio/${fileName}`;
} catch (e) { }
```

3. **오디오 클립 2개**:
```javascript
const audioClips = [];
// 훅 TTS (0-3초)
if (hookTtsUrl) {
    audioClips.push({ 
        asset: { type: "audio", src: hookTtsUrl }, 
        start: 0, 
        length: 3 
    });
}
// 본문 TTS (5초~)
if (ttsAudioUrl) {
    audioClips.push({ 
        asset: { type: "audio", src: ttsAudioUrl }, 
        start: 5, 
        length: BODY_LEN 
    });
}
```

4. **훅 자막 클립 추가**:
```javascript
// 훅 자막 (0-3초)
if (hookText) {
    subtitleClips.unshift({
        asset: { type: "rich-text", text: hookText, ... },
        start: 0,
        length: 3,
        ...
    });
}
```

---

### n8n 워크플로우

> [!IMPORTANT]
> n8n 워크플로우 수정은 대표님이 직접 진행해야 합니다. 아래 상세 가이드 제공.

**추가 노드**:

1️⃣ **Parse Hook Text** (Set 노드)
   - GPT 스크립트에서 `hook_text` 추출

2️⃣ **ElevenLabs TTS (Hook)** (HTTP Request 노드)
   - 훅 텍스트 → TTS 변환 (3초 분량)

3️⃣ **Save Hook Audio** (Code 노드)
   - 훅 TTS 파일 서버 저장

---

## Verification Plan

### 자동 테스트
- 없음 (n8n 워크플로우는 외부 서비스 의존)

### 수동 테스트 (대표님 진행)

**테스트 방법**:

1️⃣ n8n에서 전체 워크플로우 실행 (Manual Trigger 클릭)

2️⃣ Shotstack 렌더링 완료 후 영상 다운로드

3️⃣ 영상 확인 체크리스트:
   - [ ] 0초부터 TTS 나레이션 들리는지
   - [ ] 훅 멘트 3초 후 인트로 영상으로 전환되는지
   - [ ] 5초부터 본문 TTS 정상 재생되는지
   - [ ] 자막 타이밍 정상인지

---

## 비용 영향

| 항목 | 변경 전 | 변경 후 | 차이 |
|------|---------|---------|------|
| ElevenLabs TTS | 1회/영상 | 2회/영상 | +$3/월 |
| 워크플로우 복잡도 | 낮음 | 중간 | 노드 3개 추가 |

---

## 작업 순서

1. [x] 현재 코드 분석
2. [ ] GPT 프롬프트 수정 (hook_text 추가)
3. [ ] Shotstack 코드 수정 (v20.6)
4. [ ] n8n 노드 추가 가이드 작성
5. [ ] 대표님 검토 후 테스트
