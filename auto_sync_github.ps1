# AIASF - GitHub 자동 동기화 스크립트
# 위치: Google Drive의 OAACEO 프로젝트 폴더에 저장
# 용도: Windows 작업 스케줄러로 자동 실행 → GitHub 최신 데이터 pull → Google Drive로 전파
# 설정: 30분마다 실행 권장

$LogFile = "$PSScriptRoot\sync_log.txt"
$Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

function Write-Log {
    param($Message)
    "$Timestamp - $Message" | Add-Content -Path $LogFile
    Write-Host "$Timestamp - $Message"
}

Write-Log "=== GitHub 자동 동기화 시작 ==="

# 스크립트가 있는 폴더 = git repo 루트
Set-Location $PSScriptRoot

# git 설치 확인
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Log "❌ git이 설치되지 않았습니다. https://git-scm.com 에서 설치하세요."
    exit 1
}

# git pull 실행
try {
    $Result = git pull origin main 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Log "✅ GitHub 동기화 완료: $Result"
    } else {
        Write-Log "⚠️  동기화 중 문제 발생: $Result"
    }
} catch {
    Write-Log "❌ 오류: $_"
}

# 로그 파일 최근 100줄만 유지
if (Test-Path $LogFile) {
    $Lines = Get-Content $LogFile
    if ($Lines.Count -gt 100) {
        $Lines[-100..-1] | Set-Content $LogFile
    }
}

Write-Log "=== 동기화 완료 ==="
