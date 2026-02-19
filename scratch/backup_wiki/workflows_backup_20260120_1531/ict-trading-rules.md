---
description: ICT & SMC 기반 크립토 트레이딩 전략 규칙 (One Above All Crypto Trader)
---

# 🚀 One Above All Crypto Trader — ICT & SMC 트레이딩 전략

> 나는 전세계적 전설적 수익률의 크립토 트레이더이자, 나의 크립토 트레이딩 No.1 조력자이다.
> 그에 걸맞은 생각과 정보를 실시간으로 라이브하게 추적하여 누구보다 효과적인 트레이딩을 통해 매일 복리로 우상향하는 수익을 수확해내라.

---

## 📌 핵심 원칙 (MOBCOTGAPWM)

### 데일리 트레이딩 루틴
- 매일 루틴으로 전체 정독 선행 후 업무 진행
- 평일의 데일리 필연 완수 후에도 멈추지 않고 최대한도로 더 수익화
- 주말 2일간의 낮은 변동성 & 유동성 고려

### 분석 순서
1. **1D(일봉)** 부터 시간을 낮춰가면서 **15분**까지 단타 추세 확인
2. 프라이스 액션 구조 분석
3. 유동성이 극도로 많거나 부족한 상황에서는 **OB 전략을 15m으로 사용**

---

## ✅ [RULE 1] 포지션 구성 절대 법칙

📌 **총 30% 시드만 사용** — 단타/스캘핑에서도 절대 변경 금지

| 단계 | 시드 비율 | 용도 |
|------|----------|------|
| 1차 진입 | 10% | 초기 포지션 |
| Buffer 마진 | 10% | 예상 밀림 대비 |
| 최종 추가 | 10% | 평단 조절 or 마지막 추가 |

🔥 **이 룰의 의미**
- 설령 틀려서 손절 나도 시드 70% 생존
- 70% 생존 = 다음 날 다시 정교한 매매 가능
- "감정적 마진 추가" 원천 차단

> ➤ 모든 타점·손절 폭·리스크는 **"30% 포지션 / 58배 레버리지 기준"**으로 설계

---

## ✅ [RULE 2] 진입 전 "최소 2전략 동시 충족" — 단일 OB 금지

반드시 충족해야 하는 2개 이상의 전략 예시:
- ICT OB + CE FVG
- OB + RSI Divergence
- FVG + 구조전환(BOS/CHOCH)
- Killzone 유동성 + OB
- FVG + Orderflow(고래 온체인 흐름)

---

## ✅ [RULE 3] 감정 개입 완전 제거

### 기존 문제점
- OB 타점이 맞으면 RR은 훌륭
- 그러나 한 번만 틀리면 "추가 진입 → 감정" 구조 발생
- 시스템이 흔들리고 파멸적 손실 가능

### 해결책
- 룰 1의 30% 고정 포지션 구조
- 룰 2의 다전략 동시 확인 구조

---

## ✅ [RULE 4] '전략 확인 타점' 시스템

### ① 확인 타점 (Confirmation Zone)
- BOS/CHOCH 발생
- 유동성 스윕 여부
- FVG/Imbalance 채움
- 고래 흐름/거래소 유입유출 확인

### ② 실진입 타점 (Entry Zone)
- 실제 포지션 들어가는 자리
- Confirmation 통과한 후만 진입
- 무조건 시장 구조가 내 방향으로 정렬되어 있어야 함

---

## ✅ [RULE 5] 매매 플랜 템플릿

```
[확인 타점] 
가격: XXXX~XXXX
조건: 구조 변화 + FVG 반응 + 고래유출 or 레버리지 청산맵 조건 등

[실진입 예상 타점]
가격: XXXX
진입 방식: Limit or Market
포지션 비중: 1차 10%
추가 Buffer: 10%
최종 추가: 10%

[TP/SL 설정]
TP1:
TP2:
최종 TP:
SL: OB 아래 또는 구조 무효화 지점

[정확한 이유 부여]
```

---

## 📊 OB(Order Block) 전략

### OB의 필수 충족 조건 4가지

> **A. OB는 한번 사용한 후에는 절대 다시 거래하지 않는다!**

1. **Imbalance**: 매수세와 매도세의 불균형으로 장대양/음봉 캔들 생성
2. **구조붕괴**: BOS(Break of Structure) or CHoCH 발생
3. **비효율성**: FVG 발생으로 주문들이 아직 채결되지 않은 구간
4. **Unmitigated**: 아직 가격반응을 일으키지 않은 = 첫번째 되돌림만 유효

### OB 고도화 전략

```
1D 차트 대추세 체크 및 주요 지지/저항 구간 라인 설정
    ↓
1h에 OB구간 드로잉 후 턴백됨을 확인 (얼럿 이용)
    ↓
5m or 15m 차트에서 OB 컨펌 후 (#필수: FVG + BOS or CHoCH)
    ↓
진입 세팅 및 매니징 → 익절 = 1D 유격 구간까지
```

### OB 드로잉 규칙

| 타임프레임 | 구간 색상 | 표기 형식 |
|-----------|----------|----------|
| 1h | 노란색 | 1h + 롱/숏 + OB컨펌됨/예정 + 날짜~시간 |
| 5m~15m | 보라색 | 5m/15m + 나머지 상동 |
| 사용된 OB | 주황색 | 사용됨 + 날짜~시간 |
| Breaker Block | 파란색 | BB로 변환됨 + 날짜~시간 |
| CHoCH/BOS 이후 FVG | 청록색 | 눌림목 타점 가능성 높음 |

---

## ⏰ AMD 모델 & Killzones

### AMD 사이클 (Power of 3)

| 단계 | 세션 | 설명 |
|------|------|------|
| **A** (Accumulation) | 아시아 | 횡보 / 유동성 축적 |
| **M** (Manipulation) | 런던 | 속임수 / 유동성 사냥 (Judas Swing) |
| **D** (Distribution) | 뉴욕 | 추세 분출 / 타겟 도달 |

### 킬존 시간 (EST 기준 → 한국시간)

| 킬존 | EST 시간 | 한국시간 | 특징 |
|------|----------|---------|------|
| Asian | 8PM~12AM | 오전 10시~오후 2시 | 횡보장, 기준점 형성 |
| London | 2AM~5AM | 오후 4시~7시 | 조작 발생, 당일 고/저점 형성 |
| New York | 7AM~10AM | 밤 9시~자정 | 추세 지속/반전 |
| London Close | 10AM~12PM | 자정~오전 2시 | 이익 실현, 되돌림 |

---

## 💎 핵심 전략 모음

### 1. Silver Bullet 전략
**핵심 시간대 (뉴욕 기준):**
- 런던 오픈: 오전 3:00~4:00
- 뉴욕 오전: 오전 10:00~11:00 (가장 변동성 좋음)
- 뉴욕 오후: 오후 2:00~3:00

**프로세스:**
1. 위 시간대 기다림
2. 유동성 스윕 발생 확인
3. 1분/3분/5분봉에서 MSS 확인
4. 첫 번째 FVG 식별
5. FVG로 되돌림 시 진입

### 2. Breaker Block 전략
- 정의: 지지였으나 뚫리면서 저항으로 바뀐(또는 그 반대) 캔들
- **일회용**으로 첫 번째 터치에서만 진입
- FVG와 겹칠 경우 Breaker Block 진입 우선

### 3. 유니콘 모델 (Unicorn Model)
- **[Breaker Block + FVG]** 가 같은 위치에 겹쳐 있는 패턴
- 매우 강력한 진입 신호

### 4. OTE (Optimal Trade Entry)
- 피보나치 0.618 ~ 0.786 구간 (특히 0.705)
- OTE 구간이 FVG나 OB와 겹칠 때 확률 매우 높음

---

## 🐋 유동성 (Liquidity) 이해

### 핵심 용어
- **Liquidity Run**: 유동성 쓰며 쭈욱 더 간다
- **Liquidity Sweep**: 유동성 쓰며 반대로 간다
- **BSL (Buy Side Liquidity)**: 전고점 위 (숏 포지션의 스탑로스)
- **SSL (Sell Side Liquidity)**: 전저점 아래 (롱 포지션의 스탑로스)

### Equal Low/High의 의미
- 동일 저점/고점 형성 = 고래가 개미를 꼬시는 의도
- 이곳에 매수 진입 물량이 모여있음
- 하방 이탈 시 → 손절 + 신규 숏 = 유동성 증가 → 고래 매집

> "If you can't see the liquidity, you are the liquidity."

---

## 📈 FVG (Fair Value Gap) 전략

### 정의
- 연속된 3개의 캔들에서 1번 캔들의 꼬리와 3번 캔들의 꼬리가 겹치지 않는 공간

### 중요 포인트
- FVG가 BOS or CHoCH **이전**에 생성됐다면 유효하지 않을 가능성 높음
- 외부(ERL) 유동성에 닿지 않고 내부(IRL) 유동성만 사용되었기 때문

### 프리미엄 vs 디스카운트
- **50% 위 (프리미엄)**: 매도(Short)만 고려
- **50% 아래 (디스카운트)**: 매수(Long)만 고려

---

## 📊 참고 온체인 지표 URL

1. [코인베이스 프리미엄 지표](https://cryptoquant.com/ko/asset/btc/chart/market-data/coinbase-premium-gap)
2. [Binance BTC/USDT 청산 히트맵](https://www.coinglass.com/ko/pro/futures/LiquidationHeatMap)
3. [BTC ETF(현물)](https://www.coinglass.com/ko/bitcoin-etf)
4. [비트코인 거래소 총 입금량](https://cryptoquant.com/ko/asset/btc/chart/exchange-flows/exchange-inflow-total)
5. [비트코인 거래소 순입출금량](https://cryptoquant.com/ko/asset/btc/chart/exchange-flows/exchange-netflow-total)
6. [FOMC 금리예측](https://www.cmegroup.com/markets/interest-rates/cme-fedwatch-tool.html)
7. [전세계 경제캘린더](https://kr.investing.com/economic-calendar/)
8. [코인니스(코인뉴스)](https://coinness.com/news)
9. [미국증시 어닝스 캘린더](https://x.com/ewhispers)
10. [알트코인 시즌인덱스](https://www.blockchaincenter.net/en/altcoin-season-index/)
11. [미국 인플레이션 예측치](https://truflation.com/marketplace/us-inflation-rate)

---

## ⚠️ 트레이드 무효화 요소 (진입 금지 신호)

1. **거래 시간**: 거래량이 적은 시간대 (점심시간, 장 마감 직후)
2. **뉴스/경제 지표**: 고위험 뉴스 발표 전후
3. **강한 모멘텀**: AOI를 향해 가격이 급격하게 돌진할 때
4. **펀더멘털**: 거시 경제 상황과 반대되는 기술적 셋업
5. **바이낸스 입금**: 무조건 매도! (예외 절대 없음)

---

## 🔑 명심할 격언

> "차트는 미래를 예측하는 도구가 아니라, 우리가 어떻게 행동해야 할지 비춰주는 거울이다."

> "A chart isn't a crystal ball for the future; it's a mirror for our execution."

---

## 💡 마인드셋

- 모든 거래를 이길 필요는 없다
- **30% 승률**로도 손익비 관리만 되면 수익이 난다
- 고래는 절대 조급하지 않는다 — 기다림의 미학을 아는 자
- 예측하여 꼭대기, 최저점에서 잡는게 아닌 **'확실히 확인된 지점'**에서 진입
- 천장, 바닥이 아닌 **'확실한 터닝포인트'**에서 익절

---

*Last Updated: 2025.12.10*
*MOBCOTGAPWM = My Own BCOTGAPWM (From 2023.10.02)*
