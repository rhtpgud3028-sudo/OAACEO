# DALL-E 이미지 서버 저장 노드 설정 가이드

> **5회 딥다이브 검증 완료** (2026-01-09)

---

## 📋 사전 확인 (서버)

### 1️⃣ 권한 확인

```bash
ssh root@45.178.142.107
ls -la /var/www/html/thumbnails
```

**정상 결과:**
```
drwxr-xr-x 2 www-data www-data 4096 Jan  9 12:20 .
```

**문제 있으면 실행:**
```bash
chown -R www-data:www-data /var/www/html/thumbnails
chmod 755 /var/www/html/thumbnails
```

---

## 📋 n8n 노드 설정

### 1️⃣ 썸네일 다운로드 노드

**위치**: `DALL-E Thumbnail` 출력 오른쪽에 추가

**추가 방법:**
1. `DALL-E Thumbnail` 노드 출력 핀에서 선 드래그
2. `HTTP Request` 검색 → 클릭

**설정:**
| 항목 | 값 | 위치 |
|------|---|------|
| 노드 이름 | `썸네일 다운로드` | 상단 제목 더블클릭 |
| Method | `GET` | Parameters 탭 |
| URL | `{{ $json.url }}` | Parameters 탭 |
| Response Format | `File` | Options → Add Option → Response Format |

**⚠️ 주의:**
- Response Format은 **Options** 섹션에서 Add Option 클릭 후 추가!
- 기본값이 `JSON`이면 파일 다운로드 안 됨!

---

### 2️⃣ 썸네일 업로드 노드

**위치**: `썸네일 다운로드` 출력 오른쪽에 추가

**추가 방법:**
1. `썸네일 다운로드` 노드 출력 핀에서 선 드래그
2. `HTTP Request` 검색 → 클릭

**설정:**
| 항목 | 값 | 위치 |
|------|---|------|
| 노드 이름 | `썸네일 업로드` | 상단 제목 더블클릭 |
| Method | `POST` | Parameters 탭 |
| URL | `https://autoshort.site/upload.php` | Parameters 탭 |
| Send Body | ✅ ON | Parameters 탭 |
| Body Content Type | `Form-Data` | Parameters 탭 (Send Body 켜면 나타남) |

**Body Parameters 추가:**
1. "Add Parameter" 버튼 클릭
2. 설정:
   - **Parameter Type**: `n8n Binary File` (드롭다운에서 선택)
   - **Name**: `file` (PHP의 $_FILES["file"]과 일치해야 함!)
   - **Input Data Field Name**: `data` (썸네일 다운로드 노드가 출력한 바이너리 필드명)

**⚠️ 주의:**
- Parameter Type을 `String`으로 하면 파일 업로드 안 됨!
- Name이 `file`이 아니면 PHP에서 받지 못함!

---

### 3️⃣ GPT Vision 분석 노드 수정

**기존 연결 해제:**
1. `DALL-E Thumbnail` → `GPT Vision 분석` 연결선 삭제
   - 선 클릭 → Delete 키 또는 우클릭 → Delete

**새 연결:**
1. `썸네일 업로드` 출력 → `GPT Vision 분석` 입력 연결

**URL 수정:**
1. `GPT Vision 분석` 노드 클릭
2. **URL(s)** 필드 찾기
3. 기존 값 삭제: `{{ $json.data[0].url }}`
4. 새 값 입력: `{{ $json.url }}`

**⚠️ 주의:**
- 업로드 노드가 반환하는 JSON 구조: `{ "success": true, "url": "https://..." }`
- 따라서 `$json.url`로 접근!

---

## 📊 최종 연결 구조

```
DALL-E Thumbnail
       ↓
썸네일 다운로드 (HTTP GET, Response Format: File)
       ↓
썸네일 업로드 (HTTP POST, Form-Data)
       ↓
GPT Vision 분석 (URL: {{ $json.url }})
       ↓
GPT 스크립트
```

---

## ✅ 테스트 방법

### 개별 노드 테스트

1. **DALL-E Thumbnail** 노드만 Execute → 이미지 생성 확인
2. **썸네일 다운로드** 노드만 Execute → Binary 탭에 `data` 확인
3. **썸네일 업로드** 노드만 Execute → `{ "success": true, "url": "https://..." }` 확인
4. **GPT Vision 분석** 노드만 Execute → 이미지 분석 결과 확인

### 서버 확인

```bash
ls -la /var/www/html/thumbnails/
```

`thumb_xxxxxx.png` 파일이 생성되어 있어야 함!

---

## 🔧 문제 해결

### 썸네일 다운로드 실패

| 증상 | 원인 | 해결 |
|------|------|------|
| Binary 탭 비어있음 | Response Format이 File이 아님 | Options → Response Format → File |
| 타임아웃 | DALL-E URL 만료 | DALL-E 노드부터 다시 실행 |

### 썸네일 업로드 실패

| 증상 | 원인 | 해결 |
|------|------|------|
| 500 에러 | 서버 권한 문제 | `chown www-data:www-data thumbnails` |
| `{"success":false}` | PHP 오류 | 서버 로그 확인: `tail -f /var/log/nginx/error.log` |
| 빈 응답 | Body 설정 오류 | Parameter Type = n8n Binary File 확인 |

### GPT Vision 실패

| 증상 | 원인 | 해결 |
|------|------|------|
| URL 오류 | 잘못된 URL 표현식 | `{{ $json.url }}` 확인 |
| 이미지 분석 실패 | URL 접근 불가 | 브라우저에서 URL 직접 접속 테스트 |
