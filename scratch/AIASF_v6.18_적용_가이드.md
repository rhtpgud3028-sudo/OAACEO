# AIASF v6.18 + v5.1 + v20.39 적용 가이드

> **작성일**: 2026-02-22
> **목적**: 5대 크리티컬 이슈 해결 (BGM/인트로 TTS/스크립트 잘림/이미지 품질/TTS 매칭)

---

## 🎯 **개요**

3개 노드를 수동으로 업데이트하여 모든 크리티컬 이슈를 해결합니다.

### **해결되는 문제:**
1. ✅ BGM 없음 → 볼륨 0.30~0.40 (2배+ 상향)
2. ✅ 인트로 무음 → 0~5초 강력한 후킹 TTS
3. ✅ 스크립트 잘림 → 동적 영상 길이
4. ✅ 이미지 촌스러움 → 고품질 프로페셔널 사진
5. ✅ TTS 주제 미스매칭 → 카테고리별 적절한 보이스

---

## 📋 **업데이트 절차** (소요 시간: 약 10분)

### **STEP 1: n8n 워크플로우 열기**

```bash
# 브라우저에서 열기
http://38.60.220.9:5678/workflow/mhPPIHjYTH4sFUDK
```

---

### **STEP 2: Branding Router v5.1 적용** ⏱️ 2분

**1. 코드 복사**
```bash
cat /home/user/OAACEO/scratch/n8n_branding_router_v5.1.js
```

**2. n8n UI에서 적용**
- "Branding Router" 노드 클릭
- Code 탭 열기
- **전체 코드 선택 (Ctrl+A) → 삭제**
- 복사한 v5.1 코드 붙여넣기
- "Save" 버튼 클릭

**3. 변경사항 확인**
- BGM 볼륨: 0.13~0.18 → 0.30~0.40 (2배+ 상향)
- 카테고리별 TTS 매칭: 용서(인생지혜) = Jjeong (차분함)

---

### **STEP 3: Shotstack Builder v20.39 적용** ⏱️ 2분

**1. 코드 복사**
```bash
cat /home/user/OAACEO/scratch/n8n_shotstack_builder_v20.39.js
```

**2. n8n UI에서 적용**
- "Code" 노드 클릭 (Shotstack Builder)
- Code 탭 열기
- **전체 코드 선택 (Ctrl+A) → 삭제**
- 복사한 v20.39 코드 붙여넣기
- "Save" 버튼 클릭

**3. 변경사항 확인**
- 13문장 구조: 인트로 후킹 + 본문 12
- 인트로 TTS: 0초부터 시작 (기존 5초 → 0초)
- TTS 볼륨: 1.0 명시
- 동적 영상 길이: TTS 실제 길이 기반

---

### **STEP 4: GPT Prompt v6.18 적용** ⏱️ 5분

**1. 프롬프트 파일 열기**
```bash
cat /home/user/OAACEO/scratch/AIASF_GPT_Prompt_v6.18.md
```

**2. System Prompt 복사**
- 파일에서 "## System Prompt (n8n에 붙여넣기)" 섹션 찾기
- 첫 번째 ``` 부터 마지막 ``` 까지 **내용만** 복사 (```는 제외!)

**3. n8n UI에서 System Prompt 적용**
- "3. GPT 스크립트" 노드 클릭
- "Messages" 섹션 → "System" 메시지 찾기
- 기존 System Prompt **전체 삭제**
- 복사한 v6.18 System Prompt 붙여넣기

**4. User Prompt 복사**
- 파일에서 "## User Prompt (n8n에 붙여넣기)" 섹션 찾기
- ``` 부터 ``` 까지 **내용만** 복사

**5. n8n UI에서 User Prompt 적용**
- "Messages" 섹션 → "User" 메시지 찾기
- 기존 User Prompt **전체 삭제**
- 복사한 v6.18 User Prompt 붙여넣기
- "Save" 버튼 클릭

**6. 변경사항 확인**
- 13문장 구조: intro_hook_speech + 12문장
- 6가지 인트로 후킹 공식 (손해 강조/숫자 충격/반전 폭격/질문 폭탄/비밀 공개/거대 숫자)
- 고품질 이미지 프롬프트: "professional lifestyle magazine photography" 필수

---

### **STEP 5: 워크플로우 저장 및 활성화** ⏱️ 1분

**1. 전체 워크플로우 저장**
- Ctrl+S 또는 "Save" 버튼 클릭
- "Workflow saved" 메시지 확인

**2. 활성화 확인**
- 우측 상단 "Active" 토글이 ON 상태인지 확인
- OFF면 클릭해서 ON으로 변경

**3. 완료!**
```
✅ Branding Router v5.1: BGM 볼륨 상향 + 카테고리 TTS
✅ Shotstack Builder v20.39: 인트로 TTS + 동적 길이
✅ GPT Prompt v6.18: 13문장 + 인트로 후킹 + 고품질 이미지
```

---

## 🧪 **테스트 방법**

### **수동 테스트**
1. n8n 워크플로우에서 "Execute Workflow" 클릭
2. 생성된 영상 확인:
   - **0~5초**: 인트로 Kling 영상 + 강력한 후킹 TTS (예: "용서 못 하면 건강 망가져요")
   - **5~65초**: 본문 12 슬라이드 + TTS
   - **BGM**: 들리는가? (0.30~0.40 볼륨)
   - **마지막 문장**: 잘리지 않고 끝까지 재생되는가?
   - **이미지 품질**: 프로페셔널한가? (촌스럽지 않은가?)

### **자동 스케줄**
- 34분 간격으로 21채널 자동 순환 (기존과 동일)

---

## 🔧 **트러블슈팅**

### **문제 1: GPT가 여전히 12문장만 생성**
→ GPT Prompt v6.18 System Prompt가 정확히 적용되었는지 확인
→ "13문장" 키워드가 있는지 확인

### **문제 2: BGM이 여전히 안 들림**
→ Branding Router v5.1 코드 확인
→ `bgm: { volume: 0.30~0.40 }` 범위인지 확인

### **문제 3: 인트로에 TTS 없음**
→ Shotstack Builder v20.39 코드 확인
→ `start: 0` (기존 INTRO_LEN → 0) 확인

### **문제 4: 스크립트 마지막 잘림**
→ Shotstack Builder v20.39 확인
→ `const TARGET_TOTAL = Math.max(65, Math.ceil(ttsRealLength) + 2);` 있는지 확인

---

## 📊 **기대 효과**

| 항목 | Before | After | 개선율 |
|------|--------|-------|--------|
| BGM 들림 | 거의 없음 (0.13~0.18) | 명확히 들림 (0.30~0.40) | **2배+** |
| 인트로 후킹 | 없음 (무음) | 강력함 (6가지 공식) | **신규** |
| 스크립트 완성도 | 마지막 잘림 | 끝까지 재생 | **100%** |
| 이미지 품질 | 촌스러움 | 프로페셔널 | **대폭 개선** |
| TTS 주제 매칭 | 부적절 (용서→촐싹) | 적절함 (용서→차분함) | **100%** |

---

## 🎬 **완성 예시**

### **용서 주제 영상 (인생지혜 카테고리)**

**0~5초 (인트로)**
- 영상: 평화로운 정원에서 명상하는 60대 (Kling AI)
- TTS: **"용서 못 하면 건강 망가져요."** (Jjeong, 차분한 목소리)
- BGM: Lifestyle Peaceful (0.33 볼륨, 들림!)

**5~65초 (본문 12 슬라이드)**
- 12개 프로페셔널 이미지 + 본문 12문장 TTS
- 동적 싱크: ElevenLabs alignment 기반
- BGM 지속 (0.33 볼륨)

**결과**: 5060세대가 **절대 못 끄는 고품질 숏츠!** 🚀

---

## 📁 **파일 위치**

```
/home/user/OAACEO/scratch/
├── AIASF_GPT_Prompt_v6.18.md          # GPT System/User Prompt
├── n8n_branding_router_v5.1.js        # Branding Router 코드
├── n8n_shotstack_builder_v20.39.js    # Shotstack Builder 코드
└── AIASF_v6.18_적용_가이드.md         # 이 파일
```

---

## 🙋 **문의/피드백**

- GitHub: kohsehyung0328-bit/OAACEO
- Branch: claude/start-session-OToVf
- Commit: a20a0da (2026-02-22)

**적용 완료 후 첫 영상이 생성되면 품질 검증 필수!** 🎯
