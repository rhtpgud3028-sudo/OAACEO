# Shotstack API Test Script for PowerShell
# Usage: .\test_shotstack.ps1 -ApiKey "YOUR_API_KEY"

param(
    [Parameter(Mandatory=$true)]
    [string]$ApiKey
)

$StageUrl = "https://api.shotstack.io/stage/render"

Write-Host "🚀 Testing Shotstack API..." -ForegroundColor Cyan
Write-Host ""

# Read template
$Template = Get-Content -Path ".\shotstack_test_template.json" -Raw

# Make API request
$Headers = @{
    "Content-Type" = "application/json"
    "x-api-key" = $ApiKey
}

try {
    $Response = Invoke-RestMethod -Uri $StageUrl -Method Post -Headers $Headers -Body $Template
    
    Write-Host "✅ Render request submitted successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📤 Response:" -ForegroundColor Yellow
    $Response | ConvertTo-Json -Depth 10
    
    $RenderId = $Response.response.id
    
    if ($RenderId) {
        Write-Host ""
        Write-Host "🎬 Render ID: $RenderId" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "⏳ Waiting 15 seconds for rendering..." -ForegroundColor Yellow
        Start-Sleep -Seconds 15
        
        # Check status
        $StatusUrl = "https://api.shotstack.io/stage/render/$RenderId"
        $StatusResponse = Invoke-RestMethod -Uri $StatusUrl -Method Get -Headers $Headers
        
        Write-Host ""
        Write-Host "📊 Status Response:" -ForegroundColor Yellow
        $StatusResponse | ConvertTo-Json -Depth 10
        
        $Status = $StatusResponse.response.status
        $Url = $StatusResponse.response.url
        
        Write-Host ""
        if ($Status -eq "done") {
            Write-Host "🎉 Rendering complete!" -ForegroundColor Green
            Write-Host "📺 Video URL: $Url" -ForegroundColor Cyan
        } elseif ($Status -eq "rendering") {
            Write-Host "⏳ Still rendering... Check again in a few seconds." -ForegroundColor Yellow
            Write-Host "Use this command to check:" -ForegroundColor Gray
            Write-Host "Invoke-RestMethod -Uri '$StatusUrl' -Headers @{'x-api-key'='$ApiKey'}" -ForegroundColor Gray
        } else {
            Write-Host "📋 Status: $Status" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
    Write-Host $_.Exception.Response -ForegroundColor Red
}
