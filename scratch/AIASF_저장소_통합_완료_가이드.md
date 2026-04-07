# AIASF 저장소 통합 완료 가이드

> **작성일**: 2026-04-07
> **작업**: 분산 저장소(2개 GitHub 계정 + Google Drive) → 단일 레포 통합
> **상태**: 코드/워크플로우 완료, 백업 레포 수동 생성 필요 (1회)

---

## 1. 통합 결과 (완료된 것)

### 새 저장소 구조

| 레포 | 역할 | 상태 |
|------|------|------|
| `rhtpgud3028-sudo/OAACEO` | **메인 (단일 소스)** | ✅ 운영 중 |
| `rhtpgud3028-sudo/OAACEO-backup` | 자동 백업 미러 | ⏳ 수동 생성 필요 |
| `kohsehyung0328-bit/OAACEO` | 구 레포 (비활성) | 이슈 시 참조만 |

### 완료된 파일 변경

| 파일 | 변경 내용 |
|------|---------|
| `.github/workflows/backup-mirror.yml` | **신규**: main push 시 OAACEO-backup 자동 미러 |
| `.github/workflows/auto-merge-to-main.yml` | 유지 (변경 없음) |
| `.claude/hooks/session-start.sh` | 레포 정보 주석 추가 |
| `auto_sync_github.ps1` | 레포 URL 명시 주석 추가 |
| `CLAUDE.md` 섹션 5 | 단일 레포 구조 + 백업 설정 방법 업데이트 |
| `scratch/프로젝트_위키_통합.md` | 저장소 구조 섹션 추가, 헤더 업데이트 |

---

## 2. 남은 수동 작업 (1회)

### Step A: OAACEO-backup 레포 생성

1. GitHub 접속: https://github.com/new
2. Repository name: `OAACEO-backup`
3. Owner: `rhtpgud3028-sudo`
4. **Private** 선택
5. Description: `OAACEO 자동 백업 레포 - 메인: rhtpgud3028-sudo/OAACEO`
6. "Create repository" 클릭 (README 초기화는 선택)

### Step B: PAT 생성

1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. "Generate new token (classic)" 클릭
3. Note: `OAACEO-backup-mirror`
4. Expiration: `No expiration` (또는 1년)
5. Scopes: **repo** (전체 체크)
6. "Generate token" → 토큰 값 복사 (한 번만 표시됨!)

### Step C: Secret 등록

1. `rhtpgud3028-sudo/OAACEO` 레포 → Settings → Secrets and variables → Actions
2. "New repository secret" 클릭
3. Name: `BACKUP_REPO_PAT`
4. Secret: (Step B에서 복사한 PAT)
5. "Add secret" 클릭

### Step D: 검증

```bash
# 수동 트리거 테스트
# GitHub → OAACEO 레포 → Actions → "main → OAACEO-backup 자동 미러"
# → "Run workflow" → "Run workflow"
```

---

## 3. 이후 자동화 흐름

```
Claude Code 세션 종료 (/wrap)
  └─ git push claude/* branch
       └─ GitHub Actions: auto-merge-to-main.yml (즉시 실행)
            └─ main 브랜치 자동 병합
                 └─ GitHub Actions: backup-mirror.yml (즉시 실행)
                      └─ rhtpgud3028-sudo/OAACEO-backup 업데이트
                           └─ (또한) 매일 03:00 UTC 정기 실행

Windows 작업 스케줄러 (30분 간격)
  └─ auto_sync_github.ps1 실행
       └─ git pull origin main (rhtpgud3028-sudo/OAACEO)
            └─ Google Drive 자동 동기화
                 └─ 휴대용 노트북 수신
```

---

## 4. Windows 최초 설정 (새 PC 또는 재설치 시)

```powershell
# 1. 레포 클론
git clone https://github.com/rhtpgud3028-sudo/OAACEO.git "C:\Users\[사용자]\Google Drive\OAACEO"

# 2. 자동 동기화 설정 (작업 스케줄러)
# - 트리거: 30분마다
# - 프로그램: powershell.exe
# - 인수: -ExecutionPolicy Bypass -File "C:\...\OAACEO\auto_sync_github.ps1"
```

---

## 5. 문제 발생 시

| 증상 | 원인 | 해결 |
|------|------|------|
| backup-mirror.yml 실패 | BACKUP_REPO_PAT 없음 | Step C 수행 |
| backup-mirror.yml 실패 | OAACEO-backup 레포 없음 | Step A 수행 |
| Windows pull 실패 | git 인증 만료 | git credential 재설정 |
| session-start.sh pull 실패 | 로컬 변경사항 있음 | 정상 (수동 처리) |

---

## 6. kohsehyung0328-bit/OAACEO 처리

- **현재**: 비활성 상태 (이 세션에서 접근 불가)
- **향후**: 해당 계정 접근 가능 시, 고유 데이터 있는지 확인 후 필요 시 rhtpgud3028-sudo/OAACEO로 이전
- **기준**: rhtpgud3028-sudo/OAACEO가 단일 소스 오브 트루스
