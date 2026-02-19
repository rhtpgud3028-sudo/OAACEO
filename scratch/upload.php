<?php
$type = isset($_REQUEST["type"]) ? $_REQUEST["type"] : "image";

if ($type === "audio") {
    $targetDir = "/var/www/html/audio/";
    $ext = ".mp3";
    $prefix = "hook_";
} else {
    $targetDir = "/var/www/html/thumbnails/";
    $ext = ".webp";
    $prefix = "thumb_";
}

if (!file_exists($targetDir)) {
    mkdir($targetDir, 0755, true);
}

$filename = $prefix . time() . "_" . rand(1000, 9999) . $ext;
$targetFile = $targetDir . $filename;
$saved = false;

if ($type === "audio") {
    // Method 1: raw binary (php://input)
    $rawData = file_get_contents("php://input");
    if (!empty($rawData) && strlen($rawData) > 100) {
        file_put_contents($targetFile, $rawData);
        $saved = file_exists($targetFile);
    }
    // Method 2: multipart form - "data" field (n8n Binary File)
    if (!$saved && isset($_FILES["data"])) {
        move_uploaded_file($_FILES["data"]["tmp_name"], $targetFile);
        $saved = file_exists($targetFile);
    }
    // Method 3: multipart form - "file" field (fallback)
    if (!$saved && isset($_FILES["file"])) {
        move_uploaded_file($_FILES["file"]["tmp_name"], $targetFile);
        $saved = file_exists($targetFile);
    }
} else {
    // Image compression (WebP)
    if (isset($_FILES["file"])) {
        $image = imagecreatefromstring(file_get_contents($_FILES["file"]["tmp_name"]));
        if ($image) {
            imagewebp($image, $targetFile, 80);
            imagedestroy($image);
            $saved = file_exists($targetFile);
        }
    } elseif (isset($_FILES["data"])) {
        $image = imagecreatefromstring(file_get_contents($_FILES["data"]["tmp_name"]));
        if ($image) {
            imagewebp($image, $targetFile, 80);
            imagedestroy($image);
            $saved = file_exists($targetFile);
        }
    }
}

echo json_encode([
    "success" => $saved,
    "url" => $saved ? "https://autoshort.site/" . ($type === "audio" ? "audio/" : "thumbnails/") . $filename : null,
    "error" => $saved ? null : "File not saved"
]);
?>
