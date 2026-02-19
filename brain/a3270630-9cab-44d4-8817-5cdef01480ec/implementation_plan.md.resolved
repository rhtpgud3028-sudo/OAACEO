# 체크포인트 시스템 구현 계획

## 목표

워크플로우 오류 발생 시 기존 생성된 리소스(Kling 영상, 이미지, TTS 등)를 재사용하여 API 비용 손실 방지

---

## 설계

### 체크포인트 저장 구조

```json
{
  "session_id": "unique_session_id",
  "created_at": "2026-01-09T14:52:00Z",
  "status": "in_progress",
  "checkpoints": {
    "topic": { "completed": true, "data": {...} },
    "thumbnail": { "completed": true, "url": "..." },
    "script": { "completed": true, "data": {...} },
    "kling_intro": { "completed": true, "url": "..." },
    "kling_outro": { "completed": true, "url": "..." },
    "images": { "completed": true, "urls": [...] },
    "tts": { "completed": true, "url": "..." },
    "video": { "completed": false, "url": null }
  }
}
```

### 저장 위치

- 서버: `/var/www/html/checkpoints/`
- 파일명: `checkpoint_{session_id}.json`

---

## Proposed Changes

### 서버 설정

#### [NEW] checkpoint.php

저장, 조회, 삭제 기능

---

### n8n 워크플로우 수정

#### [MODIFY] 워크플로우 시작 부분

1. **Session ID 생성 노드** 추가
2. **체크포인트 조회 노드** 추가 (기존 세션 있으면 불러오기)

#### [MODIFY] 각 주요 단계 후

1. **GPT 주제선정** 후 → 체크포인트 저장
2. **DALL-E Thumbnail** 후 → 체크포인트 저장
3. **GPT 스크립트** 후 → 체크포인트 저장
4. **Kling Intro/Outro** 완료 후 → 체크포인트 저장
5. **이미지 슬라이드** 완료 후 → 체크포인트 저장
6. **TTS** 완료 후 → 체크포인트 저장
7. **최종 영상** 완료 후 → 체크포인트 삭제 (완료)

#### [ADD] 조건부 실행

각 단계에서 체크포인트 확인 → 이미 완료되었으면 스킵

---

## Verification Plan

### 테스트 시나리오

1. 정상 실행 → 체크포인트 저장 확인
2. 중간에 수동 중단 → 재시작 시 이어서 실행 확인
3. 오류 발생 → 오류 해결 후 재시작 시 기존 리소스 재사용 확인

---

## 예상 작업 시간

- 서버 설정: 10분
- n8n 노드 추가: 30분
- 테스트: 20분

**총: 약 1시간**
