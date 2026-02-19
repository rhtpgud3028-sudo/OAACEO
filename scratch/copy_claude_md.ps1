[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$src = "C:\Users\user\.gemini\antigravity\CLAUDE.md"
$dst = "G:\내 드라이브\AIASF_Project\antigravity\CLAUDE.md"

Copy-Item $src $dst -Force
$result = Get-Item $dst
Write-Host "CLAUDE.md copied to GDrive successfully!"
Write-Host ("Size: {0}B" -f $result.Length)
Write-Host ("Modified: {0}" -f $result.LastWriteTime)

# Verify
$srcFile = Get-Item $src
if ($srcFile.Length -eq $result.Length) {
    Write-Host "VERIFIED: Sizes match!"
} else {
    Write-Host "WARNING: Size mismatch!"
}
