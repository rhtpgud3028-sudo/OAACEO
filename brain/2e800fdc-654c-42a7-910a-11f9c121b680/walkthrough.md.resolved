# 🎉 AIASF Phase 1 완료 워크스루 (2026-01-20)

## ✅ Phase 1 최종 달성!

65초 AI Shorts Factory 자동화 파이프라인이 **대표님 기준에 부합하는 수준**으로 완성되었습니다!

---

## 📋 오늘 해결한 문제들

### 1. Parse Prompts 이미지 1개만 넘어가는 문제

| 원인 | GPT가 JSON 내에 주석(//) 포함 → JSON.parse() 실패 |
|------|--------------------------------------------------|
| 해결 | 주석 제거 코드 추가: `rawText.replace(/\/\/.*$/gm, '')` |

---

### 2. FFmpeg 볼륨 증폭 실패 문제

| 원인 | 출력 파일 확장자 `.mpga` → FFmpeg 형식 인식 실패 |
|------|------------------------------------------------|
| 해결 | 출력을 `.mp3`로 강제 지정 |

```php
$outputFile = 'boosted_' . pathinfo($inputFile, PATHINFO_FILENAME) . '.mp3';
```

---

### 3. 인트로 TTS (Hook TTS) 안 나오는 문제

| 원인 | Boost Hook Audio 실패 → hookTtsUrl 없음 |
|------|----------------------------------------|
| 해결 | FFmpeg 출력 형식 수정으로 동시 해결 |

---

## 📁 수정된 파일 목록

| 파일 | 버전 | 변경 내용 |
|------|------|----------|
| [n8n_shotstack_builder_v20.15.js](file:///C:/Users/user/.gemini/antigravity/scratch/n8n_shotstack_builder_v20.15.js) | v20.15 | Boost Audio 노드 참조, 이미지 10개, 이미지 병합 개선 |
| [ffmpeg_boost.php](file:///C:/Users/user/.gemini/antigravity/scratch/ffmpeg_boost.php) | 최신 | 출력파일 .mp3 강제, 디버그 정보 추가 |
| Parse Prompts 노드 | 최신 | 주석 제거 코드 추가 |

---

## 🔧 서버 변경 사항

| 서버 경로 | 내용 |
|----------|------|
| `/var/www/html/audio/boost.php` | FFmpeg 볼륨 증폭 스크립트 (출력 .mp3) |

---

## 📊 현재 워크플로우 구조

```
Manual Trigger
    ↓
3. GPT 스크립트 → 12문장 스크립트 생성
    ↓
4. GPT 이미지 프롬프트 → 11개 이미지 프롬프트 생성
    ↓
Parse Prompts → 주석 제거 + JSON 파싱
    ↓
Split Prompts → Loop
    ↓
DALL-E 3 → 11개 이미지 생성
    ↓
Download → Save → Create URL → Merge Images
    ↓
ElevenLabs TTS (Hook) → Save → Boost Hook Audio
    ↓
ElevenLabs TTS (Body) → Save → Boost Body Audio
    ↓
Kling AI → 인트로 비디오 생성
    ↓
Code (v20.15) → Shotstack JSON 생성
    ↓
Shotstack Render → 65초 영상 생성
    ↓
YouTube Upload → 자동 업로드
```

---

## 🎯 Phase 1 달성 스펙

| 항목 | 스펙 |
|------|------|
| 영상 길이 | 65초 |
| 인트로 | Kling AI 5초 비디오 |
| Hook TTS | 3초 (볼륨 2배 증폭) |
| 본문 슬라이드 | 11개 × 5.5초 |
| TTS 볼륨 | FFmpeg 2배 증폭 |
| BGM 볼륨 | 0.1 (TTS 대비 배경) |
| 자막 폰트 | NotoSansKR-Bold |
| 이미지 생성 | DALL-E 3 (11개) |

---

## 🚀 Phase 2 목표

- **1,200개 영상/월** 자동 생성
- **멀티 채널** 업로드
- **비용 최적화** (이미지 10개 → 월 $96 절감)
- **완전 자동화** (수동 개입 제로)

---

## 📌 주의사항

1. **GPT 모델**: `CHATGPT-4O-LATEST` 사용 중 (응답 구조 변경 가능)
2. **Parse Prompts**: 주석 제거 코드 필수
3. **Boost Audio**: 서버 boost.php 정상 작동 확인 필요

---

**Phase 1 완료! Phase 2 돌입! 🎊**
