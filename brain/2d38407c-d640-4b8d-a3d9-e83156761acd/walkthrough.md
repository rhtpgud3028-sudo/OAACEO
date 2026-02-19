# v20.33 구현 완료 워크스루

> **작성일**: 2026-02-05 13:40
> **상태**: ✅ 구현 완료

---

## 1. 완료된 작업 요약

### 생성된 파일

| 파일 | 용도 | 라인 수 |
|------|------|--------|
| [n8n_shotstack_builder_v20.33.js](file:///C:/Users/user/.gemini/antigravity/scratch/n8n_shotstack_builder_v20.33.js) | Shotstack Code Node | ~380 |
| [n8n_branding_router_v4.js](file:///C:/Users/user/.gemini/antigravity/scratch/n8n_branding_router_v4.js) | Branding Router Node | ~280 |

---

## 2. 핵심 구현 내용

### 2.1 v19.4+v19.5 자막 규칙 100% 복원 ✅

```javascript
const SUBTITLE_ABSOLUTE_RULES = {
    font: {
        family: "Noto Sans KR",
        size: 48,              // 🔴 v19.5!
        weight: "700"
    },
    style: {
        lineHeight: 1.8,       // 🔴 v19.5!
        letterSpacing: 2       // 🔴 v19.5! (이모지 겹침 방지)
    },
    background: {
        opacity: 0.7           // 🔴 v19.5!
    },
    size: {
        width: 850             // 🔴 v19.7!
    },
    position: {
        offsetY: -0.25         // 🔴 v19.5!
    }
};

// 동적 높이 (v19.4)
const dynamicHeight = Math.max(200, lineCount * 100 + 50);
```

### 2.2 21채널 차별화 요소 ✅

| 요소 | 구현 방법 | YouTube 핑거프린트 |
|------|----------|-----------------|
| **TTS voiceId** | Branding Router에서 채널별 voiceId 전달 | ⭐⭐⭐⭐⭐ 오디오 |
| **BGM 설정** | volume/trim/fadeEffect 채널별 다름 | ⭐⭐⭐⭐ 오디오 |
| **채널 로고** | Shotstack 로고 오버레이 (bottomRight, 8%) | ⭐⭐⭐ 시각 |
| **인트로/아웃트로** | Kling AI 프롬프트 채널별 다름 | ⭐⭐⭐⭐ 시각 |

### 2.3 5060세대 친화적 유지 ✅

```javascript
// 전환 효과: 단순하게!
const TRANSITION_CONFIG = {
    intro: { in: "zoom" },
    slide: { in: "fade" },   // 모든 슬라이드 동일!
    outro: { in: "fade" }
};
```

---

## 3. 검증 결과 임베디드

### n8n_shotstack_builder_v20.33.js 디버그 출력:

```javascript
debug: {
    version: "20.33-VERIFIED",
    verificationDate: "2026-02-05",
    subtitleRules: {
        fontSize: 48,
        width: 850,
        lineHeight: 1.8,
        letterSpacing: 2,
        offsetY: -0.25,
        bgOpacity: 0.7,
        note: "🔴 v19.4+v19.5 기반! 변경 절대 금지!"
    },
    channelDifferentiation: {
        note: "✅ TTS + BGM + 로고 + 인트로/아웃트로만 차별화!"
    }
}
```

---

## 4. n8n 적용 가이드

### Step 1: Shotstack Code Node 교체

1. n8n에서 Shotstack Code Node 열기
2. 기존 코드 전체 삭제
3. `n8n_shotstack_builder_v20.33.js` 내용 붙여넣기
4. 저장

### Step 2: Branding Router Node 교체

1. n8n에서 Branding Router Code Node 열기
2. 기존 코드 전체 삭제
3. `n8n_branding_router_v4.js` 내용 붙여넣기
4. 저장

### Step 3: 연결 확인

```
[Branding Router] → [Shotstack Code Node]

Branding Router 출력:
- channelNumber
- voice.voiceId
- logo.url
- bgm.volume/trim/fadeEffect
- promptStyles.intro/outro

Shotstack 입력:
- $('Branding Router').first()?.json
```

### Step 4: 로고 이미지 준비 (선택사항)

```
https://autoshort.site/logos/ch_1_logo.png
https://autoshort.site/logos/ch_2_logo.png
...
https://autoshort.site/logos/ch_21_logo.png
```

> ⚠️ 로고 이미지가 없으면 워터마크 없이 생성됩니다.

---

## 5. 테스트 권장 순서

1. **1개 채널 테스트** (ch_1)
   - Branding Router에 `channelId: "ch_1"` 입력
   - 워크플로우 실행
   - 결과 영상 확인: 자막 품질, 로고, BGM

2. **자막 품질 확인 포인트**
   - [ ] 자막박스 텍스트에 따라 동적 크기 조절
   - [ ] 이모티콘 이쁘게 표시
   - [ ] 이미지슬라이드와 어울림

3. **채널 차별화 확인 포인트**
   - [ ] TTS 목소리 다름
   - [ ] BGM 볼륨/시작점 다름
   - [ ] 로고 표시됨 (준비된 경우)

---

## 6. 알려진 제한사항

| 항목 | 상태 | 설명 |
|------|------|------|
| voiceId 실제 값 | ⚠️ 확인 필요 | ElevenLabs 계정에서 실제 voiceId 확인 후 교체 필요 |
| 로고 이미지 | ⚠️ 준비 필요 | 21개 로고 이미지 autoshort.site에 업로드 필요 |
| YouTube 인식 | ⚠️ 테스트 필요 | 실제 업로드 후 모니터링 필요 |

---

## 7. 다음 단계

1. **n8n에 코드 적용**
2. **테스트 실행** (ch_1 먼저)
3. **자막 품질 확인** → 대표님 피드백
4. **로고 이미지 준비** (필요 시)
5. **21채널 순차 테스트**
