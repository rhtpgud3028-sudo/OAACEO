# n8n 크래시 원인 및 자동 복구 프로세스 보고서

> **작성일**: 2025-12-30
> **목적**: AIASF 프로젝트에서 n8n 크래시 발생 시 자동 복구 체계 구축

---

## 1. 크래시 발생 원인 분석

### 📊 주요 원인

| 원인 | 설명 | 빈도 |
|------|------|------|
| **메모리 부족 (OOM)** | 워크플로우 실행 시 메모리 사용량 증가 → 크래시 | 🔴 높음 |
| **SQLite 사용** | 동시 접근, 대용량 처리에 취약 | 🟠 중간 |
| **실행 데이터 누적** | 실행 로그가 DB에 쌓여 메모리 점유 | 🟠 중간 |
| **대용량 데이터 처리** | 이미지, 영상 데이터 처리 시 메모리 폭증 | 🔴 높음 |
| **Code 노드 과다 사용** | JavaScript 실행 시 메모리 누수 가능 | 🟡 낮음 |

### 📈 AIASF 워크플로우 리스크 분석

| 노드 | 메모리 리스크 | 이유 |
|------|--------------|------|
| **DALL-E 이미지 생성** | 🟠 중간 | 바이너리 데이터 처리 |
| **Kling 비디오 생성** | 🔴 높음 | 대용량 비디오 URL 폴링 |
| **Typecast TTS** | 🟡 낮음 | 오디오 파일 상대적 소용량 |
| **Shotstack 렌더링** | 🟠 중간 | JSON 빌드 + 폴링 |
| **Code 노드 (Shotstack Builder)** | 🟠 중간 | 복잡한 로직 실행 |

---

## 2. 자동 복구 솔루션 비교

| 방법 | 자동 재시작 | 메모리 관리 | 설정 난이도 | 권장 |
|------|-----------|-----------|------------|------|
| **nohup (현재)** | ❌ 불가 | ❌ 불가 | ⭐ 쉬움 | ❌ |
| **PM2** | ✅ 가능 | ✅ 가능 (max_memory_restart) | ⭐⭐ 보통 | ✅ **권장** |
| **systemd** | ✅ 가능 | ❌ 제한적 | ⭐⭐⭐ 어려움 | 🟡 |
| **Docker** | ✅ 가능 | ✅ 가능 | ⭐⭐ 보통 | ✅ 권장 (신규 설치 시) |

---

## 3. PM2 자동 복구 구현 (권장)

### 3️⃣-1. PM2 설치

```bash
npm install -g pm2
```

### 3️⃣-2. n8n ecosystem 설정 파일 생성

```bash
cat > /root/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'n8n',
    script: 'n8n',
    args: 'start',
    env: {
      N8N_USER_FOLDER: '/root/.n8n',
      N8N_HOST: 'autoshort.site',
      N8N_PROTOCOL: 'https',
      WEBHOOK_URL: 'https://autoshort.site/',
      N8N_RESTRICT_FILE_ACCESS_TO: '/var/www',
      NODE_OPTIONS: '--max-old-space-size=1024'
    },
    // 🔥 핵심: 1GB 메모리 초과 시 자동 재시작
    max_memory_restart: '1G',
    // 크래시 시 자동 재시작
    autorestart: true,
    // 재시작 시도 횟수 제한 (무한 루프 방지)
    max_restarts: 10,
    // 재시작 간격 (ms)
    restart_delay: 5000,
    // 로그 설정
    error_file: '/root/n8n-error.log',
    out_file: '/root/n8n-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss'
  }]
}
EOF
```

### 3️⃣-3. PM2로 n8n 시작

```bash
# 기존 n8n 종료
pkill -9 -f n8n

# PM2로 시작
pm2 start /root/ecosystem.config.js

# 상태 확인
pm2 status

# 로그 확인
pm2 logs n8n
```

### 3️⃣-4. 서버 재부팅 시 자동 시작

```bash
# PM2 startup 설정
pm2 startup

# 현재 상태 저장
pm2 save
```

---

## 4. 메모리 최적화 환경변수

```bash
# 실행 데이터 저장 최소화 (메모리 감소)
export EXECUTIONS_DATA_SAVE_ON_SUCCESS=none
export EXECUTIONS_DATA_PRUNE=true
export EXECUTIONS_DATA_MAX_AGE=72

# V8 메모리 증가 (1GB)
export NODE_OPTIONS=--max-old-space-size=1024
```

---

## 5. 즉시 적용 명령어 (한 번에 실행)

```bash
# 1. PM2 설치
npm install -g pm2

# 2. 기존 n8n 종료
pkill -9 -f n8n

# 3. ecosystem 파일 생성
cat > /root/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'n8n',
    script: 'n8n',
    args: 'start',
    env: {
      N8N_USER_FOLDER: '/root/.n8n',
      N8N_HOST: 'autoshort.site',
      N8N_PROTOCOL: 'https',
      WEBHOOK_URL: 'https://autoshort.site/',
      N8N_RESTRICT_FILE_ACCESS_TO: '/var/www',
      NODE_OPTIONS: '--max-old-space-size=1024',
      EXECUTIONS_DATA_SAVE_ON_SUCCESS: 'none',
      EXECUTIONS_DATA_PRUNE: 'true',
      EXECUTIONS_DATA_MAX_AGE: '72'
    },
    max_memory_restart: '1G',
    autorestart: true,
    max_restarts: 10,
    restart_delay: 5000,
    error_file: '/root/n8n-error.log',
    out_file: '/root/n8n-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss'
  }]
}
EOF

# 4. PM2로 시작
pm2 start /root/ecosystem.config.js

# 5. 서버 재부팅 시 자동 시작
pm2 startup
pm2 save

# 6. 상태 확인
pm2 status
```

---

## 6. 결론

| 항목 | 현재 (nohup) | PM2 적용 후 |
|------|-------------|-------------|
| **크래시 시 자동 재시작** | ❌ 수동 필요 | ✅ 자동 |
| **메모리 초과 시 재시작** | ❌ 불가 | ✅ 1GB 초과 시 자동 |
| **서버 재부팅 시** | ❌ 수동 시작 | ✅ 자동 시작 |
| **로그 관리** | ❌ 단일 파일 | ✅ 분리 + 타임스탬프 |
| **모니터링** | ❌ 불가 | ✅ `pm2 monit` |

**권장사항**: 즉시 PM2로 전환하여 AIASF 운영 안정성 확보!
