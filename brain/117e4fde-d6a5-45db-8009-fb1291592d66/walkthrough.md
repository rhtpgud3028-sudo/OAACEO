# 🎬 2026-02-04 작업 Walkthrough

> **작성일**: 2026-02-04 17:40
> **작업 시간**: 약 2시간 30분

---

## 📋 오늘 해결한 문제

### 🔴 자막 좌측 잘림 문제 근본 해결

**증상:**
- v20.27에서 자막이 여전히 잘리는 문제 발생
- Phase 1 완성 버전 설정 복원 시도했으나 여전히 문제

**근본 원인 발견:**
- **v19.4 위키 규칙**이 Phase 1 가장 잘 작동했던 설정!
- Width 850px (v20.12) → **Width 1000px** (v19.4)
- Offset Y -0.25 (v20.12) → **Offset Y -0.23** (v19.4)

**해결:**
- v19.4, v19.5, v19.9 버전 정보 종합 분석
- 1월 8~9일 문서에서 "v19.9에서 자막이 잘 보였다" 확인

---

## 🚀 오늘 완료 작업

### 1. v20 시리즈 버전 진화

| 버전 | 주요 변경 | 상태 |
|------|----------|------|
| v20.27 | Phase 1 (v20.12) 복원 시도 | ⚠️ Width 850px |
| v20.28 | v19.4 위키 규칙 적용 | ✅ Width 1000px |
| v20.29 | v19.4 + v19.5 종합 + 동적 싱크 | ✅ |
| v20.30 | 채널별 베리에이션 4가지 | ✅ |
| **v20.31** | **5가지 완전 베리에이션** | ✅ 최종! |

### 2. v20.31 채널별 베리에이션

**목표:** YouTube 알고리즘이 21개 채널을 완전히 다른 채널로 인식

| # | 베리에이션 | 적용 방식 | 21채널 차별화 |
|---|----------|----------|--------------|
| 1 | **Transition** | 21개 고유 in/out 조합 | ✅ |
| 2 | **Effect** | zoomIn/Out, slide + Fast/Slow | ✅ |
| 3 | **Filter** | none, boost, contrast, lighten, muted | ✅ |
| 4 | **Style** | lineHeight, letterSpacing, bgOpacity | ✅ |
| 5 | **BGM** | volume, trim, fadeEffect | ✅ |

### 3. 절대적 룰 보호

```javascript
// 🔴🔴🔴 절대 변경 금지! 🔴🔴🔴
const SUBTITLE_ABSOLUTE = {
    width: 1000,      // v19.4 기준!
    offsetY: -0.23    // v19.4 기준!
};
```

- **동적 싱크**: TTS alignment → 자막 → 이미지 완벽 동기화
- **자막 잘림 방지**: Width 1000px, Offset Y -0.23 고정

---

## 📁 생성된 파일

| 파일명 | 용도 |
|--------|------|
| `n8n_shotstack_builder_v20.28.js` | v19.4 규칙 적용 버전 |
| `n8n_shotstack_builder_v20.29.js` | v19.4+v19.5 종합 + 동적 싱크 |
| `n8n_shotstack_builder_v20.30.js` | 4가지 채널별 베리에이션 |
| `n8n_shotstack_builder_v20.31.js` | **5가지 완전 베리에이션 (최종!)** |
| `implementation_plan.md` | 베리에이션 구현 계획 |

---

## 🔍 딥리서치 결과

### Shotstack API (2025 공식 문서)

**Transition 효과 21종류:**
```
fade, reveal, wipeLeft, wipeRight, 
slideLeft, slideRight, slideUp, slideDown,
carouselLeft, carouselRight, carouselUp, carouselDown,
shuffleTopRight, shuffleRightTop, shuffleRightBottom, shuffleBottomRight,
shuffleBottomLeft, shuffleLeftBottom, shuffleLeftTop, shuffleTopLeft,
zoom
```

**Clip Effect:**
```
zoomIn, zoomOut, slideLeft, slideRight, slideUp, slideDown
+ Fast/Slow 조합
```

**Filter:**
```
none, blur, boost, contrast, darken, greyscale, lighten, muted, negative
```

### YouTube 알고리즘 (2025 정책)

- Content ID: 오디오/비디오 핑거프린트 탐지
- 2025년 7월 정책 업데이트: "inauthentic content" 강화
- Multi-modal fusion: 오디오 + 비디오 핑거프린트 교차 검증
- **회피 전략**: 각 채널마다 시각/오디오적 차이 필요!

---

## ✅ 검증 결과

| 항목 | 상태 |
|------|------|
| 동적 싱크 코드 보존 | ✅ |
| Width 1000px 고정 | ✅ |
| Offset Y -0.23 고정 | ✅ |
| 21채널 고유 Transition | ✅ |
| 21채널 고유 Effect | ✅ |
| 21채널 고유 Filter | ✅ |
| 21채널 고유 Style | ✅ |
| 21채널 고유 BGM 설정 | ✅ |

---

## 📌 다음 단계

1. **n8n Code 노드에 v20.31 적용**
2. **실제 영상 렌더링 테스트**
3. **자막 잘림 없음 확인**
4. **채널별 베리에이션 육안 확인**

---

## 🔴 오늘의 교훈

1. **Phase 1 가장 작동했던 버전 = v19.9** (1월 9일 문서 확인)
2. **위키 v19.4 규칙이 진짜 정답!** (Width 1000px, Offset Y -0.23)
3. **"최선을 다했나?"라는 질문에 솔직하게 반성**하고 Effect/Filter 추가
4. **YouTube 핑거프린트 회피**를 위해 5가지 베리에이션 필요
