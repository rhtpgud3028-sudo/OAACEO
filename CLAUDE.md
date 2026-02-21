# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ⚠️ 세션 시작 규칙

매 세션 시작 시 사용자가 작업 지시를 하기 전에:
1. 이 CLAUDE.md를 읽었으면 `scratch/프로젝트_위키_통합.md`도 반드시 읽을 것
2. 읽은 후 "위키 확인 완료. 현재 단계: [현재 상태] / 오늘 할 일: [미완료 항목]" 보고
3. n8n 서버 상태 확인 (HTTP): `curl http://38.60.220.9:5678/healthz`

### 슬래시 커맨드 (3종)
| 커맨드 | 용도 |
|--------|------|
| `/start` | 세션 시작: 백업→위키읽기→서버확인→상태보고 |
| `/recheck` | 컨텍스트 복구: 위키재읽기→대화정리→보고 |
| `/wrap` | 세션 종료: 백업→헤더갱신→작업요약→push |

---

## 섹션 1: 프로젝트 핵심

**AIASF (AI Automated Shorts Factory)** - n8n 기반 YouTube Shorts 자동 생산 시스템.
5060세대(50~60대 한국인) 타겟, 21개 채널 동시 운영. 65초 숏츠를 자동 생성→업로드.
부가 프로젝트로 ICT/SMC 기반 크립토 트레이딩 Pine Script 인디케이터 포함.
모든 문서/코드/응답은 **한국어**로 작성.

### 서버 접속 정보

| 항목 | 값 |
|------|-----|
| IP | 38.60.220.9 |
| 사용자 | root |
| SSH 키 | ~/.ssh/id_rsa |
| n8n URL | http://38.60.220.9:5678 |
| n8n API Key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwZDRkODUzNy1mOTg2LTRjZmMtYjNlYS1kMDBiYjE4ZmI4OWEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzcxNjczMjU1fQ.EvEuGD-WYbfQ4X2-c_ytjqrOW6FjWNKbanRQjffRBXU` |
| 백업 경로 | /root/.n8n/backups/ |

```bash
# SSH 접속
ssh -i ~/.ssh/id_rsa root@38.60.220.9

# n8n API 사용 (SSH 없이 워크플로우 수정 가능)
curl -H "X-N8N-API-KEY: [위 API Key]" http://38.60.220.9:5678/api/v1/workflows
```

### 현재 단계

- **Phase 2 런칭 준비** / Shotstack Code 노드: **v20.38** (n8n 적용 완료 2026-02-21)
- GPT 프롬프트: **v6.17** (주제 적응형)
- GPT 이미지 프롬프트: **v2** (핵심어 추출 + 3단계 검증)
- Topic Override: **v3.0** (7개 카테고리 최적화 + 폴백 주제)
- 21채널 동적 브랜딩 (Branding Router **v5.0** - 수익 극대화 카테고리)
- AI Persona Router: **v5.0** (7개 유명인 페르소나)
- **채널 자동순환**: 21채널 × 2회/일 = 42영상/일 (34분 간격 라운드로빈)
- 7개 카테고리: **건강/재테크/요리·건강식/인생지혜/디지털부업/중년뷰티/스마트폰AI**
- **v20.38 완료**: SOUNDTRACK-TRIM-FIX (미지원 trim 속성 제거), n8n API로 직접 적용 완료
- **v5.0 완료**: 카테고리 최적화 (전원→요리·건강식으로 변경 확정)
- **N8N_SECURE_COOKIE=false**: PM2 환경변수 영구 저장 (HTTP 접속 복구)
- **Schedule 34분 완료**: DB 패치 적용, n8n 재시작
- **채널명 21개 확정**: 7카테고리 × 3채널 (영문 로고명 포함)
- **업로드시간 최적화 설계 완료**: 팩트 기반 21채널 개별 스케줄 (미구현)
- **미완료**: 로고 21개 생성, Auto-Rotation 시간로직 구현, Branding Router 카테고리 업데이트(전원→요리), YouTube OAuth 7개, 채널 21개 개설, BGM 다양화 검토

### 기술 스택

| 플랫폼 | 역할 |
|--------|------|
| n8n (LightNode $27/월) | 워크플로우 자동화 |
| GPT-4 | 스크립트 생성 (12문장, 각 55-65자) |
| DALL-E 3 | 이미지 생성 (프롬프트에 "ABSOLUTELY NO TEXT" 필수) |
| Kling/Luma (PiAPI) | AI 인트로 영상 생성 |
| ElevenLabs (Pro $99, Flash v2.5) | TTS, 7개 보이스 × 21채널 |
| Shotstack ($117/월) | 영상 합성 (9:16, 65초, 30fps) |
| YouTube API | 자동 업로드 |

### n8n 파이프라인

```
Schedule Trigger (34분) → Channel Auto-Rotation (21채널 순환)
  → Branding Router v5.0 → AI Persona v5.0 → Topic Override v3.0
  → GPT Script v6.17 → ElevenLabs TTS → DALL-E 3 × 12
  → Kling Intro → Shotstack Render (v20.38) → YouTube Upload
```

### 영상 구조

65초 숏츠: AI 인트로(5s) + 12개 이미지(5s × 12 = 60s), 아웃트로 없음

---

## 섹션 2: 절대 규칙 (요약)

> 상세 규칙은 `scratch/프로젝트_위키_통합.md`에서 반드시 확인할 것.

### 1. 속도보다 깊이

빠른 응답 < 정확한 응답. 검증 없이 추론으로 답변 금지. 불확실하면 "확인 중" 후 조사.

### 2. 검증 4요소 (모두 충족해야 "검증했다" 성립)

1. **주장의 근거 확인** - 출처가 신뢰할만한가?
2. **가정의 검증** - 실증 데이터 있는가? 없으면 "추론입니다" 고백
3. **코드 실제 동작 검증** - 엣지케이스, 기존 시스템 충돌 확인
4. **비즈니스 영향 검증** - 21채널 운영 영향, 롤백 가능 여부

### 3. 응답 전 체크리스트 (매 응답마다)

- [ ] 딥리서칭 했는가? (웹 검색, 공식 문서 등)
- [ ] 딥분석 했는가? (근본 원인, 사이드 이펙트)
- [ ] 딥판단 했는가? (여러 옵션 비교, 최적해 + 근거)
- [ ] 검증 했는가? (위 4요소)
- [ ] 이전 절대원칙과 충돌 없는가?

### 4. 코드 수정 전 공식 문서 검증

1. 공식 문서에서 작동하는 예제 찾기
2. 예제와 현재 코드 직접 비교
3. 차이점 + 신뢰도 먼저 보고
4. 그 후에만 코드 제안

### 5. 백업 타임스탬프 절대 규칙 (2026-02-11 확정 - 위반 시 TERMINATED!)

- **매 세션 시작 시 (/start)**: 새 타임스탬프로 위키 백업 생성
- **매 세션 종료 시 (/wrap)**: 새 타임스탬프로 위키 백업 생성
- **위키 수정 전**: 새 타임스탬프로 위키 백업 생성
- 파일명: `프로젝트_위키_통합_backup_YYYYMMDD_HHMM.md` (현재 실제 시간!)
- **이전 타임스탬프 재사용 = 절대 금지!**
- **"이미 오늘 백업했으니 생략" = 절대 금지!**
- 하루에 여러 번 수정하면 여러 번 백업! 1:1 대응!
- 백업 생성 후 파일 존재 + 용량 확인 필수

### 6. 팩트기반 딥리서칭 필수 원칙 (2026-02-12 확정 - 위반 시 TERMINATED!)

- **추론 금지!** 모든 주장에 팩트 데이터 출처 명시. 출처 없는 주장 = TERMINATED!
- **데이터 접근 포기 금지!** PDF 실패 → 다른 경로. 1차 검색 실패 → 키워드 변경/교차검색
- **팩트 수준 분류 필수!** [팩트]/[준팩트]/[추론]/[미확인] 명시
- **딥리서칭 완료 기준**: 최소 3개 독립 출처 교차 검증, 1차 출처 접근 시도 필수
- **사업 리스크 관점**: 팩트 없이 사업 의사결정 유도 = TERMINATED!
- 추론이면 반드시 **"이것은 추론입니다"** 명시. 확정처럼 포장 = TERMINATED!

### 7. 기타 핵심 원칙

- 제안 시 3가지 옵션 제시 필수
- 심플함 우선: n8n 노드 수 최소화, 새 플랫폼 추가 금지 (기존으로 해결)
- 위키 수정 시: 백업 먼저 → 헤더(날짜/단계) 갱신 → 본문 수정
- 추론을 확정처럼 말하기 금지

---

## 섹션 3: 파일 맵

> 상세 내용이 필요하면 해당 파일을 직접 읽어라. CLAUDE.md에는 경로만 명시한다.

### scratch/ - 실작업 파일

**n8n 노드 코드 (.js)**
| 파일 | 역할 |
|------|------|
| `n8n_shotstack_builder_v20.38.js` | 현행 Shotstack 렌더 코드 (최신, n8n 적용 완료) |
| `n8n_branding_router_v5.js` | 21채널 브랜딩/보이스/CTA 동적 라우팅 |
| `n8n_topic_override_v3.js` | 주제 오버라이드 노드 |
| `n8n_ai_persona_prompts.js` | 21채널 AI 페르소나 |
| `n8n_channel_configs.js` | 채널별 설정 |
| `n8n_schedule_randomizer.js` | 업로드 스케줄 랜덤화 |
| `n8n_parse_prompts_verified.js` | GPT 응답 파싱 |
| `n8n_quality_check_node.js` | 품질 체크 |
| `n8n_shotstack_builder_v20.~v20.37.js` | 이전 버전들 (히스토리 참고용) |

**GPT 프롬프트**
| 파일 | 역할 |
|------|------|
| `AIASF_GPT_Prompt_v6.17.md` | 현행 프롬프트 (주제 적응형) |
| `AIASF_GPT_Prompt_v6.14~v6.16.md` | 이전 버전들 |

**JSON 설정/템플릿**
| 파일 | 역할 |
|------|------|
| `AIASF_Phase2_ChannelConfig.json` | 21채널 설정 (보이스ID, 색상, CTA, 수익모델) |
| `AIASF_BASE_TEMPLATE.json` | 초기 50초 템플릿 (구버전 참고용) |
| `AIASF_Logo_Banner_Prompts.json` | 로고/배너 생성 프롬프트 |

**가이드 문서 (.md)**
| 파일 | 역할 |
|------|------|
| `프로젝트_위키_통합.md` | **전체 위키 원본 (가장 중요!)** |
| `AIASF_Phase2_n8n_적용_가이드.md` | Phase 2 n8n 적용 가이드 |
| `AIASF_Phase2_DAY2_Fix_Guide.md` | Phase 2 2일차 버그 수정 |
| `AIASF_5060_아웃트로_시청추이_분석.md` | 아웃트로 제거 근거 분석 |
| `ICT_Trading_Indicator_사용가이드.md` | ICT 인디케이터 사용법 |

**Pine Script (.pine)** - ICT 트레이딩
| 파일 | 역할 |
|------|------|
| `ICT_Strategy_V4_VP.pine` | 최신 전략 (Volume Profile) |
| `ICT_Indicator_V2_KSH.pine` | 최신 인디케이터 |
| 기타 V1~V3 | 이전 버전 (히스토리) |

### .claude/commands/ - 슬래시 커맨드

| 파일 | 역할 |
|------|------|
| `start.md` | `/start` 세션 시작 워크플로우 |
| `recheck.md` | `/recheck` 컨텍스트 복구 워크플로우 |
| `wrap.md` | `/wrap` 세션 종료 워크플로우 |

### .agent/workflows/ - 시스템 규칙

| 파일 | 역할 |
|------|------|
| `시스템-최적화-원칙.md` | AIASF 설계 절대 원칙 (심플함, 비용효율) |
| `오늘-작업-정리해줘.md` | 일일 작업 정리 워크플로우 |

### scratch/.agent/workflows/ - 트레이딩 규칙

| 파일 | 역할 |
|------|------|
| `ict-trading-rules.md` | ICT/SMC 트레이딩 전략 규칙 전문 |

### brain/ - Gemini 세션별 분석 보고서

| 세션 (UUID 앞자리) | 주요 보고서 |
|-------------------|-----------|
| `7f60c36c` | 비용/수익 분석, 포맷 비교 |
| `0b119b86` | 20채널 확장 보고서, 하이브리드 전략 |
| `e52bac16` | 고도화 전략, Phase2 리서치 |
| `ab9b2ff0` | AI 리소스낭비 분석, Phase1 최종 설정 |
| `69570c23` | Phase2 스케일업, 비용 증가 원인, TTS 검증 |
| `a3270630` | 워크플로우 최적화 분석 |
| `26ad2a96` | YouTube API 쿼터, GPT Script 프롬프트 |
| `7fb619ae` | Phase1 최종 버그 수정 솔루션 |

### scratch/backup_wiki/ - 위키 백업

`프로젝트_위키_통합_backup_YYYYMMDD_HHMM.md` 형식, 20241224~20260221 (30+개)
`workflows_backup_YYYYMMDD_HHMM/` 폴더 5세트 (각각 ict-trading-rules.md 등 포함)

---

## 섹션 4: 위키 전체 참조

> **전체 위키 원본은 `scratch/프로젝트_위키_통합.md`에 있음.**
> 세부 규칙, 버전 히스토리, 크리티컬 이슈, 위반 사례, 일일 체크리스트 등
> 모든 상세 내용 확인 시 **반드시 이 파일을 읽을 것.**
> 작업 시작 시 `/start` 또는 "위키 파일 확인해줘" 명령으로 전체 컨텍스트 로드.

---

## 섹션 5: 멀티기기 동기화

### 데이터 흐름
```
Claude Code 웹 → /wrap push → GitHub Action 자동 병합 → main
    → Windows 작업스케줄러 (30분) → Google Drive 폴더 pull
        → Google Drive 자동 동기화 → 휴대용 노트북 수신
```

### n8n API 활용 (SSH 없이 워크플로우 수정)
```bash
# 워크플로우 목록 조회
curl -H "X-N8N-API-KEY: [API_KEY]" http://38.60.220.9:5678/api/v1/workflows

# 특정 워크플로우 조회
curl -H "X-N8N-API-KEY: [API_KEY]" http://38.60.220.9:5678/api/v1/workflows/{WF_ID}

# 워크플로우 업데이트 (PUT, 필수 키: name, nodes, connections, settings)
curl -X PUT -H "X-N8N-API-KEY: [API_KEY]" -H "Content-Type: application/json" \
  -d '{"name":"...","nodes":[...],"connections":{...},"settings":{...}}' \
  http://38.60.220.9:5678/api/v1/workflows/{WF_ID}
```

### 상세 가이드
`scratch/AIASF_멀티기기_동기화_셋업_가이드.md` 참조
