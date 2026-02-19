#!/bin/bash
set -euo pipefail

# Only run in remote (Claude Code on the web) environments
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

echo "Session start hook running..."

# GitHub에서 최신 데이터 자동 pull (데이터 손실 방지)
echo "GitHub에서 최신 데이터 동기화 중..."
cd "$CLAUDE_PROJECT_DIR"
git fetch origin main 2>/dev/null && \
  git merge --ff-only origin/main 2>/dev/null && \
  echo "✅ GitHub 최신 상태 동기화 완료" || \
  echo "⚠️  자동 pull 스킵 (로컬 변경사항 있음 - 수동 확인 필요)"

echo "Session start hook completed."
