# 🚨 AIASF API 쿼터/빌링 종합 관리 가이드

> **목적**: OpenAI, YouTube, PiAPI, Shotstack 등 모든 API 쿼터 고갈 사전 예방
> **작성일**: 2025-12-31
> **원인 분석**: OpenAI 429 insufficient_quota 오류 발생

---

## 📊 오류 분석 결과

### 🔴 발생한 오류
```
Error code: 429 / insufficient_quota
"You exceeded your current quota, please check your plan and billing details"
```

### 💡 원인 분석 (딥리서치 결과)

| 가능성 | 설명 | 확률 |
|--------|------|------|
| **크레딧 소진** | OpenAI 잔액 $0 | 🔴 **가장 높음** |
| Rate Limit 초과 | 분당 요청 한도 초과 | 🟡 낮음 |
| 무료 티어 만료 | 3개월 후 무료 크레딧 만료 | 🟡 해당 시 |

---

## 🔧 즉시 해결 방법 (OpenAI)

### 1️⃣ 크레딧 잔액 확인
1. https://platform.openai.com/settings/organization/billing/overview 접속
2. **Credit balance** 확인
3. $0이면 → **Add to credit balance** 클릭

### 2️⃣ 크레딧 충전
- **최소 충전**: $5 (Tier 1)
- **권장 충전**: $50+ (Tier 2 업그레이드 조건)
- 크레딧은 **1년 후 만료**, 환불 불가

### 3️⃣ Auto Recharge 설정 (⭐ 재발 방지 핵심!)
1. Billing → **Auto recharge** 켜기
2. **Threshold**: $10 이하 시
3. **Amount**: $25~50 자동 충전

---

## 📋 OpenAI 티어 시스템 이해

| 티어 | 조건 | Rate Limit (GPT-4o) |
|------|------|---------------------|
| **Free** | 무료 | 3 RPM, 200 RPD |
| **Tier 1** | $5 결제 | 500 RPM, 10,000 TPM |
| **Tier 2** | $50 총지출 + 7일 | 5,000 RPM, 80,000 TPM |
| **Tier 3** | $100 총지출 + 7일 | 10,000 RPM |
| **Tier 4** | $250 총지출 + 14일 | 높은 한도 |

> ⚠️ **중요**: 티어 업그레이드는 **자동이 아님**! 
> 조건 충족 후 결제하면 재평가됨.

---

## 🛡️ 재발 방지 체크리스트

### ✅ OpenAI (GPT, DALL-E, TTS)
- [ ] **Auto Recharge** 설정 완료
- [ ] **Usage Limit** 알림 설정 ($20, $50 등)
- [ ] 주간 잔액 확인 습관화
- [ ] Tier 2 이상 업그레이드 ($50+ 지출)

### ✅ YouTube Data API
- [ ] 쿼터 증가 승인 대기 중 (7일 내 스크린캐스트 제출)
- [ ] 현재 10,000 units/day (필요: 100,000)

### ✅ PiAPI (Kling, Luma)
- [ ] 크레딧 잔액 확인: https://piapi.ai/dashboard
- [ ] 저잔액 알림 설정

### ✅ Shotstack
- [ ] Pro 플랜 확인
- [ ] 월간 렌더링 한도 확인

### ✅ LightNode 서버
- [ ] 잔액 확인 (마지막: 2025-12-30 충전 완료)
- [ ] 다음 충전: 2025년 1월 말

---

## 📅 주간/월간 모니터링 루틴

### 매주 월요일 체크 (Weekly)
| 서비스 | 확인 항목 | 링크 |
|--------|----------|------|
| OpenAI | 크레딧 잔액, 사용량 | [Dashboard](https://platform.openai.com/usage) |
| PiAPI | 크레딧 잔액 | [Dashboard](https://piapi.ai/dashboard) |
| YouTube | 쿼터 사용량 | [Console](https://console.cloud.google.com/apis/dashboard) |
| Shotstack | 렌더링 사용량 | [Dashboard](https://dashboard.shotstack.io) |

### 매월 1일 체크 (Monthly)
- [ ] LightNode 서버 잔액
- [ ] 각 서비스 청구서 확인
- [ ] 월간 비용 총계 계산

---

## 📊 AIASF 예상 월간 API 비용

| 서비스 | 월간 사용량 | 예상 비용 |
|--------|------------|----------|
| OpenAI GPT-4o | ~50M tokens | ~$25 |
| OpenAI DALL-E 3 | 1,200장 | ~$100 |
| OpenAI TTS | 1,200 스크립트 | ~$20 |
| PiAPI Kling | 1,200 영상 | ~$384 |
| Shotstack | 1,200 렌더링 | ~$100 |
| LightNode | 서버 | ~$27 |
| **합계** | | **~$656/월** |

### 💡 안전 버퍼 권장
- **월 예산**: $800 (20% 버퍼)
- **OpenAI 충전 단위**: $100씩 (2~3개월치)
- **PiAPI 충전 단위**: $200씩

---

## 🚨 긴급 대응 플로우차트

```
n8n 오류 발생!
      ↓
[Error code 429?]
      ↓ Yes
[어떤 서비스?]
      ↓
┌─────────────────────────────────────────┐
│ OpenAI → platform.openai.com/billing    │
│ PiAPI → piapi.ai/dashboard               │
│ YouTube → console.cloud.google.com       │
│ Shotstack → dashboard.shotstack.io       │
└─────────────────────────────────────────┘
      ↓
[잔액 확인 → 충전 → n8n 재실행]
```

---

## 📝 위키 업데이트 항목 (추가 필요)

### 🔴 API 쿼터 얼럿 규칙 (2025-12-31 추가)

> **AI 필수 수행**: 위키 확인 시 아래 API 잔액 체크 안내!

| 서비스 | 경고 기준 | 긴급 기준 |
|--------|----------|----------|
| OpenAI | $10 이하 | $5 이하 |
| PiAPI | $20 이하 | $10 이하 |
| YouTube | 8,000 units/day | 9,500 units/day |

---

*이 문서는 API 오류 재발 방지를 위해 작성되었습니다.*
