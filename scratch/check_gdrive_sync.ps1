[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$localBase = "C:\Users\user\.gemini\antigravity"
$gdriveBase = "G:\내 드라이브\AIASF_Project\antigravity"

$files = @(
    "scratch\프로젝트_위키_통합.md",
    "scratch\backup_wiki\프로젝트_위키_통합_backup_20260215_1123.md",
    "scratch\n8n_shotstack_builder_v20.37.js",
    "scratch\AIASF_GPT_Prompt_v6.17.md",
    "scratch\n8n_branding_router_v5.js",
    "scratch\AIASF_Phase2_ChannelConfig.json",
    "CLAUDE.md"
)

Write-Host "=== 핵심 파일 동기화 검증 ==="
Write-Host ""

foreach ($f in $files) {
    $localPath = Join-Path $localBase $f
    $gdrivePath = Join-Path $gdriveBase $f

    $local = Get-Item $localPath -ErrorAction SilentlyContinue
    $gdrive = Get-Item $gdrivePath -ErrorAction SilentlyContinue

    $localSize = if ($local) { $local.Length } else { "N/A" }
    $gdriveSize = if ($gdrive) { $gdrive.Length } else { "N/A" }

    if ($local -and $gdrive) {
        if ($local.Length -eq $gdrive.Length) {
            $status = "OK"
        } else {
            $status = "MISMATCH (Local:$localSize vs GDrive:$gdriveSize)"
        }
    } elseif (-not $gdrive) {
        $status = "MISSING_GDRIVE"
    } elseif (-not $local) {
        $status = "MISSING_LOCAL"
    } else {
        $status = "UNKNOWN"
    }

    $shortName = $f.Split("\")[-1]
    Write-Host "$shortName : [$status]"
}

Write-Host ""
Write-Host "=== 전체 파일 수 비교 ==="
$localCount = (Get-ChildItem $localBase -Recurse -File -ErrorAction SilentlyContinue).Count
$gdriveCount = (Get-ChildItem $gdriveBase -Recurse -File -ErrorAction SilentlyContinue).Count
Write-Host "Local files: $localCount"
Write-Host "GDrive files: $gdriveCount"
