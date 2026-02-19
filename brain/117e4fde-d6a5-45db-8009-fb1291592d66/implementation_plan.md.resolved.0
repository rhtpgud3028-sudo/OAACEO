# v20.30 채널별 베리에이션 구현 계획

> **작성일**: 2026-02-04 17:30
> **목적**: YouTube 알고리즘이 21개 채널을 완전히 다른 채널로 인식하도록 함

---

## 🔴 절대적 룰 (건드리지 않음!)

1. **동적 싱크**: 이미지슬라이드 & 자막과 스크립트 & TTS 자연스러운 흐름
2. **자막 잘림 방지**: v19.4 Width 1000px, Offset Y -0.23 기반

---

## 📊 딥리서치 결과

### 1. YouTube 알고리즘 탐지 (2025 업데이트)

| 탐지 요소 | 위험도 | 대응 |
|----------|--------|------|
| **동일 영상 구조** | 🔴 높음 | 전환 효과 베리에이션 |
| **동일 타이밍 패턴** | 🔴 높음 | 세그먼트 길이 미세 조정 |
| **동일 시각 스타일** | 🟡 중간 | 자막 스타일 미세 베리에이션 |
| **동일 오디오 패턴** | 🟡 중간 | BGM 볼륨/트림 베리에이션 |
| **동일 메타데이터** | 🟢 낮음 | 이미 CTA/태그 다름 |

### 2. Shotstack 전환효과 (공식 문서)

```
fade, reveal, wipeLeft, wipeRight, 
slideLeft, slideRight, slideUp, slideDown,
carouselLeft, carouselRight, carouselUp, carouselDown,
shuffleTopRight, shuffleRightTop, shuffleRightBottom, shuffleBottomRight,
shuffleBottomLeft, shuffleLeftBottom, shuffleLeftTop, shuffleTopLeft,
zoom
```
**총 21개** = 21채널에 각각 1개씩 고유 할당 가능!

---

## 🎯 5가지 베리에이션 설계

### 1️⃣ 전환효과 베리에이션 (Transition)

| 채널 | In Transition | Out Transition |
|------|---------------|----------------|
| ch_1 | fade | fade |
| ch_2 | slideLeft | slideRight |
| ch_3 | slideUp | slideDown |
| ch_4 | carouselLeft | carouselRight |
| ch_5 | carouselUp | carouselDown |
| ch_6 | wipeLeft | wipeRight |
| ch_7 | reveal | fade |
| ch_8 | zoom | fade |
| ... | ... | ... |
| ch_21 | shuffleTopLeft | shuffleBottomRight |

**구현**: 채널 인덱스로 전환효과 배열에서 선택

---

### 2️⃣ 자막 스타일 미세 베리에이션

**안전 범위 내 미세 조정 (절대 룰 유지!):**

| 파라미터 | 기본값 | 베리에이션 범위 | 위험도 |
|----------|--------|-----------------|--------|
| Width | 1000px | **고정!** | 🔴 건드림 X |
| Offset Y | -0.23 | **고정!** | 🔴 건드림 X |
| lineHeight | 1.8 | 1.7 ~ 1.9 | ✅ 안전 |
| letterSpacing | 2 | 1 ~ 3 | ✅ 안전 |
| Background Opacity | 0.7 | 0.65 ~ 0.75 | ✅ 안전 |

**구현**: 채널 인덱스 기반 미세 조정

---

### 3️⃣ BGM 베리에이션

**현재**: 7개 (주제별)
**목표**: 채널별 차별화

| 파라미터 | 베리에이션 방식 |
|----------|----------------|
| Volume | 0.12 ~ 0.18 (주제별 0.15 기준 ±0.03) |
| Trim Start | 0 ~ 5초 (채널 인덱스 × 2) |
| Fade Effect | fadeIn, fadeOut, fadeInOut (채널별) |

**구현**: 채널 인덱스로 볼륨, 시작점 조정

---

### 4️⃣ 폰트 베리에이션

**대안 폰트 (서버 업로드 필요):**
1. Noto Sans KR (현재)
2. Nanum Gothic
3. Nanum Square
4. Gmarket Sans
5. BM DoHyeon
6. Cafe24 ClassicType
7. Source Han Sans

**구현 방식**:
- Branding Router에 fontFamily 추가
- 서버에 TTF 파일 업로드 후 URL 참조
- **현재는 Noto Sans KR 유지 (폰트 업로드 후 활성화)**

---

### 5️⃣ 영상 구조 베리에이션

**안전 범위 내 조정:**

| 파라미터 | 기본값 | 베리에이션 범위 | 적용 위치 |
|----------|--------|-----------------|-----------|
| Hook Length | 3초 | 2.5 ~ 3.5초 | 🔴 싱크 영향 → 미적용 |
| Slide Overlap | 0.5초 | 0.3 ~ 0.7초 | ✅ 비주얼만 적용 |
| Last Slide Extension | 0초 | 0 ~ 2초 | ✅ 안전 |

**구현**: 채널 인덱스로 오버랩/연장 조정

---

## 🔧 v20.30 구현 범위

### 적용 (코드 추가):
1. ✅ **전환효과 베리에이션** - 21개 채널 × 고유 전환
2. ✅ **자막 스타일 미세 베리에이션** - lineHeight, letterSpacing, opacity
3. ✅ **BGM 볼륨/트림 베리에이션** - 채널별 미세 차이
4. ✅ **슬라이드 오버랩 베리에이션** - 비주얼 오버랩 시간 차이

### 미적용 (절대 룰 보호):
- ❌ Width 변경 (1000px 고정)
- ❌ Offset Y 변경 (-0.23 고정)
- ❌ 동적 싱크 타이밍 변경
- ❌ 폰트 변경 (서버 업로드 전까지)

---

## 📋 검증 체크리스트

```
[ ] 모든 21채널에 고유 전환효과 적용되는가?
[ ] 자막 Width 1000px 유지되는가?
[ ] 자막 Offset Y -0.23 유지되는가?
[ ] 동적 싱크 정상 작동하는가?
[ ] 자막 잘림 없는가?
[ ] BGM 볼륨 범위 0.12~0.18인가?
[ ] 전환효과가 자막 표시에 영향 없는가?
```

---

## 🚀 코드 생성 준비 완료

**승인 시 v20.30 코드 즉시 생성합니다!**
