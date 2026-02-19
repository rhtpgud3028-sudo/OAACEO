# Shotstack v20.21 개선 계획

> **목표**: 3가지 미해결 이슈를 공식 문서 기반으로 근본 해결

## 공식 문서 검증 결과

### ✅ Shotstack TextAsset 공식 예제 (Position 102)
```json
{
  "type": "text",
  "text": "Hello World",
  "width": 400,         // ✅ Asset 내부!
  "height": 200,        // ✅ Asset 내부!
  "font": { "family": "Open Sans", "size": 24, ... },
  "background": { "padding": 10, "borderRadius": 5, ... },
  "alignment": { "horizontal": "center", "vertical": "center" }
}
```

**→ v20.19/v20.20에서 width/height를 Asset 내부에 배치한 것은 ✅ 정확함!**

---

## 현재 이슈 분석

| # | 이슈 | v20.20 시도 | 결과 | 근본 원인 |
|---|------|------------|------|----------|
| 1 | **자막 좌측 잘림** | offset.y -0.08 → -0.18 | ❓ 미확인 | position="bottom"일 때 offset 계산 방식 확인 필요 |
| 2 | **마지막 검은화면** | 마지막 슬라이드 TARGET_TOTAL까지 연장 | ❓ 미확인 | visualClips 마지막 length 계산 로직 확인 필요 |
| 3 | **topic 강제 미작동** | 여러 노드명 시도 | ❓ 미확인 | n8n 노드 이름 정확히 확인 필요 |

---

## Proposed Changes

### 1. 자막 개선 (공식 문서 기반)

#### [MODIFY] [n8n_shotstack_builder_v20.21.js](file:///C:/Users/user/.gemini/antigravity/scratch/n8n_shotstack_builder_v20.21.js)

**변경 사항:**
1. `position: "bottom"` + `offset.y` 계산 방식 수정
   - Shotstack에서 `position: "bottom"`일 때, `offset.y`는 **하단 기준 상대 위치**
   - 양수 = 위로, 음수 = 아래로 (하단 밖으로)
   - **수정**: `offset.y: 0.15` (하단에서 15% 위로 = 안전 영역)

2. **width 1000 유지** (1080의 93% = 좌우 여백 확보)

3. **백업 줄바꿈 로직** - 한글 MAX_CHARS 기준 수동 줄바꿈 추가
   - 한 줄 최대 20자로 제한
   - 자동 줄바꿈이 안 될 경우 대비

---

### 2. 검은화면 해결 (로직 수정)

**변경 사항:**
1. 마지막 이미지 클립 `length` 계산 수정
   - v20.20: `TARGET_TOTAL - imageStartTimes[i]`
   - **검증**: 이 계산이 정확한지 디버그 출력으로 확인

2. **안전장치 추가**: 마지막 슬라이드 최소 2초 보장
   ```javascript
   slideLength = Math.max(2.0, TARGET_TOTAL - imageStartTimes[i]);
   ```

---

### 3. Topic 강제 강화 (디버그 + 직접 참조)

**변경 사항:**
1. **n8n 노드 정확한 이름 확인** (대표님께 확인 요청 또는 스크린샷)
2. **디버그 출력 강화**: 어떤 노드에서 topic을 가져왔는지 명확히 출력
3. **폴백 체인**: Branding Router → 직접 입력 → GPT category 순서

---

## Verification Plan

### 1. n8n에서 테스트 실행
1. v20.21 코드를 n8n Code Node에 복사
2. 워크플로우 전체 실행
3. **확인사항**:
   - `debug.brandingDebug` 배열 확인 → 어떤 노드에서 topic 가져왔는지
   - `debug.finalCategory` 확인 → 최종 적용된 category
   - `debug.parseErrors` 확인 → 마지막 슬라이드 연장 로그

### 2. Shotstack 렌더링 결과 확인
1. Shotstack에서 렌더링 완료 후 영상 다운로드
2. **자막 확인**: 좌/우 잘림 없는지
3. **마지막 화면 확인**: 검은화면 없이 이미지가 끝까지 표시되는지
4. **BGM 확인**: topic에 맞는 BGM이 적용되었는지

---

## 🔴 대표님 확인 필요 사항

1. **n8n Branding Router 노드의 정확한 이름**은 무엇인가요?
   - "Branding Router" / "BrandingRouter" / 다른 이름?

2. **테스트 영상 결과** 스크린샷 또는 영상 공유 가능하신가요?
   - 자막 잘림 부분
   - 마지막 검은화면 부분
