# AIASF Phase 2 DAY 2 이슈 해결 가이드

> **작성일**: 2026-01-26
> **버전**: v20.17 PHASE2-DAY2-FIX
> **대상 이슈**: GPT topic 강제, 자막 좌측 잘림, 65초 TTS 끊김

---

## 🔴 이슈 1: GPT 주제선정 topic 강제

### 문제
- ch_19 채널인데 `tech`가 아닌 `finance` topic 선택됨
- GPT가 Branding Router에서 받은 topic을 무시

### 해결 방법

**n8n 워크플로우에서 `GPT 주제선정` 노드 수정:**

1️⃣ **n8n 웹 UI 접속**
   - http://38.60.220.9:5678

2️⃣ **`2. GPT 주제선정` 노드 클릭**

3️⃣ **User Prompt 맨 앞에 아래 내용 추가:**

```
⛔ 절대 규칙 (최우선!):
- 이 채널의 주제는 반드시 "{{ $('Branding Router').first().json.topic }}" 입니다!
- 다른 주제 선택 절대 금지!
- JSON 출력 시 topic 필드에 반드시 "{{ $('Branding Router').first().json.topic }}" 출력!

---

[기존 User Prompt 내용...]
```

4️⃣ **저장 (Ctrl+S 또는 Save 버튼)**

### 검증 방법
- ch_19 채널로 테스트 실행
- GPT 출력에서 `topic: "tech"` 확인

---

## 🔴 이슈 2: 자막 좌측 잘림 해결

### 문제
- 자막이 좌측에서 잘려서 표시됨
- v20.16.6에서 width를 720으로 축소했더니 너무 좁음

### 변경 사항 (v20.17)

| 항목 | v20.16 | v20.17 | 효과 |
|------|--------|--------|------|
| `width` | 720px | **800px** | 자막 좌측 잘림 해결 |
| `MAX_CHARS_PER_LINE` | 11자 | **13자** | 줄바꿈 최적화 |

### 적용 방법

1️⃣ **n8n 웹 UI 접속**
   - http://38.60.220.9:5678

2️⃣ **`Shotstack JSON Builder` Code 노드 클릭**

3️⃣ **JavaScript 탭 열기**

4️⃣ **기존 코드 전체 삭제**

5️⃣ **아래 파일의 코드 전체 복사-붙여넣기:**
   - [n8n_shotstack_builder_v20.17.js](file:///C:/Users/user/.gemini/antigravity/scratch/n8n_shotstack_builder_v20.17.js)

6️⃣ **저장 (Ctrl+S)**

---

## 🔴 이슈 3: 65초 이후 TTS 없음 해결

### 문제
- TTS가 중간에 끊기고 65초까지 재생되지 않음
- 원인: TTS audio `length`가 `BODY_LEN` (60초) 고정값 사용

### 변경 사항 (v20.17)

**변경 전 (v20.16):**
```javascript
if (ttsAudioUrl) {
    audioClips.push({
        asset: { type: "audio", src: ttsAudioUrl, volume: TTS_VOLUME },
        start: BODY_START,
        length: BODY_LEN  // ❌ 항상 60초 고정
    });
}
```

**변경 후 (v20.17):**
```javascript
// 🆕 TTS 실제 길이 동적 적용
let ttsActualLength = BODY_LEN;
if (ttsAlignment) {
    const endTimes = ttsAlignment.character_end_times_seconds || [];
    if (endTimes.length > 0) {
        ttsActualLength = Math.max(...endTimes);
    }
}

if (ttsAudioUrl) {
    audioClips.push({
        asset: { type: "audio", src: ttsAudioUrl, volume: TTS_VOLUME },
        start: BODY_START,
        length: Math.max(ttsActualLength, BODY_LEN)  // ✅ 실제 TTS 길이와 60초 중 큰 값!
    });
}
```

### 효과
- TTS alignment 데이터에서 실제 오디오 길이 추출
- 65초 전체 재생 보장!

---

## 📋 전체 적용 순서

### Step 1: 워크플로우 백업

```
1️⃣ n8n UI → 워크플로우 오른쪽 상단 ⋮ 메뉴
2️⃣ "Download" 클릭
3️⃣ JSON 파일 저장 (예: AIASF_Master_backup_20260126.json)
```

---

### Step 2: GPT 주제선정 노드 수정

```
1️⃣ "2. GPT 주제선정" 노드 클릭
2️⃣ User Prompt 맨 앞에 topic 강제 규칙 추가:

   ⛔ 절대 규칙 (최우선!):
   - 이 채널의 주제는 반드시 "{{ $('Branding Router').first().json.topic }}" 입니다!
   - 다른 주제 선택 절대 금지!

3️⃣ 저장
```

---

### Step 3: Shotstack Code 노드 업데이트

```
1️⃣ "Shotstack JSON Builder" Code 노드 클릭
2️⃣ JavaScript 탭 열기
3️⃣ 기존 코드 전체 삭제 (Ctrl+A → Delete)
4️⃣ v20.17 코드 붙여넣기 (아래 파일에서 복사)
5️⃣ 저장 (Ctrl+S)
```

**📁 v20.17 코드 파일:**
[n8n_shotstack_builder_v20.17.js](file:///C:/Users/user/.gemini/antigravity/scratch/n8n_shotstack_builder_v20.17.js)

---

### Step 4: 테스트 실행

```
1️⃣ Manual Trigger 노드에서 channelId 설정:
   - 예: { "channelId": "ch_19" }

2️⃣ "Execute Workflow" 클릭

3️⃣ 결과 확인:
   - GPT 주제선정 결과: topic = "tech" ✅
   - Shotstack JSON Builder debug:
     - version: "20.17-PHASE2-DAY2-FIX" ✅
     - ttsActualLength: "55.32" (예시) ✅
   - 생성된 영상: 자막 좌측 잘림 없음 ✅
```

---

## ✅ v20.17 변경 요약

| 항목 | 변경 전 (v20.16) | 변경 후 (v20.17) |
|------|-----------------|-----------------|
| 자막 width | 720px | **800px** |
| MAX_CHARS | 11자 | **13자** |
| TTS length | BODY_LEN 고정 | **동적 (실제 TTS 길이)** |
| 버전 | 20.16-PHASE2-DYNAMIC-BRANDING | **20.17-PHASE2-DAY2-FIX** |
| debug 필드 | - | **ttsActualLength 추가** |

---

## 🆘 문제 발생 시

### 자막이 여전히 잘리면?
- width를 **850** 또는 **900**으로 추가 확대 검토

### TTS가 여전히 끊기면?
- ElevenLabs TTS 노드에서 alignment 데이터 확인
- `with-timestamps` API 사용 여부 확인

### GPT가 여전히 다른 topic 선택하면?
- System Prompt에도 topic 강제 규칙 추가 검토

---

## 📝 완료 후 체크리스트

- [ ] 워크플로우 백업 완료
- [ ] GPT 주제선정 노드 수정 완료
- [ ] Shotstack Code v20.17 적용 완료
- [ ] ch_19 테스트 실행
- [ ] 결과 영상 확인 (자막 정상, TTS 65초 전체)
- [ ] 위키 업데이트

---

**질문 있으시면 말씀해 주세요! 🚀**
