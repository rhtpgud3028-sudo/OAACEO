---
description: 매일 작업 종료 시 필수 확인 사항 (AIASF 프로젝트)
---

# 🔴 필수 확인 체크리스트 (매일!)

// turbo-all

## ⚠️ 작업 정리 규칙 (절대 준수!)

| 명령어 | 처리 방법 |
|--------|----------|
| **"오늘 작업 정리해줘"** | **위키 업데이트 로그에 직접 추가** |
| ❌ 금지 | 별도 파일 생성 (AIASF_날짜_작업요약.md 등) |
| ✅ 필수 | `프로젝트_위키_통합.md` → `## 📅 업데이트 로그` 섹션에 추가 |

## 1. SSH 접속
```bash
ssh -i ~/.ssh/id_rsa root@38.60.220.9
```

## 2. PM2 상태 확인
```bash
pm2 status
```
**예상 결과**: n8n이 `online` 상태여야 함

## 3. 백업 크론잡 확인
```bash
crontab -l
```
**예상 결과**: 백업 스크립트 크론잡이 설정되어 있어야 함

## 4. 최근 백업 파일 확인
```bash
ls -la /root/n8n-backup/ | tail -5
```
**예상 결과**: 최근 날짜의 백업 파일이 존재해야 함

## 5. n8n 웹 접속 테스트
- 브라우저에서 https://autoshort.site 접속
**예상 결과**: n8n 로그인 페이지 또는 워크플로우 화면

---

## 📋 확인 결과 기록

| 항목 | 확인 명령어 | 상태 |
|------|-----------|------|
| PM2 상태 | `pm2 status` | ✅/❌ |
| n8n online | `pm2 status` | ✅/❌ |
| 백업 크론잡 | `crontab -l` | ✅/❌ |
| 최근 백업 | `ls /root/n8n-backup/` | ✅/❌ |
| n8n 웹 접속 | 브라우저 | ✅/❌ |

---

## ⚠️ 문제 발생 시 조치

### PM2에 n8n이 없거나 stopped인 경우:
```bash
cd ~/.n8n
pm2 start n8n --name n8n
pm2 save
pm2 startup
```

### 크론잡이 없는 경우:
```bash
crontab -e
# 아래 추가 (매일 자정 백업)
0 0 * * * /root/backup-n8n.sh
```

### 백업 스크립트가 없는 경우:
```bash
nano /root/backup-n8n.sh
# 내용 작성 후 chmod +x /root/backup-n8n.sh
```
