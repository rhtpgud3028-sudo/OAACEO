#!/bin/bash
set -euo pipefail

# Only run in remote (Claude Code on the web) environments
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

# 메인 레포: rhtpgud3028-sudo/OAACEO (단일 레포 운영 - 2026-04-07 통합 완료)
# 백업 레포: rhtpgud3028-sudo/OAACEO-backup (GitHub Actions 자동 미러)
# 개발 브랜치: claude/* → auto-merge-to-main.yml로 main 자동 병합

echo "Session start hook running..."
cd "$CLAUDE_PROJECT_DIR"

# ── 1. GitHub 최신 데이터 동기화 ───────────────────────────
echo "GitHub에서 최신 데이터 동기화 중..."
git fetch origin main 2>/dev/null && \
  git merge --ff-only origin/main 2>/dev/null && \
  echo "✅ GitHub 최신 상태 동기화 완료" || \
  echo "⚠️  자동 pull 스킵 (로컬 변경사항 있음 - 수동 확인 필요)"

# ── 2. n8n 서버 상태 확인 (HTTP, SSH 불필요) ────────────────
echo "n8n 서버 상태 확인 중..."
N8N_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 8 http://38.60.220.9:5678/healthz 2>/dev/null || echo "000")
if [ "$N8N_STATUS" = "200" ]; then
  echo "✅ n8n 서버 정상 (HTTP 200)"
else
  echo "⚠️  n8n 서버 응답 없음 (코드: $N8N_STATUS) - 서버 점검 필요!"
fi

# ── 3. 최근 위키 백업 확인 ───────────────────────────────────
LATEST_BACKUP=$(ls -t "$CLAUDE_PROJECT_DIR/scratch/backup_wiki/"*.md 2>/dev/null | head -1)
if [ -n "$LATEST_BACKUP" ]; then
  BACKUP_DATE=$(basename "$LATEST_BACKUP" | grep -oP '\d{8}_\d{4}' || echo "날짜불명")
  echo "✅ 최근 백업: $BACKUP_DATE"
else
  echo "⚠️  위키 백업 없음 - 세션 종료 전 /wrap 실행 필수!"
fi

echo "Session start hook completed."
