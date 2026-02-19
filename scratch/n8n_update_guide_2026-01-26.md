# n8n 셀프호스팅 업데이트 가이드

> **작성일**: 2026-01-26
> **현재 상태**: 4버전 뒤쳐진 상태 (Update 알림 확인)
> **현재 버전**: v1.121.2 (위키 기준)

---

## 🔍 업데이트 알림 분석

대표님 스크린샷에서 확인된 내용:

![n8n 업데이트 알림](file:///C:/Users/user/.gemini/antigravity/brain/78dacadf-2f6b-4773-9fee-c02857b582d5/uploaded_media_1_1769390040690.png)

### What's New 섹션 확인:
| 기능 | 설명 | 중요도 |
|------|------|--------|
| **Instance-level MCP** | AI 클라이언트에서 n8n 워크플로우 직접 호출 가능 | 🔵 선택 |
| **Guardrails node** | AI 안전/보안 정책 적용 노드 | 🔵 선택 |
| **New ways to authenticate in MCP Client tool** | MCP 클라이언트 인증 방식 추가 | 🔵 선택 |

---

## 🚨 Breaking Change 분석 (중요!)

### n8n 1.78.0 Breaking Change

> ⚠️ **Code 노드 구문 변경** (Task Runner 도입 관련)

| 변경 전 (이전 버전) | 변경 후 (1.78.0+) |
|---------------------|-------------------|
| `$items('NodeName')` | `$('NodeName').all()` |

**영향 분석**:
- 대표님 현재 버전: **v1.121.2** (이미 1.78.0 이후 버전!)
- ✅ **이 Breaking Change는 이미 적용됨!**
- ✅ AIASF 워크플로우 Code 노드는 이미 `$('NodeName').first()` 패턴 사용 중

### 대표님 워크플로우 영향 여부:

```javascript
// 현재 AIASF Code 노드 패턴 (문제 없음!)
$('3. GPT 스크립트').first()?.json?.message?.content
$('Branding Router').first().json
$('6. ElevenLabs TTS').first()?.json?.alignment

// ✅ 모두 신규 문법 사용 중! Breaking Change 영향 없음!
```

---

## 📋 신규 기능 상세 분석

### 1️⃣ Instance-level MCP (Model Context Protocol)

**개념**: AI 클라이언트 (Claude, ChatGPT 등)에서 n8n 워크플로우를 도구처럼 직접 호출

**활성화 방법**:
1. Instance Settings → MCP Access
2. OAuth2 또는 Access Token 생성
3. 개별 워크플로우에서 "Available in MCP" 토글 활성화

**AIASF 프로젝트 활용도**: 🔵 낮음
- 현재 워크플로우는 Schedule Trigger 자동 실행 방식
- MCP는 AI 에이전트 연동용 → 지금 필요 없음

---

### 2️⃣ Guardrails Node

**개념**: AI 콘텐츠 안전/보안 정책 적용

**기능**:
| 모드 | 설명 |
|------|------|
| **Check Mode** | 텍스트 검사 후 위반 플래그 (Jailbreak, NSFW, 토픽 정렬) |
| **Sanitize Mode** | 문제 콘텐츠 자동 제거 (URL, PII, 비밀키 등) |

**AIASF 프로젝트 활용도**: 🟡 중간
- GPT 스크립트 출력에 부적절 콘텐츠 필터링 가능
- Phase 2 확장 시 고려 가능

---

## 🔧 셀프호스팅 업데이트 절차

### 대표님 환경 확인:
- **설치 방식**: npm (Self-Hosted on LightNode)
- **프로세스 관리**: PM2
- **현재 버전**: v1.121.2

### ✅ 업데이트 전 필수 체크리스트

| # | 항목 | 명령어 |
|---|------|--------|
| 1 | 📦 n8n 백업 | `pm2 stop n8n && cp -r ~/.n8n ~/n8n_backup_$(date +%Y%m%d)` |
| 2 | 📋 워크플로우 Export | n8n UI에서 JSON 다운로드 |
| 3 | 🔑 Credentials 백업 | `~/.n8n/database.sqlite` 복사 |
| 4 | 📝 Release Notes 확인 | [공식 릴리스 노트](https://docs.n8n.io/release-notes/) |

---

## 📌 업데이트 실행 가이드 (npm 설치 기준)

### 방법 1: 안전한 단계별 업데이트 (권장)

```bash
# 1️⃣ 서버 SSH 접속
ssh -i ~/.ssh/id_rsa root@38.60.220.9

# 2️⃣ n8n 중지
pm2 stop n8n

# 3️⃣ 백업 생성 (최중요!)
cp -r ~/.n8n ~/.n8n_backup_$(date +%Y%m%d_%H%M)

# 4️⃣ n8n 업데이트
npm update -g n8n

# 5️⃣ 또는 특정 버전으로 업데이트
npm install -g n8n@latest

# 6️⃣ n8n 재시작
pm2 start n8n

# 7️⃣ 상태 확인
pm2 status
pm2 logs n8n --lines 20

# 8️⃣ 웹 UI 접속 확인
curl http://localhost:5678
```

### 방법 2: 현재 버전 유지 (권장!)

> 🎯 **대표님 상황에서의 권장 사항**

| 이유 | 설명 |
|------|------|
| ✅ 현재 워크플로우 정상 작동 중 | Phase 2 테스트 진행 중 |
| ✅ Breaking Change 이미 적용됨 | v1.121.2 > v1.78.0 |
| ✅ 신규 기능 당장 불필요 | MCP, Guardrails는 AIASF에 불필요 |
| ⚠️ 업데이트 리스크 | Phase 2 테스트 중 환경 변경 위험 |

---

## 🔴 결론 및 권장 사항

### 지금 업데이트 필요한가?

| 질문 | 답변 |
|------|------|
| Breaking Change 영향? | ❌ 없음 (이미 적용됨) |
| 신규 기능 필요? | ❌ 당장 불필요 |
| 보안 패치 긴급? | ❌ 특별 긴급 이슈 없음 |
| 워크플로우 안정성? | ⚠️ 유지하는 게 안전 |

### ✅ 최종 권장: **지금은 업데이트 보류**

**이유**:
1. Phase 2 테스트 진행 중 → 환경 변경 리스크
2. 현재 버전 정상 작동
3. 신규 기능 AIASF에 불필요
4. 4개 마이너 버전 → 급하지 않음

**업데이트 권장 시점**:
- Phase 2 안정화 완료 후 (약 1-2주 후)
- 월 1회 정기 업데이트 권장 (공식 권장사항)

---

## 🔕 업데이트 알림 끄기 (선택)

업데이트 알림이 거슬리면 환경변수로 비활성화 가능:

```bash
# ~/.bashrc 또는 PM2 ecosystem 파일에 추가
export N8N_VERSION_NOTIFICATIONS_ENABLED=false
```

또는 PM2 ecosystem.config.js:
```javascript
module.exports = {
  apps: [{
    name: 'n8n',
    script: 'n8n',
    env: {
      N8N_VERSION_NOTIFICATIONS_ENABLED: false
    }
  }]
}
```

---

## 📝 수동 작업 요약

| 작업 | 필요 여부 | 비고 |
|------|----------|------|
| 업데이트 실행 | ❌ 보류 권장 | Phase 2 완료 후 |
| Breaking Change 대응 | ❌ 불필요 | 이미 적용됨 |
| Code 노드 수정 | ❌ 불필요 | 신규 문법 사용 중 |
| 알림 끄기 | 🔵 선택 | 거슬리면 설정 |

**→ 결론: 지금은 아무 작업도 필요 없습니다!** 🎉
