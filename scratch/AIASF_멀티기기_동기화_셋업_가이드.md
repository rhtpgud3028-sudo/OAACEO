# AIASF 멀티기기 동기화 셋업 가이드

> 작성일: 2026-02-19 | 목적: 메인/휴대용 노트북 + Claude Code 웹 세션 데이터 100% 동기화

---

## 🏗️ 전체 아키텍처

```
[Claude Code 웹 세션]
    /wrap → push → claude/XXXXX 브랜치
        ↓ GitHub Action 자동 실행 (30초~2분)
    [GitHub main 브랜치] ← 항상 최신 데이터
        ↓ Windows 작업 스케줄러 (30분마다)
    [메인 노트북 - Google Drive 폴더 안 git 레포]
        ↓ Google Drive 자동 동기화 (실시간)
    [휴대용 노트북 - Google Drive 동일 폴더]
```

**핵심**: GitHub = 중앙 데이터 저장소. Google Drive = 로컬 미러.

---

## ✅ STEP 1: 현재 레포 위치 확인 (메인 노트북)

PowerShell에서 실행:
```powershell
# 현재 git 레포 위치 확인
Get-Location  # 현재 디렉토리
git remote -v  # GitHub 원격 주소 확인

# Google Drive 폴더 경로 확인
$gdrive = [System.IO.Path]::Combine($env:LOCALAPPDATA, "Google", "Drive")
if (Test-Path $gdrive) { Write-Host "Google Drive 위치: $gdrive" }
# 또는 탐색기에서 Google Drive 아이콘 우클릭 → 폴더 위치 확인
```

### 결과별 조치
| 레포 위치 | 조치 |
|----------|------|
| `C:\Users\user\Google Drive\OAACEO` | ✅ 완벽! STEP 2로 |
| `C:\Users\user\Documents\OAACEO` 등 | ⚠️ STEP 1-B 실행 |

### STEP 1-B: 레포를 Google Drive 안으로 이동

```powershell
# Google Drive 경로 (실제 경로로 수정!)
$gdrivePath = "C:\Users\user\Google Drive"  # 또는 "G:\My Drive"

# 폴더 이동 (현재 위치에서 실행)
Move-Item -Path "C:\현재\OAACEO경로" -Destination "$gdrivePath\OAACEO"

# 이동 후 확인
Set-Location "$gdrivePath\OAACEO"
git status
git remote -v
```

---

## ✅ STEP 2: Windows 작업 스케줄러 설정 (메인 노트북)

`auto_sync_github.ps1`을 30분마다 자동 실행:

```powershell
# 관리자 권한 PowerShell에서 실행
$scriptPath = "C:\Users\user\Google Drive\OAACEO\auto_sync_github.ps1"  # 실제 경로로 수정!

$action = New-ScheduledTaskAction -Execute "PowerShell.exe" `
    -Argument "-NonInteractive -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$scriptPath`""

$trigger = New-ScheduledTaskTrigger -RepetitionInterval (New-TimeSpan -Minutes 30) `
    -Once -At (Get-Date)

$settings = New-ScheduledTaskSettingsSet -ExecutionTimeLimit (New-TimeSpan -Minutes 5)

Register-ScheduledTask -TaskName "AIASF_GitHub_AutoSync" `
    -Action $action -Trigger $trigger -Settings $settings `
    -RunLevel Highest -Force

Write-Host "✅ 작업 스케줄러 등록 완료 - 30분마다 GitHub sync 실행"
```

등록 확인:
```powershell
Get-ScheduledTask -TaskName "AIASF_GitHub_AutoSync" | Select-Object TaskName, State
```

---

## ✅ STEP 3: 휴대용 노트북 설정

### 3-1. Google Drive 로그인 확인
- 같은 구글 계정으로 Google Drive 앱 로그인
- `내 드라이브 > OAACEO` 폴더가 보이면 ✅

### 3-2. Git 초기 설정 (최초 1회만)
```powershell
# 휴대용 노트북에서 실행
# OAACEO 폴더가 Google Drive에서 이미 동기화됐는지 확인
$oaaceoPath = "C:\Users\user\Google Drive\OAACEO"  # 실제 경로로 수정!
Set-Location $oaaceoPath
git status  # 이미 git 레포면 바로 사용 가능!
```

Google Drive가 자동 동기화하므로 별도 git init 불필요.

### 3-3. 작업 스케줄러도 동일하게 등록 (STEP 2 반복)

---

## ✅ STEP 4: GitHub 최초 1회 설정 (현재 세션)

**지금 당장 해야 할 것:**

1. GitHub에서 PR 병합 (1회만 - 이후 자동):
   - `https://github.com/kohsehyung0328-bit/OAACEO`
   - `claude/start-session-OToVf` 브랜치의 PR 확인
   - **Merge pull request** 클릭
   - 이후 모든 `/wrap` 실행 시 GitHub Action이 자동으로 main 병합

2. GitHub Actions 권한 확인:
   - GitHub 레포 → Settings → Actions → General
   - "Workflow permissions" → **"Read and write permissions"** 선택
   - Save 클릭

---

## 🔄 완성 후 데이터 흐름

### Claude Code 웹 세션에서 작업 시
```
작업 → /wrap 실행
    → 위키 백업 + 헤더 갱신
    → git push claude/XXXXX
    → GitHub Action 자동 실행 (30초~2분)
    → main 브랜치 업데이트
    → 30분 내 메인 노트북 pull
    → Google Drive 실시간 동기화
    → 휴대용 노트북 수신 ✅
```

### 메인/휴대용 노트북 기기 전환 시
```
별도 작업 없음!
기기 켜면 Google Drive가 자동으로 최신 파일 동기화
```

---

## ⚠️ 주의사항

| 상황 | 조치 |
|------|------|
| Google Drive 오프라인 상태 | 네트워크 연결 후 자동 동기화 |
| 작업 스케줄러 실패 | `sync_log.txt` 확인 (레포 폴더 안) |
| 충돌(conflict) 발생 | Claude Code에 "충돌 해결해줘" 요청 |
| GitHub Action 실패 | GitHub → Actions 탭에서 오류 확인 |

---

## 📊 현재 완료 상태 체크리스트

- [x] GitHub 레포 생성 (`kohsehyung0328-bit/OAACEO`)
- [x] session-start.sh (웹 세션 시작 시 자동 pull)
- [x] wrap.md (/wrap 시 자동 push)
- [x] GitHub Action (push → main 자동 병합)
- [x] auto_sync_github.ps1 (Windows 30분 pull)
- [ ] **메인 노트북: 레포를 Google Drive 폴더로 이동** (확인 필요)
- [ ] **메인 노트북: 작업 스케줄러 등록**
- [ ] **휴대용 노트북: 작업 스케줄러 등록**
- [ ] **GitHub Actions 권한: Read and write 설정**
- [ ] **GitHub PR 병합: claude/start-session-OToVf → main** (1회)
