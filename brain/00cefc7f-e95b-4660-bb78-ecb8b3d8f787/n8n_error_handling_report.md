# n8n 자동 에러 복구 시스템 분석 보고서

## 현재 구현 상태 ✅ / ❌

### ✅ 구현됨: 워크플로우 레벨 복구 (AIASF Recovery)

| 기능 | 상태 | 설명 |
|------|------|------|
| Error Trigger | ✅ | 메인 워크플로우에 추가됨 |
| AIASF Recovery 워크플로우 | ✅ | 체크포인트 로드 → Shotstack 복구 |
| 체크포인트 시스템 | ✅ | Kling/이미지/TTS 단계별 저장 |

**동작 방식**: 워크플로우 전체 실패 → Error Trigger 발동 → Recovery 워크플로우 실행

---

### ❌ 미구현: 노드별 자동 재시도 (Retry on Fail)

| 노드 | 현재 상태 | 권장 설정 |
|------|----------|----------|
| DALL-E Thumbnail | ❌ Retry 없음 | **3회 재시도, 5초 간격** |
| DALL-E 이미지 (1~12) | ❌ Retry 없음 | **3회 재시도, 5초 간격** |
| Kling API | ❌ Retry 없음 | **3회 재시도, 10초 간격** |
| ElevenLabs TTS | ❌ Retry 없음 | **3회 재시도, 5초 간격** |
| Shotstack 렌더링 | ❌ Retry 없음 | **3회 재시도, 10초 간격** |
| YouTube 업로드 | ❌ Retry 없음 | **3회 재시도, 30초 간격** |

---

## 딥리서치 결과: n8n 에러 핸들링 4가지 방법

### 1️⃣ Node-level Retry on Fail ⭐ (권장!)
```
노드 Settings → Retry on Fail 활성화
- Retry Times: 3
- Wait Between Tries: 5000ms
- 고급: Exponential Backoff 사용 가능
```
**장점**: API 500 에러 같은 일시적 오류 자동 복구

### 2️⃣ Continue on Fail
```
노드 Settings → Continue on Fail 활성화
- 실패해도 워크플로우 계속 진행
- 에러 데이터를 다음 노드로 전달
```
**주의**: 필수 노드에는 사용 금지 (DALL-E, TTS 등)

### 3️⃣ Error Workflow (Global)
```
Settings → Error Workflow 지정
- 모든 워크플로우 실패 시 알림/로깅
```
**현재 상태**: ✅ AIASF Recovery로 구현됨

### 4️⃣ Auto-Retry Engine (고급)
```
별도 워크플로우로 실패한 실행 자동 재시도
- Schedule Trigger + n8n API 활용
```
**필요성**: 현재는 Node-level Retry로 충분

---

## 🎯 권장 구현 계획

### Phase 1: 즉시 적용 (10분)

**모든 외부 API 노드에 Retry on Fail 활성화:**

| 노드 | Retry Times | Wait (ms) | 이유 |
|------|------------|-----------|------|
| DALL-E Thumbnail | 3 | 5000 | 500 에러 대응 |
| DALL-E 이미지 (모든 노드) | 3 | 5000 | 500 에러 대응 |
| Kling API | 3 | 10000 | 처리 시간 길음 |
| ElevenLabs TTS | 3 | 5000 | 일시적 오류 |
| Shotstack 렌더링 | 3 | 10000 | 서버 부하 대응 |
| YouTube 업로드 | 3 | 30000 | 쿼터/네트워크 |

### 설정 방법

```
1️⃣ 각 노드 클릭 → Settings 탭
2️⃣ "Retry on Fail" 토글 ON
3️⃣ "Max Tries": 3
4️⃣ "Wait Between Tries (ms)": 5000 (또는 위 표 참조)
5️⃣ 저장
```

---

## 예상 효과

| 현재 | 개선 후 |
|------|--------|
| API 500 에러 → 워크플로우 중단 | 3회 자동 재시도 → 대부분 성공 |
| 수동 재실행 필요 | 자동 복구 |
| 비용 손실 위험 | 88% → **95%+ 보호** |
