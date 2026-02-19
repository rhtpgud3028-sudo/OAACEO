---
description: 오늘 작업 정리 시 수행할 작업
---

# "오늘 작업 정리해줘" 워크플로우

## 1. 먼저 실행 (무조건!)
// turbo-all

### 1-1. n8n 백업
```bash
ssh root@45.178.142.107 "cd /root/.n8n && tar -czf n8n_backup_$(date +%Y%m%d).tar.gz database.sqlite && ls -la *.tar.gz | tail -3"
```

### 1-2. PM2 상태 확인
```bash
ssh root@45.178.142.107 "pm2 status"
```

## 2. 그 다음 정리

1. 오늘 해결한 문제 요약
2. 변경된 파일/노드 목록
3. 남은 작업/다음 단계
4. walkthrough.md 업데이트

## 중요
- 백업과 PM2 체크는 **사용자 요청 전에 먼저 실행**
- SSH 안 되면 대표님께 명령어 전달
- 절대 빼먹지 말 것!
