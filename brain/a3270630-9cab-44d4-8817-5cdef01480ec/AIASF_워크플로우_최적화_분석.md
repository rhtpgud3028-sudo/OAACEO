# 🔍 AIASF 워크플로우 최적화 딥다이브 분석

> **작성일**: 2026-01-09 10:25
> **목적**: 대표님 3가지 질문에 대한 딥다이브 분석

---

## 질문 1: 서버 저장 비용 증가 이슈

### 📊 비용 계산

| 항목 | 값 |
|------|---|
| 월 생산량 | 1,200개 영상 |
| 영상당 이미지 | 썸네일 1개 + 슬라이드 8개 = **9개** |
| 월 이미지 수 | 1,200 × 9 = **10,800개** |
| 평균 이미지 크기 | DALL-E 1024x1024 PNG ≈ **500KB** |
| 월 저장 용량 | 10,800 × 0.5MB = **5.4GB/월** |
| 연간 누적 | 5.4GB × 12 = **64.8GB/년** |

### 💰 서버 비용 예상

| 기간 | 누적 용량 | LightNode 추가 비용 |
|------|----------|-------------------|
| 1년 | 65GB | **$0** (50GB SSD 기본 포함) |
| 2년 | 130GB | **~$5/월** (추가 디스크) |
| 5년 | 325GB | **~$15/월** |

### ✅ 결론
- **1-2년간 추가 비용 거의 없음!**
- LightNode 기본 50GB + 추가 확장 저렴

### 🔧 비용 최적화 방안

| 방안 | 절감 효과 |
|------|----------|
| **이미지 압축** (PNG→WebP) | 50% 용량 감소 |
| **30일 지난 이미지 자동 삭제** | cron job 설정 |
| **클라우드 전환** (S3 Glacier) | $0.004/GB/월 |

---

## 질문 2: 노드 통합 가능성

### 🔍 현재 워크플로우 분석

```
Manual/Schedule Trigger
    ↓
GPT 주제선정 → YouTube Trends
    ↓
DALL-E Thumbnail → [썸네일 다운로드] → [썸네일 업로드] → GPT Vision 분석
    ↓
GPT 스크립트 → GPT 이미지 프롬프트
    ↓
Kling 인트로 → Kling 아웃트로 → DALL-E 8개 이미지
    ↓
[이미지 저장 x8] → Typecast TTS → [TTS 저장]
    ↓
Code 노드 (Shotstack JSON) → Shotstack 렌더링 → Polling
    ↓
품질 체크 → YouTube 업로드
```

### 🎯 통합 가능한 노드

| 현재 | 통합 후 | 절감 |
|------|--------|------|
| **썸네일 다운로드 + 업로드** | **Code 노드 1개** (n8n 바이너리 직접 저장) | -1 노드 |
| **8개 DALL-E + 8개 저장** | **Loop + Code 1개** | -14 노드 |
| **Kling 인트로 + 아웃트로** | 병렬 실행 (이미 최적) | 0 |
| **GPT Vision 분석** | ❌ **제거 권장** (아래 설명) | -1 노드 |

### 💡 핵심 발견: GPT Vision 노드 제거 가능!

**현재 역발상 워크플로우:**
```
DALL-E Thumbnail → GPT Vision 분석 → GPT 스크립트
```

**문제:**
- DALL-E URL 만료 → 타임아웃 오류
- GPT Vision 호출 = 추가 비용 ($0.01~0.03/이미지)
- 월 1,200개 × $0.015 = **$18/월 추가**

**대안: GPT Vision 없이 직접 스크립트 생성!**
```
GPT 주제선정 → GPT 스크립트 → DALL-E Thumbnail + Images
```

- 이미지는 스크립트 **이후**에 생성
- 스크립트에 맞춰 이미지 프롬프트 생성
- URL 만료 문제 완전 해결!

### ✅ 최종 권장 워크플로우

```
[현재: ~25개 노드]
            ↓
[최적화 후: ~15개 노드]

Manual/Schedule Trigger
    ↓
GPT 주제선정
    ↓
GPT 스크립트 (스크립트 + 이미지 프롬프트 + 인트로/아웃트로 프롬프트)
    ↓
[병렬 실행]
├── Kling 인트로
├── Kling 아웃트로  
├── DALL-E Thumbnail
└── DALL-E 8 Images (Loop)
    ↓
[이미지 저장 Loop] (Code 노드 1개로 통합)
    ↓
Typecast TTS → TTS 저장
    ↓
Code (Shotstack JSON)
    ↓
Shotstack 렌더링 → Polling → 품질 체크 → YouTube
```

---

## 질문 3: 오류 시 중간 결과물 재사용

### 🔴 현실: API 비용 손실 발생

**n8n은 체크포인트 자동 복구를 지원하지 않습니다!**

| 시나리오 | 결과 |
|----------|------|
| Kling 인트로 생성 완료 후 → DALL-E 오류 | Kling 비용 **날림** |
| 모든 이미지 완료 → Shotstack 오류 | 이미지 비용 **날림** |
| Shotstack 완료 → YouTube 오류 | 전체 비용 **날림** |

### 💰 1회 실패 시 손실 비용

| 항목 | 비용 |
|------|------|
| Kling 인트로 | $0.64 |
| Kling 아웃트로 | $0.64 |
| DALL-E 9개 | $0.36 |
| Typecast TTS | ~$0.10 |
| Shotstack | ~$0.10 |
| **합계** | **~$1.84/회** |

### 🔧 해결책: 중간 결과물 저장 + 재시작 로직

**방법 1: 데이터베이스 저장**
```
각 노드 완료 후 → MySQL/Postgres에 결과 저장
오류 발생 시 → DB에서 기존 결과 로드
```

**방법 2: 파일 저장 (권장)**
```
각 노드 완료 후 → JSON 파일로 저장 (/var/www/html/cache/{execution_id}.json)
오류 발생 시 → 파일에서 기존 결과 로드
```

**방법 3: n8n Execution ID 활용**
```
오류 발생 → Execution ID 기록
수동 재시작 시 → 이전 Execution 데이터 로드
```

### ✅ 권장 구현: 캐시 시스템

```javascript
// Code 노드에 캐시 로직 추가
const executionId = $execution.id;
const cacheFile = `/var/www/html/cache/${executionId}.json`;

// 캐시 확인
if (fs.existsSync(cacheFile)) {
    const cached = JSON.parse(fs.readFileSync(cacheFile));
    if (cached.introVideo) {
        // 캐시된 결과 사용 (Kling 호출 skip)
    }
}

// 결과 저장
fs.writeFileSync(cacheFile, JSON.stringify({
    introVideo: introUrl,
    outroVideo: outroUrl,
    images: imageUrls,
    tts: ttsUrl
}));
```

---

## 📋 종합 권장사항

| 우선순위 | 작업 | 효과 |
|----------|------|------|
| **1** | GPT Vision 제거, 역발상→순발상 변경 | URL 만료 문제 해결, $18/월 절감 |
| **2** | 이미지 저장 Loop 통합 (Code 1개) | 노드 -14개 |
| **3** | 캐시 시스템 구현 | 오류 시 비용 손실 방지 |
| **4** | 30일 이미지 자동 삭제 cron | 서버 용량 관리 |

---

## ⚠️ 즉시 조치 필요

현재 발생한 **GPT Vision 타임아웃 오류** 해결:

### 옵션 A: GPT Vision 제거 (권장)
- 역발상 → 순발상 워크플로우 변경
- 이미지는 스크립트 이후에 생성

### 옵션 B: 이미지 서버 저장 유지
- DALL-E → 바이너리 저장 → 서버 URL 사용
- 추가 노드 필요

**어떤 방향으로 진행할까요?**
