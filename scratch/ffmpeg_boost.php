<?php
// ============================================================
// FFmpeg Volume Boost Script
// 경로: https://autoshort.site/audio/boost.php
// ============================================================
// 사용법: POST /audio/boost.php
// Body: { "input_file": "tts_123.mp3", "volume": 2.0 }
// 응답: { "success": true, "url": "https://autoshort.site/audio/boosted_tts_123.mp3" }
// ============================================================

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// 입력 파싱
$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['input_file'])) {
    echo json_encode(['success' => false, 'error' => 'input_file required']);
    exit;
}

$inputFile = basename($input['input_file']); // 보안: 경로 조작 방지
$volume = isset($input['volume']) ? floatval($input['volume']) : 2.0;

// 볼륨 범위 제한 (1.0 ~ 4.0)
$volume = max(1.0, min(4.0, $volume));

// 파일 경로
$audioDir = __DIR__;
$inputPath = $audioDir . '/' . $inputFile;
$outputFile = 'boosted_' . $inputFile;
$outputPath = $audioDir . '/' . $outputFile;

// 입력 파일 확인
if (!file_exists($inputPath)) {
    echo json_encode(['success' => false, 'error' => 'Input file not found: ' . $inputFile]);
    exit;
}

// FFmpeg 명령어 실행
$command = sprintf(
    'ffmpeg -i %s -filter:a "volume=%s" -y %s 2>&1',
    escapeshellarg($inputPath),
    $volume,
    escapeshellarg($outputPath)
);

$output = [];
$returnCode = 0;
exec($command, $output, $returnCode);

if ($returnCode !== 0 || !file_exists($outputPath)) {
    echo json_encode([
        'success' => false, 
        'error' => 'FFmpeg failed',
        'command' => $command,
        'output' => implode("\n", $output)
    ]);
    exit;
}

// 성공 응답
$baseUrl = 'https://autoshort.site/audio/';
echo json_encode([
    'success' => true,
    'url' => $baseUrl . $outputFile,
    'original_file' => $inputFile,
    'boosted_file' => $outputFile,
    'volume' => $volume
]);
