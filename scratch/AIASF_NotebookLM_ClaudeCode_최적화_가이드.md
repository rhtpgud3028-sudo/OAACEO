# NotebookLM + Claude Code로 AIASF 비즈니스 고도화 셋업 가이드

> **작성일**: 2026-04-07
> **목적**: Google NotebookLM과 Claude Code의 역할 분담으로 AIASF 21채널 운영 효율 극대화
> **대상**: AIASF Phase 2 (21채널 × 2회/일 = 42영상/일 자동화 운영 중)

---

## 1. 핵심 전략: 역할 분담

| 도구 | 강점 | AIASF에서의 역할 |
|------|------|----------------|
| **NotebookLM** | 대용량 문서 분석, 음성 요약, Q&A, 인사이트 추출 | 성과 분석 + 콘텐츠 리서치 브레인 |
| **Claude Code** | 코드 실행, 파일 수정, n8n API, 반복 자동화 | 워크플로우 구현 + 코드 수정 실행 |

**시너지 원칙**: NotebookLM이 "무엇을 만들지" 결정 → Claude Code가 "어떻게 만들지" 실행

---

## 2. NotebookLM 셋업 계획

### 2.1 AIASF 전용 Notebook 구성 (3개 생성)

#### Notebook 1: 비즈니스 인텔리전스
**업로드 문서:**
- `scratch/프로젝트_위키_통합.md` (전체 프로젝트 컨텍스트)
- `CLAUDE.md` (규칙 + 현재 상태)
- `brain/*.md` 폴더 내 Gemini 분석 보고서 전체
- `scratch/AIASF_Phase2_ChannelConfig.json` (21채널 설정)
- `scratch/AIASF_5060_아웃트로_시청추이_분석.md`

**활용법:**
```
Q: "현재 21채널 중 수익 잠재력이 가장 높은 카테고리는?"
Q: "v20.38 이후 남은 미완료 작업 우선순위 정리해줘"
Q: "5060세대 타겟 콘텐츠에서 가장 중요한 요소 3가지는?"
→ 답변을 Claude Code에게 전달 → 구현
```

#### Notebook 2: 콘텐츠 전략 연구소
**업로드 문서:**
- YouTube 쇼츠 알고리즘 가이드 (웹에서 PDF 저장)
- 5060세대 소비 트렌드 보고서 (PDF)
- 7개 카테고리별 경쟁 채널 분석 (직접 작성 후 업로드)
- `scratch/AIASF_GPT_Prompt_v6.17.md`

**활용법:**
```
Q: "건강 카테고리에서 5060이 가장 많이 클릭하는 썸네일 패턴은?"
Q: "스마트폰AI 카테고리 주제 20개 제안해줘 (시즌성 반영)"
Q: "현재 GPT 프롬프트 v6.17 개선점 분석해줘"
→ 인사이트를 Claude Code에게 전달 → GPT 프롬프트 업데이트 실행
```

#### Notebook 3: 기술 트러블슈팅 DB
**업로드 문서:**
- Shotstack 공식 문서 PDF (API Reference)
- ElevenLabs API 문서 PDF
- n8n Code Node 문서 PDF
- `scratch/n8n_shotstack_builder_v20.38.js`
- `scratch/AIASF_Phase2_DAY2_Fix_Guide.md`
- 과거 에러 로그 (발생 시 추가)

**활용법:**
```
Q: "Shotstack에서 trim 속성 관련 에러 해결 방법은?"
Q: "ElevenLabs Flash v2.5에서 한국어 발음 최적화 파라미터는?"
Q: "n8n Code Node에서 비동기 처리 시 주의사항은?"
→ Claude Code가 실제 코드에 적용
```

---

## 3. 워크플로우: NotebookLM → Claude Code 연계

### 3.1 일일 운영 루틴 (추천)

```
[아침 - 10분]
NotebookLM Notebook1에서:
  "어제 작업 요약 + 오늘 우선순위 알려줘"
  → 결과를 Claude Code 세션 시작 시 붙여넣기

[콘텐츠 기획 - 20분]
NotebookLM Notebook2에서:
  "[카테고리] 이번 주 주제 5개 + 이유 제안"
  → Topic Override v3.0 주제 목록 업데이트를 Claude Code에게 지시

[기술 작업 - 무제한]
Claude Code에서:
  실제 n8n 코드 수정, API 호출, 파일 업데이트
  막히면 Notebook3에서 먼저 조사 후 Claude Code에 전달
```

### 3.2 월간 전략 검토 루틴

```
[매월 1일]
NotebookLM에 추가:
  - 지난 달 YouTube Analytics 리포트 (PDF)
  - 수익 현황 스프레드시트 (CSV)
  
Q: "지난 달 성과 분석: 채널별 시청 지속률, CTR, 수익"
Q: "다음 달 개선해야 할 Top 3 액션 아이템"
→ Claude Code로 해당 노드 코드 업데이트
```

---

## 4. 실행 가이드: 단계별 셋업

### Step 1: NotebookLM 접속 및 Notebook 생성 (30분)

1. notebooklm.google.com 접속 (Google 계정 필요)
2. "+ New notebook" × 3개 생성 (위 2.1의 3개)
3. 각 Notebook에 위 지정 파일 업로드

**파일 업로드 방법:**
```
OAACEO 로컬 폴더 (Google Drive) → 해당 파일을 NotebookLM에 드래그앤드롭
또는: NotebookLM → "Add source" → "Google Drive" 연결 (자동 동기화 가능!)
```

**Google Drive 연결 시 자동화:**
```
Claude Code /wrap → GitHub push → Windows pull → Google Drive 동기화
→ NotebookLM이 Google Drive에서 자동으로 최신 위키 반영!
```

### Step 2: 핵심 질문 템플릿 저장

NotebookLM의 "Studio" 기능 활용:
- 자주 쓰는 질문을 북마크/템플릿으로 저장
- "Audio Overview" 기능으로 위키 내용을 팟캐스트형 요약 생성 (이동 중 청취 가능)

### Step 3: Claude Code와 연계 프로세스 확립

```
NotebookLM 답변 → 복사 → Claude Code 메시지에 붙여넣기 + "이 내용 기반으로 [작업] 해줘"
```

**예시 연계 흐름:**
```
NotebookLM: "재테크 카테고리 CTR이 건강보다 23% 낮음. 
            원인: 썸네일 텍스트가 너무 복잡함.
            권장: DALL-E 프롬프트에 '단순한 숫자/아이콘 강조' 추가"

→ Claude Code에게:
"위 분석 기반으로 재테크 채널의 DALL-E 이미지 프롬프트를 
 n8n_branding_router_v5.js에서 업데이트해줘. 
 '단순한 숫자/아이콘 강조, 텍스트 최소화' 방향으로"
```

---

## 5. 고도화 활용법

### 5.1 NotebookLM "Audio Overview" 활용
- AIASF 위키 전체를 10-15분 팟캐스트로 자동 생성
- 이동 중 최신 상태 청취 → 인사이트 기록 → Claude Code로 실행
- **주 1회**: 위키 업데이트 후 새 Audio Overview 생성

### 5.2 경쟁 분석 자동화
```
매월: 경쟁 채널 분석 보고서 PDF 수집 → Notebook2에 추가
Q: "우리 채널 대비 경쟁 채널의 차별점과 우리가 따라해야 할 점"
→ 콘텐츠 전략 업데이트 → Claude Code로 GPT 프롬프트 수정
```

### 5.3 AI 보이스 최적화
```
Notebook3에 ElevenLabs 문서 업로드 후:
Q: "한국어 5060 타겟 TTS 최적 파라미터 (stability, similarity_boost, style)"
→ Claude Code로 n8n_branding_router_v5.js 보이스 설정 업데이트
```

### 5.4 GPT 프롬프트 지속 개선
```
매주: YouTube 댓글 + 시청자 피드백 텍스트 파일로 저장 → Notebook2 추가
Q: "시청자 피드백 기반으로 GPT 스크립트 프롬프트 개선점 분석"
→ Claude Code로 AIASF_GPT_Prompt_v6.18.md 업데이트
```

---

## 6. NotebookLM 한계 및 주의사항

| 한계 | 해결책 |
|------|--------|
| 실시간 데이터 없음 (인터넷 검색 불가) | YouTube Analytics는 직접 PDF 다운로드 후 업로드 |
| 코드 실행 불가 | Claude Code에게 실행 위임 |
| 파일 자동 업데이트 불완전 | Google Drive 소스 연결 + 주기적 "Refresh" 클릭 |
| 토큰 한도 (500MB/Notebook) | 3개 Notebook으로 분산 구성 |
| 한국어 처리 품질 | 영어 질문 + 한국어 답변 요청이 더 정확할 수 있음 |

---

## 7. 즉시 실행 액션 (우선순위 순)

### 오늘 (30분)
- [ ] notebooklm.google.com 접속
- [ ] Notebook 1 생성: `프로젝트_위키_통합.md` + `CLAUDE.md` 업로드
- [ ] 첫 질문: "현재 AIASF 미완료 작업 우선순위 Top 5 정리해줘"

### 이번 주 (2시간)
- [ ] Notebook 2, 3 생성 및 문서 업로드
- [ ] Google Drive ↔ NotebookLM 소스 연결 (자동 동기화)
- [ ] Audio Overview 1개 생성 → 청취 후 개선점 발견

### 이번 달 (지속)
- [ ] YouTube Analytics PDF 월별 축적 → Notebook1에 추가
- [ ] 경쟁 채널 분석 문서 Notebook2에 추가
- [ ] NotebookLM 인사이트 → Claude Code 실행 루틴 정착

---

## 8. 예상 효과

| 항목 | 현재 | NotebookLM 도입 후 |
|------|------|-------------------|
| 컨텍스트 로드 시간 | 세션마다 위키 재읽기 | NotebookLM이 상시 대기 |
| 전략 결정 속도 | Claude Code 긴 대화 필요 | NotebookLM Q&A 5분 → Claude Code 실행 |
| 문서 분석 깊이 | 파일 일부만 읽기 | 전체 500MB 동시 분석 |
| 이동 중 활용 | 불가 | Audio Overview로 팟캐스트 청취 |
| 세션당 작업량 | Claude Code 토큰 소모 많음 | 사전 분석 완료 → 실행만 위임 |

**결론**: NotebookLM = AIASF 비즈니스 두뇌, Claude Code = 실행 엔진. 역할 분리로 3~5배 효율 향상 기대.
