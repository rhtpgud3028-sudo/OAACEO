# LTXV API 테스트 스크립트 (Replicate)
# 실행 전 REPLICATE_API_TOKEN 환경변수 설정 필요

$env:REPLICATE_API_TOKEN = "YOUR_TOKEN_HERE"  # 실제 토큰으로 교체 필요

# 테스트 프롬프트 (5060 건강 콘텐츠 스타일)
$prompt = @"
A serene morning scene in a Korean traditional garden. An elderly Korean couple in their 60s is doing gentle stretching exercises together. 
Soft golden sunlight filters through the trees. 
The camera slowly pans across the peaceful garden setting. 
High quality, cinematic lighting, gentle movements, calming atmosphere.
"@

# API 요청 본문
$body = @{
    version = "8c47da666861d011f3f0fa49a6003ca0b57f13dfb2bec34e4ddf04a6d929c841"
    input   = @{
        prompt              = $prompt
        num_frames          = 97  # 약 4초 (24fps)
        width               = 768
        height              = 512
        num_inference_steps = 30
        guidance_scale      = 3.0
    }
} | ConvertTo-Json -Depth 3

Write-Host "=== LTXV API 테스트 시작 ===" -ForegroundColor Cyan
Write-Host "프롬프트: $prompt" -ForegroundColor Yellow
Write-Host ""

# API 호출
try {
    $response = Invoke-RestMethod -Uri "https://api.replicate.com/v1/predictions" `
        -Method POST `
        -Headers @{
        "Authorization" = "Bearer $env:REPLICATE_API_TOKEN"
        "Content-Type"  = "application/json"
    } `
        -Body $body
    
    Write-Host "예측 ID: $($response.id)" -ForegroundColor Green
    Write-Host "상태: $($response.status)" -ForegroundColor Green
    Write-Host ""
    Write-Host "결과 확인 URL: https://replicate.com/p/$($response.id)" -ForegroundColor Cyan
    
    # 결과를 파일로 저장
    $response | ConvertTo-Json -Depth 5 | Out-File -FilePath "ltxv_test_response.json" -Encoding UTF8
    Write-Host "응답 저장됨: ltxv_test_response.json" -ForegroundColor Green
    
}
catch {
    Write-Host "오류 발생: $_" -ForegroundColor Red
    Write-Host "상세: $($_.Exception.Message)" -ForegroundColor Red
}
