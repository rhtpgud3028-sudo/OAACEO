# 📋 YouTube API 쿼터 증가 - 최종 답신 액션플랜

> **제출 기한**: 7 영업일 이내 (2025-01-10 전)
> **예상 소요 시간**: 2-3시간

---

## ✅ 체크리스트

- [ ] **STEP 1**: TTS 영어 음성 생성 (30분)
- [ ] **STEP 2**: 화면 녹화 준비 (10분)
- [ ] **STEP 3**: 화면 녹화 (30분)
- [ ] **STEP 4**: 영상 합성 (30분)
- [ ] **STEP 5**: 영상 업로드 (10분)
- [ ] **STEP 6**: 이메일 답신 (20분)

---

## STEP 1: TTS 영어 음성 생성 (30분)

### 1-1. ElevenLabs 접속 (무료, 가장 자연스러움)
```
https://elevenlabs.io
→ Sign up (무료)
→ Text to Speech 선택
→ Voice: "Adam" 또는 "Antoni" (전문적 남성)
```

### 1-2. 9개 섹션 음성 생성

| 파일명 | 스크립트 위치 |
|--------|-------------|
| `01_intro.mp3` | Section 1 텍스트 |
| `02_overview.mp3` | Section 2 텍스트 |
| `03_content.mp3` | Section 3 텍스트 |
| `04_media.mp3` | Section 4 텍스트 |
| `05_composition.mp3` | Section 5 텍스트 |
| `06_youtube.mp3` | Section 6 텍스트 ⭐ |
| `07_result.mp3` | Section 7 텍스트 |
| `08_quota.mp3` | Section 8 텍스트 |
| `09_closing.mp3` | Section 9 텍스트 |

📄 **스크립트 파일**: `YouTube_TTS_Scripts.md`

### 1-3. 다운로드
- 각 섹션 Generate → Download MP3
- 폴더에 정리: `youtube_quota_audio/`

---

## STEP 2: 화면 녹화 준비 (10분)

### 2-1. 브라우저 준비
- [ ] **탭 1**: n8n (https://autoshort.site)
- [ ] **탭 2**: YouTube Studio
- [ ] **탭 3**: Google Cloud Console (선택)

### 2-2. n8n 워크플로우 준비
- [ ] AI Shorts Factory 워크플로우 열기
- [ ] 전체 노드가 보이도록 zoom out
- [ ] ⚠️ **API 키, OAuth 토큰 블러 처리 필요한 부분 메모**

### 2-3. 화면 해상도
```
1920 x 1080 (Full HD) 권장
```

---

## STEP 3: 화면 녹화 (30분)

### 3-1. 녹화 도구 선택

**Option A: Loom (가장 쉬움)**
```
https://loom.com → 무료 설치
Screen Only 선택 (마이크 OFF)
```

**Option B: OBS Studio (고품질)**
```
https://obsproject.com → 무료 설치
```

**Option C: Windows Game Bar**
```
Win + G → 캡처 위젯 → 녹화 시작
```

### 3-2. 녹화 시나리오 (무음으로 진행)

| 시간 | 화면 내용 | 동작 |
|------|----------|------|
| 0:00-0:30 | 유튜브 채널 화면 | 채널 스크롤 |
| 0:30-1:00 | n8n 전체 워크플로우 | 줌 아웃 → 전체 보여주기 |
| 1:00-2:00 | GPT 노드들 클릭 | Schedule → Trends → GPT 주제 → GPT 스크립트 |
| 2:00-2:30 | DALL-E, Kling 노드 | 이미지/영상 생성 노드 클릭 |
| 2:30-3:00 | Shotstack 노드 | Code 노드 → HTTP Request |
| 3:00-4:00 | **YouTube Upload 노드** ⭐ | 노드 설정 보여주기 (토큰 블러!) |
| 4:00-4:30 | YouTube Studio | 업로드된 영상 목록 보여주기 |
| 4:30-5:00 | 빈 화면 또는 요약 슬라이드 | 숫자 요약 (채널 20개, 일일 40개 등) |

### 3-3. 녹화 팁
- 마우스 천천히 움직이기
- 각 화면 **3초 이상** 유지
- 실수하면 그 부분만 다시 녹화 (나중에 편집)

---

## STEP 4: 영상 합성 (30분)

### 4-1. CapCut 다운로드 (무료)
```
https://www.capcut.com → PC 버전 다운로드
```

### 4-2. 합성 순서

1. **프로젝트 생성**: 1080x1920 (Shorts 세로) 또는 1920x1080 (가로)
2. **화면 녹화 영상 추가**: 타임라인에 드래그
3. **TTS 음성 추가**: 각 섹션 위치에 맞게 배치

| 타임라인 | 음성 파일 |
|----------|----------|
| 0:00 | 01_intro.mp3 |
| 0:30 | 02_overview.mp3 |
| 1:00 | 03_content.mp3 |
| 2:00 | 04_media.mp3 |
| 2:30 | 05_composition.mp3 |
| 3:00 | 06_youtube.mp3 |
| 4:00 | 07_result.mp3 |
| 4:30 | 08_quota.mp3 |
| 5:00 | 09_closing.mp3 |

4. **민감 정보 블러 처리**
   - CapCut → Effects → Blur
   - API 키, OAuth 토큰 부분에 적용

5. **Export**
   - 해상도: 1080p
   - 포맷: MP4
   - 파일명: `AIASF_YouTube_API_Demo.mp4`

---

## STEP 5: 영상 업로드 (10분)

### Option A: YouTube 비공개 업로드 (추천)
```
YouTube Studio → 만들기 → 동영상 업로드
공개 설정: "비공개"
→ 링크 복사
```

### Option B: Google Drive
```
Google Drive → 업로드
공유 설정: "링크가 있는 사용자" → "뷰어"
→ 링크 복사
```

### Option C: Loom
```
Loom에 직접 업로드 → 링크 복사
```

---

## STEP 6: 이메일 답신 (20분)

### 6-1. 답신 내용

**To**: YouTube API 쿼터 팀 (원래 이메일에 Reply)

**Subject**: Re: YouTube API Services - Quota Increase Request

```
Hello,

Thank you for reviewing our quota increase request.

We have prepared the required materials as requested:

1. **Screencast Video**: [영상 링크 붙여넣기]
   - A 5-minute step-by-step demonstration of our API usage
   - Shows the complete workflow from content generation to YouTube upload
   - All narration is in English

2. **Use Case Summary**:
   - Service Name: AI Shorts Factory (AIASF)
   - Purpose: Automated YouTube Shorts creation and upload for educational content
   - Target Audience: Korean adults aged 50-60
   - Content Categories: Health tips, financial advice, lifestyle content

3. **API Endpoints Used**:
   - videos.insert (video upload)
   - videos.update (metadata updates)
   - channels.list (channel verification)

4. **Quota Justification**:
   - Channels managed: 20
   - Daily uploads: 40 videos (2 per channel)
   - Estimated daily quota: ~64,000 units
   - Requested quota: 100,000 units/day

5. **Compliance**:
   - All content is original, AI-generated
   - No scraping, downloading, or data collection
   - Full compliance with YouTube ToS and Community Guidelines

Please let me know if you need any additional information.

Best regards,
[대표님 이름]
AI Shorts Factory
```

### 6-2. 이메일 발송 전 체크
- [ ] 영상 링크 정상 작동 확인
- [ ] 영상 재생 테스트
- [ ] 민감 정보 블러 확인
- [ ] 오타 확인

---

## 🎯 예상 일정

| 날짜 | 작업 |
|------|------|
| **12/31 (오늘)** | STEP 1-2 완료 (TTS 생성 + 준비) |
| **1/1-2** | STEP 3-4 완료 (녹화 + 합성) |
| **1/3** | STEP 5-6 완료 (업로드 + 이메일) |
| **1/10** | 기한 (여유 있게 완료!) |

---

## 📎 관련 파일

| 파일 | 용도 |
|------|------|
| `YouTube_TTS_Scripts.md` | TTS 스크립트 (9개 섹션) |
| `YouTube_Screencast_Script.md` | 상세 녹화 시나리오 |
| `YouTube_API_Quota_Response_Guide.md` | 전체 가이드 |

---

*작성일: 2025-12-31*
