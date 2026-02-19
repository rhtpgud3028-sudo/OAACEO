[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::InputEncoding = [System.Text.Encoding]::UTF8

# Get actual GDrive folder name using dir /b
$gdriveFolders = Get-ChildItem "G:\" -Directory -ErrorAction SilentlyContinue
foreach ($folder in $gdriveFolders) {
    Write-Host ("GDrive root folder: [{0}] bytes: {1}" -f $folder.Name, [System.Text.Encoding]::UTF8.GetByteCount($folder.Name))
}

# Try to find AIASF_Project
$aiasf = Get-ChildItem "G:\" -Recurse -Directory -Filter "AIASF_Project" -Depth 2 -ErrorAction SilentlyContinue
if ($aiasf) {
    Write-Host ""
    Write-Host ("Found AIASF_Project at: {0}" -f $aiasf.FullName)

    $antigravity = Join-Path $aiasf.FullName "antigravity"
    if (Test-Path $antigravity) {
        Write-Host "antigravity folder exists"

        # Check key files
        $keyFiles = @(
            (Join-Path $antigravity "CLAUDE.md"),
            (Join-Path $antigravity "scratch")
        )

        foreach ($kf in $keyFiles) {
            $item = Get-Item $kf -ErrorAction SilentlyContinue
            if ($item) {
                Write-Host ("  Found: {0} Size:{1} Modified:{2}" -f $item.Name, $item.Length, $item.LastWriteTime)
            } else {
                Write-Host ("  NOT FOUND: {0}" -f $kf)
            }
        }

        # Check scratch contents
        $scratchPath = Join-Path $antigravity "scratch"
        if (Test-Path $scratchPath) {
            # Check wiki
            $wikiFiles = Get-ChildItem $scratchPath -Filter "*위키*" -ErrorAction SilentlyContinue
            foreach ($wf in $wikiFiles) {
                Write-Host ("  Wiki file: {0} Size:{1}B Modified:{2}" -f $wf.Name, $wf.Length, $wf.LastWriteTime)
            }

            # Check backup_wiki
            $bwPath = Join-Path $scratchPath "backup_wiki"
            if (Test-Path $bwPath) {
                $backups = Get-ChildItem $bwPath -File -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending | Select-Object -First 3
                foreach ($b in $backups) {
                    Write-Host ("  Backup: {0} Size:{1}B Modified:{2}" -f $b.Name, $b.Length, $b.LastWriteTime)
                }
            }

            # Count total files
            $gdriveFileCount = (Get-ChildItem $scratchPath -Recurse -File -ErrorAction SilentlyContinue).Count
            $localFileCount = (Get-ChildItem "C:\Users\user\.gemini\antigravity\scratch" -Recurse -File -ErrorAction SilentlyContinue).Count
            Write-Host ""
            Write-Host ("scratch file count - GDrive: {0}, Local: {1}" -f $gdriveFileCount, $localFileCount)
        }
    }
} else {
    Write-Host "AIASF_Project NOT FOUND in GDrive"
}

# Compare CLAUDE.md specifically
Write-Host ""
Write-Host "=== CLAUDE.md Comparison ==="
$localClaude = Get-Item "C:\Users\user\.gemini\antigravity\CLAUDE.md" -ErrorAction SilentlyContinue
Write-Host ("Local CLAUDE.md: Size={0}B Modified={1}" -f $localClaude.Length, $localClaude.LastWriteTime)

if ($aiasf) {
    $gdriveClaude = Get-Item (Join-Path $aiasf.FullName "antigravity\CLAUDE.md") -ErrorAction SilentlyContinue
    if ($gdriveClaude) {
        Write-Host ("GDrive CLAUDE.md: Size={0}B Modified={1}" -f $gdriveClaude.Length, $gdriveClaude.LastWriteTime)
        if ($localClaude.Length -eq $gdriveClaude.Length) {
            Write-Host "STATUS: MATCH"
        } else {
            Write-Host "STATUS: MISMATCH - Local is newer/different!"
        }
    }
}
