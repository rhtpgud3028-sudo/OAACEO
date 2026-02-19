# YouTube API 쿼터 증가 심사 - 답신 가이드

> **제출 기한**: 7 영업일 이내 (2025-01-10 전후)
> **이메일 발신**: YouTube API Quota Team

---

## 📧 YouTube 요청 사항 분석

### 🔴 필수 제출물
| 항목 | 요구사항 | 비고 |
|------|----------|------|
| **스크린캐스트 영상** | ✅ **필수** | 영어로 제작! (English language) |
| **사용 사례 시각적 데모** | ✅ **필수** | API 서비스 사용 방법 단계별 시연 |
| **최종 결과물** | ✅ **필수** | 생성된 콘텐츠/영상 예시 |

---

## 🎬 스크린캐스트 제작 가이드

### 📋 반드시 포함할 내용

#### 1️⃣ 애플리케이션 개요 (30초)
- **서비스명**: AI Shorts Factory (AIASF)
- **목적**: AI 기반 YouTube Shorts 자동 생성 및 업로드
- **타겟 콘텐츠**: 건강, 재테크 등 교육성 숏츠 (5060세대 타겟)

#### 2️⃣ API 사용 흐름 시연 (2-3분)
> 아래 순서로 화면 녹화하며 영어로 설명

| 단계 | 시연 내용 | 영어 설명 포인트 |
|------|----------|-----------------|
| 1 | n8n 워크플로우 전체 화면 | "This is our automation platform, n8n" |
| 2 | 영상 생성 과정 (Kling/DALL-E) | "AI generates video and images" |
| 3 | Shotstack 합성 | "Videos are composed with subtitles" |
| 4 | **YouTube Upload 노드** | ⭐ "YouTube Data API uploads the video" |
| 5 | YouTube Studio 확인 | "Here's the uploaded video in YouTube Studio" |

#### 3️⃣ YouTube API 사용 목적 설명 (1분)
```
"We use YouTube Data API exclusively for:
1. Uploading videos (videos.insert)
2. Setting video metadata (title, description, tags)
3. Monitoring upload status

We do NOT download, scrape, or collect any user data."
```

#### 4️⃣ 최종 결과물 데모 (30초)
- 실제 업로드된 Shorts 영상 재생
- YouTube Studio에서 조회수/분석 화면 보여주기

---

## 📝 영어 답신 이메일 템플릿

### Subject: Re: YouTube API Services - Quota Increase Request

```
Hello,

Thank you for reviewing our quota increase request.

We have prepared the required materials as requested:

1. **Screencast Video**: [Link to video]
   - A detailed step-by-step demonstration of our API usage
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
   - Daily uploads: 40 videos across 20 channels
   - Estimated daily quota: ~70,000 units
   - Current quota: 10,000 units (insufficient)

5. **Compliance**:
   - All content is original, AI-generated
   - No scraping, downloading, or data collection
   - Full compliance with YouTube ToS and Community Guidelines

Please let me know if you need any additional information.

Best regards,
[Your Name]
```

---

## 🎥 스크린캐스트 제작 방법

### 추천 도구
| 도구 | 특징 | 비용 |
|------|------|------|
| **Loom** | 간편, 링크 공유 | 무료/유료 |
| **OBS Studio** | 고품질, 로컬 저장 | 무료 |
| **Windows Game Bar** | Win+G, 즉시 녹화 | 무료 |

### 📌 녹화 체크리스트

- [ ] **언어**: 영어로 음성 또는 자막 필수!
- [ ] **화질**: 최소 1080p
- [ ] **길이**: 3-5분 권장
- [ ] **포함 필수**:
  - [ ] n8n 워크플로우 전체 화면
  - [ ] YouTube Upload 노드 설정 화면
  - [ ] 실제 업로드 성공 화면
  - [ ] YouTube Studio에서 영상 확인

### ⚠️ 주의사항
- **API 키/비밀번호 노출 금지!** (블러 처리 또는 가림)
- **OAuth 클라이언트 ID 노출 금지!**
- 민감 정보는 모자이크 처리

---

## 🔢 쿼터 계산 근거 (답신에 포함)

### 일일 API 사용량 예상
| 작업 | 단가 (units) | 일일 횟수 | 일일 소모 |
|------|-------------|----------|----------|
| videos.insert (업로드) | 1,600 | 40 | 64,000 |
| channels.list | 1 | 20 | 20 |
| videos.list (확인) | 1 | 40 | 40 |
| **합계** | | | **~64,060 units** |

### 요청 쿼터
- **현재**: 10,000 units/day
- **필요**: 100,000 units/day (버퍼 포함)

---

## ✅ 다음 단계

1. ⬜ **스크린캐스트 녹화** (영어, 3-5분)
2. ⬜ **영상 업로드** (YouTube 비공개 또는 Loom/Google Drive)
3. ⬜ **이메일 답신** (위 템플릿 사용)
4. ⬜ **기한 내 제출** (7 영업일)

---

## 💡 승인 확률 높이는 팁

1. **영어 설명 필수** - 한국어만 있으면 거절 가능성 ↑
2. **명확한 비즈니스 목적** - 교육 콘텐츠 강조
3. **데이터 수집 안 함 명시** - "No data collection"
4. **정책 준수 강조** - ToS, Community Guidelines 언급
5. **구체적 숫자 제시** - 일일 업로드 수, 채널 수, 쿼터 계산

---

*마지막 업데이트: 2025-12-31*
