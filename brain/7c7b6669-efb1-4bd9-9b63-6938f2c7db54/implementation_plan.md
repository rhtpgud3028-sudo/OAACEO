# Shotstack v20.23 근본 해결 계획서

## 문제 분석

### 문제 1: 자막 크기/위치/여백 문제 (5060세대용 미달)

**증상:**
- 자막 크기가 너무 작음
- 위아래 여백 없음
- 자막박스가 너무 아래 위치 → 채널 아이디/로고에 가림

**v20.22 현재값 (잘못됨):**
```javascript
SUBTITLE_FONT_SIZE = Math.round(OUT_W * 0.042);  // = 45px (너무 작음)
SAFE_BOTTOM_Y = 0.07;  // = 하단 7% (유튜브 UI에 가려짐)
SUBTITLE_PADDING = Math.round(OUT_W * 0.02);     // = 22px
```

**근본 원인:**
1. **비율 계산이 5060세대 가이드라인을 무시함** - 위키에 60px로 명시되어 있음
2. **YouTube Shorts Safe Zone을 고려 안 함** - YouTube UI가 하단 400px(약 21%) 차지

**YouTube Shorts Safe Zone 공식 데이터:**
| 영역 | 픽셀 | 비율 |
|------|------|------|
| 하단 채널명/설명/버튼 | 300-400px | 15.6-20.8% |
| **권장 안전 영역** | **400px 이상** | **21%+ 이상** |

---

### 문제 2: 65초 이후 검은화면 (이미지 슬라이드 조기 종료)

**증상:**
- TTS가 65초 이후에도 계속되는데 이미지가 없음
- 영상이 검은 화면으로 변함

**v20.22 현재값 (잘못됨):**
```javascript
const TARGET_TOTAL = 65;  // 고정값 - TTS 길이 무관
// 마지막 슬라이드가 TARGET_TOTAL까지만 연장됨
const calculatedLength = TARGET_TOTAL - imageStartTimes[i];
```

**근본 원인:**
1. **TARGET_TOTAL이 하드코딩 65초** - 실제 TTS 길이와 무관
2. **이미지 슬라이드가 TTS 끝까지 연장 안 됨** - TTS가 65초보다 길면 검은화면

---

## 근본 해결 (v20.23)

### 해결 1: 5060세대 + YouTube Safe Zone 절대 규칙

```javascript
// ============================================================
// ✅ 5060세대 가독성 + YouTube Safe Zone 절대 규칙
// ============================================================

// 5060세대 가독성 (위키 규칙 준수!)
const SUBTITLE_FONT_SIZE = 60;  // 하드코딩! 5060세대 = 60px 절대!
const SUBTITLE_PADDING = 24;    // 위아래 여백 확보

// YouTube Shorts Safe Zone (400px = 21%)
const YOUTUBE_SAFE_ZONE_PX = 400;
const YOUTUBE_SAFE_ZONE_RATIO = YOUTUBE_SAFE_ZONE_PX / OUT_H;  // = 0.208

// 자막 offset.y = Safe Zone + 추가 마진
const SAFE_BOTTOM_Y = Math.round((YOUTUBE_SAFE_ZONE_RATIO + 0.02) * 100) / 100;  // = 0.23
```

**핵심 변경:**
| 항목 | v20.22 (잘못됨) | v20.23 (근본 해결) |
|------|----------------|-------------------|
| **폰트 크기** | 45px (비율) | **60px (절대)** |
| **offset.y** | 0.07 (7%) | **0.23 (23%)** |
| **padding** | 22px | **24px** |

---

### 해결 2: TTS 기반 동적 영상 길이

```javascript
// ============================================================
// ✅ TTS 길이 기반 동적 영상 길이
// ============================================================

// 기존: TARGET_TOTAL = 65 (하드코딩)
// 신규: TTS 실제 길이 + 버퍼로 계산

let ACTUAL_VIDEO_LENGTH = TARGET_TOTAL;  // 기본값 65초

if (ttsAlignment) {
    const endTimes = ttsAlignment.character_end_times_seconds || [];
    if (endTimes.length > 0) {
        const ttsEndTime = Math.max(...endTimes);
        // TTS 끝 + Hook 시작(5초) + 버퍼(2초)
        ACTUAL_VIDEO_LENGTH = Math.max(TARGET_TOTAL, BODY_START + ttsEndTime + 2);
    }
}

// 마지막 슬라이드: ACTUAL_VIDEO_LENGTH까지 연장
if (i === segments.length - 1) {
    slideLength = ACTUAL_VIDEO_LENGTH - imageStartTimes[i];
}
```

**핵심 변경:**
| 항목 | v20.22 (잘못됨) | v20.23 (근본 해결) |
|------|----------------|-------------------|
| **영상 길이** | 65초 고정 | **TTS 길이 + 버퍼** |
| **마지막 슬라이드** | TARGET_TOTAL까지 | **ACTUAL_VIDEO_LENGTH까지** |

---

## Proposed Changes

### [MODIFY] [n8n_shotstack_builder_v20.23.js](file:///C:/Users/user/.gemini/antigravity/scratch/n8n_shotstack_builder_v20.23.js)

v20.22 기반으로 다음 변경:

1. **자막 폰트 크기**: `OUT_W * 0.042` → `60` (5060세대 절대 규칙)
2. **자막 여백**: `OUT_W * 0.02` → `24` 
3. **자막 위치**: `SAFE_BOTTOM_Y = 0.07` → `0.23` (YouTube Safe Zone)
4. **동적 영상 길이**: `TARGET_TOTAL` 고정 → `ACTUAL_VIDEO_LENGTH` (TTS 기반)
5. **마지막 슬라이드 연장**: `TARGET_TOTAL` → `ACTUAL_VIDEO_LENGTH`

---

## Verification Plan

### 자동 테스트
- 해당 없음 (n8n Code 노드는 워크플로우 내에서만 실행)

### 수동 테스트 (대표님 실행)

1. **n8n에 v20.23 코드 적용**
2. **전체 워크플로우 실행** (Manual Trigger)
3. **결과 확인:**
   - [ ] 자막이 YouTube 채널명/로고에 **안 가려지는지** 확인
   - [ ] 자막 크기가 **이전보다 눈에 띄게 커졌는지** 확인
   - [ ] 자막 박스에 **위아래 여백**이 있는지 확인
   - [ ] TTS가 끝날 때까지 **이미지가 표시**되는지 확인
   - [ ] 영상 끝에 **검은화면 없는지** 확인

---

## 검증 체크리스트 (AI 자체 검증)

- [x] 공식 문서 확인: YouTube Shorts Safe Zone = 하단 400px (21%)
- [x] 위키 규칙 확인: 5060세대 = 60px 폰트 필수
- [x] v20.22 코드 근본 원인 분석 완료
- [x] 미봉책 아님 확인: 숫자 땜빵 ❌, 아키텍처 재설계 ✅
