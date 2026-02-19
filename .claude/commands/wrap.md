# /wrap - 세션 종료 워크플로우

세션을 마무리합니다. 아래 순서대로 실행하세요.

## 1. 위키 백업 생성 (타임스탬프 필수!)
`scratch/프로젝트_위키_통합.md`를 읽고 현재 실제 시간으로 백업 파일을 생성합니다.
- 파일명: `scratch/backup_wiki/프로젝트_위키_통합_backup_YYYYMMDD_HHMM.md`
- **이전 타임스탬프 재사용 절대 금지!** 현재 실제 시간 사용!
- 백업 생성 후 파일 존재 + 용량 확인 필수

## 2. 위키 헤더 갱신
`scratch/프로젝트_위키_통합.md` 상단의 날짜/단계 정보를 오늘 작업 내용으로 업데이트합니다.

## 3. 오늘 작업 요약 보고
오늘 완료한 작업, 변경사항, 미완료 항목을 간단히 보고합니다.

## 4. GitHub push → 자동 동기화
```bash
cd $CLAUDE_PROJECT_DIR
git add -A
git commit -m "세션 마무리: $(date '+%Y-%m-%d %H:%M') - [오늘 작업 핵심 1줄 요약]"
git push -u origin HEAD
```

### 자동 동기화 흐름 (push 후 자동 실행)
```
/wrap push (claude/XXXXX 브랜치)
    → GitHub Action 자동 실행 (.github/workflows/auto-merge-to-main.yml)
        → claude/XXXXX → main 자동 병합
            → Windows auto_sync_github.ps1 (30분 주기) → main pull
                → Google Drive 폴더 자동 동기화
                    → 휴대용 노트북 자동 수신 ✅
```

- push 완료 후 반드시 "✅ GitHub push 완료 - GitHub Action이 자동으로 main 병합 처리" 보고
- GitHub Action 완료까지 약 30초~2분 소요
- push 실패 시 원인 분석 후 재시도 (최대 4회, 지수 백오프: 2s, 4s, 8s, 16s)

## 5. 다음 세션 준비사항
미완료 항목 중 다음 세션 최우선 작업을 명시합니다.
