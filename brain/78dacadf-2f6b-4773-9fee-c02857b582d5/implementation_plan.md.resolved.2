# Shotstack 자막 근본 해결책: CaptionAsset (VTT 파일)

## 🔴 문제점 (현재 rich-text 방식)

| 문제 | 원인 |
|------|------|
| 자막 좌/우 잘림 | rich-text의 width가 불안정하게 작동 |
| 수동 줄바꿈 충돌 | `\n`과 width 설정이 충돌 |
| 폰트 크기 제한 | 잘림 방지 위해 폰트 축소 필요 (미봉책!) |

## ✅ 근본 해결책: CaptionAsset

Shotstack의 **공식 자막 솔루션**은 `CaptionAsset`입니다.

### CaptionAsset 장점:
1. **VTT/SRT 파일** 사용 → Shotstack이 자동으로 렌더링
2. **margin**으로 위치 제어 (비율 기반, 절대 잘림 없음!)
3. **자동 줄바꿈** 지원
4. **폰트 크기 자유** (잘림 걱정 없음)

---

## 📋 구현 방안

### Step 1: n8n에서 VTT 파일 생성

ElevenLabs alignment 데이터를 활용하여 VTT 파일 생성:

```
WEBVTT

00:00:05.000 --> 00:00:11.500
여러분, 혹시 스마트폰 배터리가 빨리 닳아서 고민이신가요?

00:00:11.500 --> 00:00:18.200
오늘은 배터리 수명을 2배로 늘리는 비법을 알려드릴게요.

...
```

### Step 2: VTT 파일 서버 업로드

n8n Code 노드 또는 HTTP Request 노드로 autoshort.site에 VTT 파일 업로드:
- `https://autoshort.site/captions/{video_id}.vtt`

### Step 3: Shotstack에서 CaptionAsset 사용

```javascript
// 기존 rich-text 자막 클립 대신 CaptionAsset 사용
{
    asset: {
        type: "caption",
        src: "https://autoshort.site/captions/{video_id}.vtt",
        font: {
            family: "Noto Sans KR",
            size: 24,           // 상대 크기 (화면에 맞게 자동 조절)
            color: "#ffffff",
            stroke: "#000000",  // 테두리
            strokeWidth: 1
        },
        background: {
            color: brandColor,  // 채널 브랜드 색상
            opacity: 0.85,
            padding: 20,
            borderRadius: 10
        },
        margin: {
            top: 0.75,          // 화면 상단에서 75% (하단 자막 위치)
            left: 0.05,         // 좌측 5% 여백
            right: 0.05         // 우측 5% 여백 → 화면 90% 사용!
        }
    },
    start: BODY_START,
    length: BODY_LEN
}
```

---

## 📊 비교: rich-text vs CaptionAsset

| 항목 | rich-text (현재) | CaptionAsset (근본) |
|------|-----------------|-------------------|
| 잘림 문제 | ❌ 자주 발생 | ✅ 없음 |
| 줄바꿈 | ❌ 수동 필요 | ✅ 자동 |
| 위치 제어 | offset (불안정) | margin (비율 기반) |
| 타이밍 동기화 | 수동 계산 | VTT 파일 자동 |
| 폰트 크기 | 제한 있음 | 자유 |

---

## 🔧 구현 단계

### Phase A: VTT 파일 생성 기능 추가
1. [ ] n8n에 "VTT Generator" Code 노드 추가
2. [ ] ElevenLabs alignment 데이터 → VTT 형식 변환
3. [ ] HTTP Request로 autoshort.site에 업로드

### Phase B: Shotstack 코드 수정
1. [ ] rich-text 자막 클립 제거
2. [ ] CaptionAsset 클립 추가
3. [ ] VTT 파일 URL 참조

### Phase C: 테스트
1. [ ] 자막 잘림 없음 확인
2. [ ] 타이밍 동기화 확인
3. [ ] 다양한 텍스트 길이 테스트

---

## ⚠️ 필요 사항

1. **autoshort.site에 VTT 파일 저장 디렉토리** 필요
   - `/var/www/autoshort.site/captions/`
   - write 권한 설정

2. **upload.php 수정 또는 새 엔드포인트** 필요
   - VTT 파일 업로드 처리

---

> **이것이 근본 해결책입니다. 폰트 축소나 width 조절 같은 미봉책이 아닙니다.**
