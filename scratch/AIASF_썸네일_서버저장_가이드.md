# 🔧 DALL-E 이미지 서버 저장 노드 설정

## 문제
DALL-E 이미지 URL은 **임시 URL** (1-2시간 유효)
→ GPT Vision에서 다운로드 시 타임아웃 발생

## 해결
DALL-E Thumbnail 바로 다음에 **이미지 서버 저장 노드** 추가

---

## 워크플로우 구조 변경

### 현재 (문제 발생)
```
DALL-E Thumbnail → GPT Vision 분석 → GPT 스크립트
```

### 변경 후 (해결)
```
DALL-E Thumbnail → 이미지 저장 (HTTP Request) → GPT Vision 분석 → GPT 스크립트
```

---

## 노드 추가 가이드

### 1️⃣ HTTP Request 노드 추가 (이미지 다운로드)

**노드 이름**: `썸네일 다운로드`

| 설정 | 값 |
|------|---|
| Method | GET |
| URL | `{{ $json.url }}` |
| Response Format | File |

---

### 2️⃣ HTTP Request 노드 추가 (서버 업로드)

**노드 이름**: `썸네일 업로드`

| 설정 | 값 |
|------|---|
| Method | POST |
| URL | `https://autoshort.site/upload.php` |
| Body Content Type | Form-Data/Multipart |
| Body Parameter | `file` = Binary Data |

---

### 3️⃣ 서버에 upload.php 생성

```bash
ssh root@45.178.142.107
```

```bash
cat > /var/www/html/upload.php << 'EOF'
<?php
$targetDir = "/var/www/html/thumbnails/";
if (!file_exists($targetDir)) {
    mkdir($targetDir, 0755, true);
}

$filename = "thumb_" . time() . "_" . rand(1000, 9999) . ".png";
$targetFile = $targetDir . $filename;

if (move_uploaded_file($_FILES["file"]["tmp_name"], $targetFile)) {
    echo json_encode([
        "success" => true,
        "url" => "https://autoshort.site/thumbnails/" . $filename
    ]);
} else {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Upload failed"]);
}
?>
EOF
```

```bash
chmod 644 /var/www/html/upload.php
mkdir -p /var/www/html/thumbnails
chmod 755 /var/www/html/thumbnails
```

---

### 4️⃣ GPT Vision 분석 노드 URL 변경

**URL(s)**: `{{ $json.url }}`

(업로드 노드가 반환한 서버 URL 사용)

---

## 최종 연결

```
DALL-E Thumbnail 
    ↓
썸네일 다운로드 (HTTP Request GET)
    ↓
썸네일 업로드 (HTTP Request POST)
    ↓
GPT Vision 분석 (URL: {{ $json.url }})
    ↓
GPT 스크립트
```
