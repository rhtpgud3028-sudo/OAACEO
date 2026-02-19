# 체크포인트 시스템 완성 가이드

> **목적**: 워크플로우 중간 실패 시 이미 생성된 Kling/DALL-E/TTS 데이터 재활용 → 88% 비용 보호
> **작성일**: 2026-01-12

---

## 📋 구성 요소

| 구성요소 | 위치 | 역할 |
|---------|------|------|
| `checkpoint.php` | autoshort.site 서버 | 체크포인트 데이터 저장/로드 API |
| `Session ID 생성` | n8n 워크플로우 맨 앞 | 각 실행마다 고유 ID 생성 |
| `CP 저장 - Kling` | Kling 완료 후 | Kling 영상 URL 저장 |
| `CP 저장 - Images` | DALL-E 완료 후 | 이미지 URL들 저장 |
| `CP 저장 - TTS` | TTS 완료 후 | TTS 오디오 URL 저장 |
| `복구 워크플로우` | 별도 워크플로우 | 체크포인트에서 복구하여 재합성 |

---

## 1️⃣ 서버: checkpoint.php 설치

### SSH 접속 후 파일 생성

```bash
sudo nano /var/www/html/checkpoint.php
```

### 파일 내용:

```php
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$dataDir = '/var/www/html/checkpoints/';

// 디렉토리 생성
if (!is_dir($dataDir)) {
    mkdir($dataDir, 0755, true);
}

$action = $_GET['action'] ?? '';
$sessionId = $_GET['session_id'] ?? '';

if (empty($sessionId)) {
    echo json_encode(['success' => false, 'error' => 'Missing session_id']);
    exit;
}

$filePath = $dataDir . $sessionId . '.json';

switch ($action) {
    case 'save':
        // 데이터 저장
        $input = file_get_contents('php://input');
        $newData = json_decode($input, true);
        
        if (empty($newData)) {
            echo json_encode(['success' => false, 'error' => 'Missing data']);
            exit;
        }
        
        // 기존 데이터 로드 (있으면)
        $existingData = [];
        if (file_exists($filePath)) {
            $existingData = json_decode(file_get_contents($filePath), true) ?? [];
        }
        
        // 단계별 저장 (step 필드로 구분)
        $step = $newData['step'] ?? 'unknown';
        $existingData[$step] = $newData;
        $existingData['updated_at'] = date('Y-m-d H:i:s');
        $existingData['session_id'] = $sessionId;
        
        // 저장
        file_put_contents($filePath, json_encode($existingData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        
        echo json_encode([
            'success' => true,
            'message' => "Checkpoint saved: $step",
            'session_id' => $sessionId
        ]);
        break;
        
    case 'load':
        // 데이터 로드
        if (!file_exists($filePath)) {
            echo json_encode(['success' => false, 'error' => 'Checkpoint not found']);
            exit;
        }
        
        $data = json_decode(file_get_contents($filePath), true);
        echo json_encode([
            'success' => true,
            'data' => $data
        ]);
        break;
        
    case 'status':
        // 현재 저장된 단계 확인
        if (!file_exists($filePath)) {
            echo json_encode([
                'success' => true,
                'exists' => false,
                'steps' => []
            ]);
            exit;
        }
        
        $data = json_decode(file_get_contents($filePath), true);
        $steps = array_keys($data);
        $steps = array_filter($steps, fn($k) => !in_array($k, ['updated_at', 'session_id']));
        
        echo json_encode([
            'success' => true,
            'exists' => true,
            'steps' => array_values($steps),
            'updated_at' => $data['updated_at'] ?? null
        ]);
        break;
        
    case 'delete':
        // 체크포인트 삭제
        if (file_exists($filePath)) {
            unlink($filePath);
        }
        echo json_encode(['success' => true, 'message' => 'Checkpoint deleted']);
        break;
        
    default:
        echo json_encode(['success' => false, 'error' => 'Invalid action']);
}
?>
```

### 권한 설정:

```bash
sudo chmod 755 /var/www/html/checkpoint.php
sudo mkdir -p /var/www/html/checkpoints
sudo chown -R www-data:www-data /var/www/html/checkpoints
sudo chmod 755 /var/www/html/checkpoints
```

---

## 2️⃣ n8n: Session ID 생성 노드

### 위치: Manual Trigger 바로 다음

### 노드 타입: Code

### 이름: `Session ID 생성`

### JavaScript 코드:

```javascript
// 고유 세션 ID 생성 (타임스탬프 + 랜덤)
const timestamp = Date.now();
const random = Math.random().toString(36).substring(2, 8);
const sessionId = `aiasf_${timestamp}_${random}`;

return [{
  json: {
    session_id: sessionId,
    created_at: new Date().toISOString()
  }
}];
```

---

## 3️⃣ n8n: CP 저장 노드 설정

### 3.1 CP 저장 - Kling (Kling Polling 완료 후)

**노드 타입**: HTTP Request

**설정**:
- **Method**: POST
- **URL**: 
```
https://autoshort.site/checkpoint.php?action=save&session_id={{ $('Session ID 생성').item.json.session_id }}
```
- **Body Content Type**: JSON
- **Body**:
```json
{
  "step": "kling",
  "intro_video_url": "{{ $('Kling Polling Intro').item.json.data.output.video_url }}",
  "outro_video_url": "{{ $('Kling Polling Outro').item.json.data.output.video_url }}"
}
```

---

### 3.2 CP 저장 - Images (Merge Images 후)

**노드 타입**: HTTP Request

**설정**:
- **Method**: POST
- **URL**: 
```
https://autoshort.site/checkpoint.php?action=save&session_id={{ $('Session ID 생성').item.json.session_id }}
```
- **Body Content Type**: JSON
- **Body** (Code 노드로 구성 권장):
```javascript
const images = $('Merge Images').item.json.images || [];

return [{
  json: {
    step: "images",
    image_urls: images
  }
}];
```

---

### 3.3 CP 저장 - TTS (Save Audio 후)

**노드 타입**: HTTP Request

**설정**:
- **Method**: POST
- **URL**: 
```
https://autoshort.site/checkpoint.php?action=save&session_id={{ $('Session ID 생성').item.json.session_id }}
```
- **Body Content Type**: JSON
- **Body**:
```json
{
  "step": "tts",
  "audio_url": "{{ $('Save Audio').item.json.url }}"
}
```

---

## 4️⃣ n8n: 복구 워크플로우 (별도 생성)

### 워크플로우 이름: `AIASF Recovery`

### 노드 구성:

```
[Manual Trigger] 
    → [Session ID 입력 (Set 노드)]
    → [체크포인트 로드 (HTTP Request)]
    → [IF: 데이터 있음?]
        → True: [Shotstack 렌더링 (Code 노드)] → [Shotstack HTTP] → [YouTube 업로드]
        → False: [에러 알림]
```

### 체크포인트 로드 노드:

**Method**: GET
**URL**:
```
https://autoshort.site/checkpoint.php?action=load&session_id={{ $json.session_id }}
```

### Shotstack 복구 Code 노드:

```javascript
const checkpoint = $('체크포인트 로드').item.json.data;

// 체크포인트에서 데이터 추출
const introVideo = checkpoint.kling?.intro_video_url || "";
const outroVideo = checkpoint.kling?.outro_video_url || "";
const images = checkpoint.images?.image_urls || [];
const audioUrl = checkpoint.tts?.audio_url || "";

// 기존 Code 노드 로직 활용하여 Shotstack JSON 생성
// ... (n8n_shotstack_builder_v20.3.js 로직 적용)

return [{
  json: {
    bodyString: JSON.stringify(shotstackBody),
    // ... 기타 필드
  }
}];
```

---

## 5️⃣ 테스트 방법

### API 테스트:

```bash
# 저장 테스트
curl -X POST "https://autoshort.site/checkpoint.php?action=save&session_id=test_123" \
  -H "Content-Type: application/json" \
  -d '{"step":"kling","video_url":"https://example.com/video.mp4"}'

# 로드 테스트
curl "https://autoshort.site/checkpoint.php?action=load&session_id=test_123"

# 상태 확인
curl "https://autoshort.site/checkpoint.php?action=status&session_id=test_123"

# 삭제
curl "https://autoshort.site/checkpoint.php?action=delete&session_id=test_123"
```

---

## 📊 비용 보호 효과

| 시나리오 | 손실 (체크포인트 없음) | 손실 (체크포인트 있음) | 절감율 |
|---------|---------------------|---------------------|--------|
| Shotstack 실패 | $1.00 전체 | $0 (복구) | **100%** |
| TTS 후 실패 | $0.96 (Kling+DALL-E) | $0 (복구) | **100%** |
| DALL-E 후 실패 | $0.64 (Kling) | $0 (복구) | **100%** |

---

## ⚡ 즉시 적용 순서

1. ✅ SSH 접속 → checkpoint.php 생성
2. ✅ n8n → Session ID 생성 노드 추가 (맨 앞)
3. ✅ CP 저장 노드들 연결 수정
4. ✅ API 테스트
5. ⏳ 복구 워크플로우 생성 (나중에)
