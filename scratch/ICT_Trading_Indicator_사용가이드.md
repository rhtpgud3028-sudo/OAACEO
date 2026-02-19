# ICT Trading Indicator for KSH - 상세 사용 가이드

## 📌 개요

이 인디케이터는 **ICT(Inner Circle Trader)** 트레이딩 전략을 기반으로 한 종합 분석 도구입니다.
n8n AI 자동매매 시스템과 연동하여 사용할 수 있도록 JSON 형식의 Alert 기능을 포함합니다.

---

## 🎛️ 설정 패널 가이드 (9개 그룹)

TradingView에서 인디케이터를 차트에 추가한 후, **설정(⚙️) 아이콘**을 클릭하면 아래 설정들을 조정할 수 있습니다.

---

### 1️⃣ 시장 구조 (Market Structure)

| 설정 | 기본값 | 설명 |
|------|--------|------|
| **Pivot Left Bars** | 5 | 스윙 포인트 감지를 위한 왼쪽 캔들 수 |
| **Pivot Right Bars** | 5 | 스윙 포인트 감지를 위한 오른쪽 캔들 수 |
| **Show BOS** | ✅ | BOS(Break of Structure) 라벨 표시 |
| **Show CHoCH** | ✅ | CHoCH(Change of Character) 라벨 표시 |
| **Show Swing Points** | ✅ | HH/HL/LH/LL 스윙 포인트 라벨 표시 |

**💡 사용법:**
- **HH (Higher High)**: 고점이 이전 고점보다 높음 → 상승 추세 지속
- **HL (Higher Low)**: 저점이 이전 저점보다 높음 → 상승 추세 확인
- **LL (Lower Low)**: 저점이 이전 저점보다 낮음 → 하락 추세 지속
- **LH (Lower High)**: 고점이 이전 고점보다 낮음 → 하락 추세 확인
- **BOS**: 기존 추세 방향으로 구조 돌파 → 추세 지속 신호
- **CHoCH**: 반대 방향으로 구조 돌파 → 추세 전환 신호

---

### 2️⃣ Order Block (OB) 설정

| 설정 | 기본값 | 설명 |
|------|--------|------|
| **Show Order Blocks** | ✅ | OB 박스 표시 여부 |
| **Max Bars Back** | 500 | OB를 찾을 최대 과거 캔들 수 |
| **Extend OB Boxes** | ✅ | OB 박스를 오른쪽으로 연장 |
| **Delete OB After Fill** | ✅ | 가격이 OB를 완전히 통과하면 삭제 |
| **Bullish OB Color** | 녹색 70% | 상승 OB 박스 색상 |
| **Bearish OB Color** | 빨강 70% | 하락 OB 박스 색상 |

**💡 사용법:**
- **OB L (Bullish OB)**: 가격이 이 영역으로 되돌아오면 **롱 진입** 고려
- **OB S (Bearish OB)**: 가격이 이 영역으로 되돌아오면 **숏 진입** 고려
- OB는 BOS 또는 CHoCH 직전의 반대색 캔들 영역입니다
- **핵심 원칙**: OB에 닿기 전에 진입하지 말고, OB 터치 후 반응을 확인하세요

---

### 3️⃣ Fair Value Gap (FVG) 설정

| 설정 | 기본값 | 설명 |
|------|--------|------|
| **Show FVG** | ✅ | FVG 박스 표시 여부 |
| **Max Bars Back** | 1000 | FVG를 찾을 최대 과거 캔들 수 |
| **Show H1 FVG** | ✅ | 1시간봉 FVG 표시 (MTF) |
| **Show H4 FVG** | ✅ | 4시간봉 FVG 표시 (MTF) |
| **Show Daily FVG** | ❌ | 일봉 FVG 표시 (MTF) |
| **Delete FVG After Fill** | ✅ | FVG가 채워지면 삭제 |
| **Bullish FVG Color** | 핑크 70% | 상승 FVG 색상 |
| **Bearish FVG Color** | 핑크 70% | 하락 FVG 색상 |

**💡 사용법:**
- **FVG**: 3개 캔들 사이의 가격 공백 (비효율성 영역)
- 가격은 FVG를 "채우러" 다시 돌아오는 경향이 있음
- **롱 전략**: 상승 FVG (아래에 있는 갭)로 가격이 되돌아올 때 진입
- **숏 전략**: 하락 FVG (위에 있는 갭)로 가격이 되돌아올 때 진입
- **MTF FVG**: 상위 타임프레임의 FVG는 더 강한 지지/저항 역할

---

### 4️⃣ Breaker Block (BB) 설정

| 설정 | 기본값 | 설명 |
|------|--------|------|
| **Show Breaker Blocks** | ✅ | BB 표시 여부 |
| **Max Bars Back** | 500 | BB를 찾을 최대 과거 캔들 수 |
| **Bullish BB Color** | 파랑 70% | 상승 BB 색상 |
| **Bearish BB Color** | 파랑 70% | 하락 BB 색상 |

**💡 사용법:**
- **Breaker Block**: 실패한 Order Block이 반대 역할로 전환된 영역
- OB가 뚫리면 → 해당 OB는 Breaker Block으로 변함
- 이전에 저항이었던 영역이 지지로, 또는 그 반대로 작용

---

### 5️⃣ CE Line (50% Level) 설정

| 설정 | 기본값 | 설명 |
|------|--------|------|
| **Show CE Lines** | ✅ | CE 라인 표시 여부 |
| **CE Line Color** | 노랑 30% | CE 라인 색상 |

**💡 사용법:**
- **CE (Consequent Encroachment)**: OB 또는 FVG의 50% 지점
- 이 레벨은 **최적의 진입/청산 포인트**로 자주 사용됨
- 가격이 CE까지 되돌아오면 해당 구조물이 "작동 중"임을 의미
- **진입 전략**: OB의 CE 레벨에서 반전 캔들 확인 후 진입

---

### 6️⃣ Multi-Timeframe OB 설정

| 설정 | 기본값 | 설명 |
|------|--------|------|
| **Show MTF OB** | ✅ | 상위 타임프레임 OB 표시 |
| **MTF OB Timeframe** | D (1일) | 상위 타임프레임 선택 |
| **MTF OB Color** | 노랑 60% | MTF OB 색상 |

**💡 사용법:**
- 1시간봉 차트에서 **1D OB** 확인 가능
- 상위 타임프레임 OB는 더 강한 지지/저항 역할
- **1D OB L**: 일봉 상승 OB → 강력한 지지대
- **1D OB S**: 일봉 하락 OB → 강력한 저항대
- 하위 TF 진입 시 상위 TF OB와 방향이 일치하는지 확인!

---

### 7️⃣ 보조 지표 (Auxiliary Indicators) 설정

| 설정 | 기본값 | 설명 |
|------|--------|------|
| **Show Bollinger Bands** | ✅ | BB 표시 여부 |
| **BB Short Length** | 20 | 단기 BB 기간 |
| **BB Short StdDev** | 2.0 | 단기 BB 표준편차 |
| **BB Long Length** | 200 | 장기 BB 기간 |
| **BB Long StdDev** | 3.0 | 장기 BB 표준편차 |
| **Show Chikou Span** | ✅ | Ichimoku 치코우 스팬 표시 |
| **Chikou Length** | 26 | 치코우 스팬 기간 |

**💡 사용법:**
- **BB(20,2)**: 단기 변동성 밴드 (파란색)
  - 상단/하단 터치 시 과매수/과매도 영역
- **BB(200,3)**: 장기 지지/저항 밴드 (주황색)
  - 이 밴드는 매우 강한 S/R 역할
- **Chikou Span**: 26봉 전 종가를 현재 위치에 표시
  - 가격 위에 있으면 상승 추세, 아래면 하락 추세

---

### 8️⃣ 알림 설정 (n8n Alert)

| 설정 | 기본값 | 설명 |
|------|--------|------|
| **Enable Trading Alerts** | ✅ | 알림 기능 전체 활성화 |
| **Alert on BOS** | ✅ | BOS 발생 시 알림 |
| **Alert on CHoCH** | ✅ | CHoCH 발생 시 알림 |
| **Alert on OB Touch** | ✅ | OB 터치 시 알림 |
| **Alert on FVG Touch** | ✅ | FVG 터치 시 알림 |

**💡 n8n 연동 방법:**

1. TradingView에서 **알림 생성** (오른쪽 클릭 → 알림 추가)
2. 조건: "ICT Trading Indicator for KSH" 선택
3. **Webhook URL**: n8n의 Webhook 트리거 URL 입력
4. 알림 메시지는 JSON 형식으로 자동 생성됨:

```json
{"signal":"BOS_BULL","price":92350.5,"time":"1702200000000"}
{"signal":"LONG","price":92350.5,"rsi":28.5,"mfi":18.2,"trend":1,"time":"..."}
{"signal":"OB_TOUCH","price":92350.5,"ob_top":93000,"ob_bottom":92000,"time":"..."}
```

---

### 9️⃣ 거시적 트리거 (Macro Triggers)

| 설정 | 기본값 | 설명 |
|------|--------|------|
| **Enable Macro Alerts** | ✅ | 거시적 트리거 알림 활성화 |
| **Large Volume Threshold** | 2.0 | 평균 대비 거래량 배수 |

**💡 사용법:**
- 평균의 2배 이상 거래량 발생 시 배경색이 노란색으로 변함
- 대량 거래량 = 스마트 머니 활동 가능성
- 이 신호와 함께 OB/FVG 터치가 발생하면 더 강한 신호

---

## 📊 하단 상태 테이블

차트 우측 하단에 실시간 상태 테이블이 표시됩니다:

| 항목 | 설명 |
|------|------|
| **Trend** | 현재 추세 (BULL/BEAR/NEUTRAL) |
| **RSI (14)** | RSI 값 (빨강: 과매수, 녹색: 과매도) |
| **MFI (14)** | 자금 흐름 지수 |
| **MACD Hist** | MACD 히스토그램 값 |
| **Last Signal** | 최근 종합 시그널 (LONG/SHORT) |

---

## 🎯 종합 트레이딩 시그널

인디케이터는 다음 조건이 **모두 충족**될 때 종합 시그널을 생성합니다:

### LONG 시그널 조건
1. BOS Bull 또는 CHoCH Bull 발생
2. RSI가 30 이하 (과매도)
3. 현재 추세가 상승 (trend = 1)

### SHORT 시그널 조건
1. BOS Bear 또는 CHoCH Bear 발생
2. RSI가 70 이상 (과매수)
3. 현재 추세가 하락 (trend = -1)

---

## 📈 실전 트레이딩 전략

### 전략 1: OB 리테스트 진입

```
1. 상위 TF (1D/4H)에서 추세 방향 확인
2. 현재 TF에서 BOS 또는 CHoCH 발생 확인
3. OB 영역으로 가격 되돌림 대기
4. OB의 CE(50%) 레벨에서 반전 캔들 확인
5. 스탑로스: OB 반대편, 목표가: 이전 HH/LL
```

### 전략 2: FVG Fill 진입

```
1. H4 또는 H1 FVG 영역 확인
2. 가격이 FVG 영역으로 진입 대기
3. FVG의 CE(50%) 레벨에서 반전 확인
4. FVG 방향과 일치하는 방향으로 진입
5. 스탑로스: FVG 완전 돌파, 목표가: 반대편 유동성
```

### 전략 3: MTF 컨플루언스 진입

```
1. 1D OB 영역 확인 (1D OB L 또는 1D OB S)
2. 1H 차트에서 해당 영역으로 가격 접근 대기
3. 1H CHoCH 발생으로 추세 전환 확인
4. 추가 확인: RSI 과매수/과매도 + 대량 거래량
5. 1D OB 방향과 일치하는 방향으로 진입
```

---

## ⚠️ 주의사항

1. **단일 신호로 진입하지 마세요** - 최소 2개 이상의 전략이 일치할 때 진입
2. **상위 TF와 반대 방향 거래 금지** - 1D 추세와 반대로 거래하지 마세요
3. **킬존 시간 확인** - 뉴욕 킬존(22:00~01:00 KST), 런던 킬존(16:00~19:00 KST)
4. **뉴스 발표 전후 거래 금지** - 고변동성 구간 회피
5. **리스크 관리** - 한 번의 거래에 총 시드의 1-2% 이상 리스크 금지

---

## 🔧 권장 차트 설정

| 항목 | 권장값 |
|------|--------|
| 차트 타입 | 캔들스틱 |
| 주요 타임프레임 | 1H (분석용: 4H, 1D) |
| 심볼 | BTCUSDT.P (선물) |
| 거래소 | Bitget, Binance, Bybit |

---

## 📞 문제 해결

| 문제 | 해결 방법 |
|------|----------|
| 라벨이 너무 많음 | Swing Points 표시 OFF |
| 차트가 느림 | Max Bars Back 값 줄이기 |
| MTF FVG 안 보임 | 해당 TF의 FVG가 없는 경우 |
| Alert 안 옴 | TradingView Alert 설정 확인 |

---

**Happy Trading! 🚀**
