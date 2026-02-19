"""
Phase 2 카테고리 최적화 + 채널 자동순환 통합 스크립트
- Branding Router: 음식/노후/국뽕/운동 → 인생지혜/디지털부업/중년뷰티/스마트폰AI
- AI Persona Router: 카테고리 매칭 업데이트
- Topic Override: 폴백 주제 업데이트
- Edit Fields [54]: channelId 하드코딩 → 채널 자동순환 Code 노드로 교체
"""

import json, subprocess

DB_PATH = "/root/.n8n/.n8n/database.sqlite"
WF_ID = "mhPPIHjYTH4sFUDK"

result = subprocess.run(
    ["sqlite3", DB_PATH, f"SELECT nodes FROM workflow_entity WHERE id='{WF_ID}';"],
    capture_output=True, text=True, timeout=10
)
nodes = json.loads(result.stdout.strip())

changes = []
errors = []

# ========================================================
# 1. BRANDING ROUTER [52] - 7개 카테고리 최적화
# ========================================================
try:
    new_branding_router = r'''/**
 * AIASF Phase 2 - 21채널 브랜딩 라우터
 * 버전: 5.0 OPTIMIZED (2026-02-11)
 *
 * 📋 v5.0 최적화:
 * - 7개 카테고리 수익 극대화 재설계
 * - 음식/노후/국뽕/운동 → 인생지혜/디지털부업/중년뷰티/스마트폰AI
 * - CPM/CPA 기반 카테고리 선정
 */

const CHANNEL_FULL_CONFIGS = {
    // ==================== 건강 (ch_1~3) ====================
    // CPM: HIGH | CPA: 건강보조식품, 의료기기
    ch_1: {
        name: "건강한하루",
        topic: "건강",
        voiceId: "pNInz6obpgDQGcFmaJgB",
        voiceName: "Taemin",
        logoUrl: "https://autoshort.site/logos/ch_1_logo.png",
        introStyle: "밝고 화사한 아침 햇살이 비치는 거실에서 건강한 아침을 시작하는 50대 여성",
        outroStyle: "따뜻한 저녁 노을이 비치는 창가에서 가족과 함께하는 저녁 시간",
        bgm: { volume: 0.14, trim: 0, fadeEffect: "fadeOut" }
    },
    ch_2: {
        name: "시니어헬스톡",
        topic: "건강",
        voiceId: "ErXwobaYiN019PkySvjV",
        voiceName: "Wonmoon",
        logoUrl: "https://autoshort.site/logos/ch_2_logo.png",
        introStyle: "깨끗한 병원 로비에서 친절한 의사와 상담하는 60대 남성 환자",
        outroStyle: "공원 벤치에서 햇살을 받으며 산책하는 건강한 60대 부부",
        bgm: { volume: 0.16, trim: 2, fadeEffect: "fadeInOut" }
    },
    ch_3: {
        name: "오래오래건강",
        topic: "건강",
        voiceId: "VR6AewLTigWG4xSOukaG",
        voiceName: "YohanKoo",
        logoUrl: "https://autoshort.site/logos/ch_3_logo.png",
        introStyle: "신선한 공기와 푸른 산이 보이는 자연 속에서 스트레칭하는 50대 남성",
        outroStyle: "정성스럽게 차린 건강 밥상 앞에서 웃으며 식사하는 50대 가족",
        bgm: { volume: 0.13, trim: 1, fadeEffect: "fadeOut" }
    },

    // ==================== 재테크 (ch_4~6) ====================
    // CPM: HIGHEST ($4.50) | CPA: 보험, 금융앱, 부동산
    ch_4: {
        name: "슬기로운노후",
        topic: "재테크",
        voiceId: "ZZ4xhVcc83kZBfNIlIIz",
        voiceName: "Man Bo",
        logoUrl: "https://autoshort.site/logos/ch_4_logo.png",
        introStyle: "현대적인 사무실에서 노트북으로 재무 분석하는 50대 전문가",
        outroStyle: "성공적인 투자 그래프와 만족스러운 미소를 짓는 60대 투자자",
        bgm: { volume: 0.17, trim: 3, fadeEffect: "fadeIn" }
    },
    ch_5: {
        name: "은퇴설계소",
        topic: "재테크",
        voiceId: "H8ObVvroE5JXeeUSJakg",
        voiceName: "Hyun Bin",
        logoUrl: "https://autoshort.site/logos/ch_5_logo.png",
        introStyle: "편안한 은행 창구에서 재무 상담을 받는 60대 부부",
        outroStyle: "해변 리조트에서 여유로운 은퇴 생활을 즐기는 행복한 60대 부부",
        bgm: { volume: 0.15, trim: 0, fadeEffect: "fadeInOut" }
    },
    ch_6: {
        name: "자산지킴이",
        topic: "재테크",
        voiceId: "DMkRitQrfpiddSQT5adl",
        voiceName: "Jjeong",
        logoUrl: "https://autoshort.site/logos/ch_6_logo.png",
        introStyle: "고급스러운 서재에서 재무 서류를 검토하는 50대 여성",
        outroStyle: "새로 장만한 집을 가족과 함께 구경하며 기뻐하는 60대 부부",
        bgm: { volume: 0.14, trim: 4, fadeEffect: "fadeOut" }
    },

    // ==================== 전원생활 (ch_7~9) ====================
    // CPM: MEDIUM | CPA: 토지중개, 귀농지원금
    ch_7: {
        name: "전원의꿈",
        topic: "전원",
        voiceId: "xi3rF0t7dg7uN2M0WUhr",
        voiceName: "Yuna",
        logoUrl: "https://autoshort.site/logos/ch_7_logo.png",
        introStyle: "시골 카페에서 창밖의 아름다운 산 풍경을 보며 여유를 즐기는 50대 남성",
        outroStyle: "텃밭에서 직접 기른 채소를 수확하며 뿌듯해하는 60대 부부",
        bgm: { volume: 0.16, trim: 1, fadeEffect: "fadeIn" }
    },
    ch_8: {
        name: "시골라이프",
        topic: "전원",
        voiceId: "sSoVF9lUgTGJz0Xz3J9y",
        voiceName: "Jina",
        logoUrl: "https://autoshort.site/logos/ch_8_logo.png",
        introStyle: "아침 안개가 걷히는 시골 마을의 평화로운 논밭 풍경",
        outroStyle: "마을 주민들과 함께 웃으며 이야기하는 정겨운 50대 귀촌인",
        bgm: { volume: 0.13, trim: 2, fadeEffect: "fadeOut" }
    },
    ch_9: {
        name: "귀농일기",
        topic: "전원",
        voiceId: "Ir7oQcBXWiq4oFGROCfj",
        voiceName: "Anna Kim",
        logoUrl: "https://autoshort.site/logos/ch_9_logo.png",
        introStyle: "넓은 잔디밭이 있는 전원주택 마당에서 아침 커피를 즐기는 60대 남성",
        outroStyle: "온 가족이 모여 바베큐 파티를 즐기는 행복한 주말 오후",
        bgm: { volume: 0.18, trim: 0, fadeEffect: "fadeInOut" }
    },

    // ==================== 인생지혜 (ch_10~12) ====================
    // CPM: MEDIUM-HIGH | CPA: 자기계발 서적, 상담서비스
    // ★ v5.0: 음식 → 인생지혜 (시니어 심리적 니즈 + 자기계발 CPM)
    ch_10: {
        name: "인생선배",
        topic: "인생지혜",
        voiceId: "jBpfuIE2acCO8z3wKNLl",
        voiceName: "JiYoung",
        logoUrl: "https://autoshort.site/logos/ch_10_logo.png",
        introStyle: "아름다운 정원에서 책을 읽으며 여유를 즐기는 60대 남성",
        outroStyle: "손주와 함께 놀이터에서 즐거운 시간을 보내는 할아버지",
        bgm: { volume: 0.15, trim: 3, fadeEffect: "fadeOut" }
    },
    ch_11: {
        name: "지혜의샘",
        topic: "인생지혜",
        voiceId: "z9fAnlkpzviPz146aGWa",
        voiceName: "Jennie",
        logoUrl: "https://autoshort.site/logos/ch_11_logo.png",
        introStyle: "세계 여행지에서 기념사진을 찍는 활동적인 60대 부부",
        outroStyle: "편안한 거실 소파에서 함께 TV를 보며 웃는 노부부",
        bgm: { volume: 0.14, trim: 5, fadeEffect: "fadeIn" }
    },
    ch_12: {
        name: "마음치유",
        topic: "인생지혜",
        voiceId: "oWAxZDx7w5VEj9dCyTzz",
        voiceName: "June",
        logoUrl: "https://autoshort.site/logos/ch_12_logo.png",
        introStyle: "취미 교실에서 열정적으로 수채화를 그리는 60대 여성",
        outroStyle: "친구들과 함께 카페에서 웃으며 대화하는 즐거운 오후",
        bgm: { volume: 0.17, trim: 1, fadeEffect: "fadeOut" }
    },

    // ==================== 디지털부업 (ch_13~15) ====================
    // CPM: HIGH | CPA: 부업 플랫폼, 교육, 재취업 서비스
    // ★ v5.0: 노후 → 디지털부업 (CPA 극대화)
    ch_13: {
        name: "50대부업연구소",
        topic: "디지털부업",
        voiceId: "ThT5KcBeYPX3keUQqHPh",
        voiceName: "Min-joon",
        logoUrl: "https://autoshort.site/logos/ch_13_logo.png",
        introStyle: "깔끔한 홈오피스에서 노트북으로 부업하는 50대 남성",
        outroStyle: "수익 대시보드를 보며 뿌듯한 미소를 짓는 50대",
        bgm: { volume: 0.13, trim: 0, fadeEffect: "fadeInOut" }
    },
    ch_14: {
        name: "디지털수입",
        topic: "디지털부업",
        voiceId: "jsCqWAovK2LkecY7zXl4",
        voiceName: "DeckYuk",
        logoUrl: "https://autoshort.site/logos/ch_14_logo.png",
        introStyle: "카페에서 스마트폰으로 부업 수익을 확인하는 50대 여성",
        outroStyle: "월 수입 100만원 달성을 축하하는 중년 부부",
        bgm: { volume: 0.16, trim: 2, fadeEffect: "fadeOut" }
    },
    ch_15: {
        name: "중년창업스쿨",
        topic: "디지털부업",
        voiceId: "onwK4e9ZLuTAKqWW03F9",
        voiceName: "Grandfather Namchun",
        logoUrl: "https://autoshort.site/logos/ch_15_logo.png",
        introStyle: "서점에서 창업 관련 책을 고르는 열정적인 60대 남성",
        outroStyle: "소규모 온라인 쇼핑몰을 성공적으로 운영하는 60대 사장님",
        bgm: { volume: 0.15, trim: 4, fadeEffect: "fadeIn" }
    },

    // ==================== 중년뷰티 (ch_16~18) ====================
    // CPM: HIGH | CPA: 화장품, 건강식품, 피부관리
    // ★ v5.0: 운동 → 중년뷰티 (뷰티 CPM + 화장품 CPA)
    ch_16: {
        name: "동안비결",
        topic: "중년뷰티",
        voiceId: "N2lVS1w4EtoT3dr4eOWO",
        voiceName: "KKC",
        logoUrl: "https://autoshort.site/logos/ch_16_logo.png",
        introStyle: "밝은 욕실에서 스킨케어 루틴을 시작하는 50대 여성",
        outroStyle: "10년 전 사진과 현재 모습을 비교하며 자신감 넘치는 50대",
        bgm: { volume: 0.14, trim: 1, fadeEffect: "fadeOut" }
    },
    ch_17: {
        name: "중년뷰티랩",
        topic: "중년뷰티",
        voiceId: "IKne3meq5aSn9XLyUdCD",
        voiceName: "Jung - Narrative",
        logoUrl: "https://autoshort.site/logos/ch_17_logo.png",
        introStyle: "깨끗한 요가 매트 위에서 자세교정 운동을 하는 50대 여성",
        outroStyle: "바른 자세로 자신감 있게 걷는 건강한 60대",
        bgm: { volume: 0.18, trim: 3, fadeEffect: "fadeInOut" }
    },
    ch_18: {
        name: "자세가건강",
        topic: "중년뷰티",
        voiceId: "XB0fDUnXU5powFXDhCwa",
        voiceName: "HYUK",
        logoUrl: "https://autoshort.site/logos/ch_18_logo.png",
        introStyle: "피부과에서 전문 상담을 받는 50대 남성",
        outroStyle: "깔끔한 피부관리 후 밝아진 표정의 60대",
        bgm: { volume: 0.13, trim: 0, fadeEffect: "fadeOut" }
    },

    // ==================== 스마트폰AI (ch_19~21) ====================
    // CPM: HIGH | CPA: IT제품, 앱 추천, 교육
    // ★ v5.0: 국뽕 → 스마트폰AI (시니어 2순위 검색, IT 광고주 다수)
    ch_19: {
        name: "AI꿀팁",
        topic: "스마트폰AI",
        voiceId: "CYw3kZ02Hs0563khs1Fj",
        voiceName: "Kyungduk Ko",
        logoUrl: "https://autoshort.site/logos/ch_19_logo.png",
        introStyle: "스마트폰을 들고 새로운 기능을 발견한 듯 놀란 표정의 50대",
        outroStyle: "AI 앱을 활용해 업무를 척척 처리하는 멋진 60대",
        bgm: { volume: 0.17, trim: 2, fadeEffect: "fadeIn" }
    },
    ch_20: {
        name: "스마트시니어",
        topic: "스마트폰AI",
        voiceId: "bVMeCyTHy58xNoL34h3p",
        voiceName: "Jaedong Ahn",
        logoUrl: "https://autoshort.site/logos/ch_20_logo.png",
        introStyle: "손주에게 스마트폰 사용법을 거꾸로 가르쳐주는 멋진 할아버지",
        outroStyle: "AI로 사진을 편집하며 즐거워하는 60대 부부",
        bgm: { volume: 0.15, trim: 5, fadeEffect: "fadeOut" }
    },
    ch_21: {
        name: "디지털생활",
        topic: "스마트폰AI",
        voiceId: "JBFqnCBsd6RMkjVDRZzb",
        voiceName: "Bin",
        logoUrl: "https://autoshort.site/logos/ch_21_logo.png",
        introStyle: "카페에서 태블릿으로 온라인 강의를 듣는 세련된 50대 여성",
        outroStyle: "디지털 기기를 자유자재로 다루는 자신감 넘치는 60대",
        bgm: { volume: 0.14, trim: 1, fadeEffect: "fadeInOut" }
    }
};

// BGM 라이브러리 (카테고리 매칭 업데이트)
const BGM_LIBRARY = {
    "건강": "https://autoshort.site/bgm/health_calm.mp3",
    "재테크": "https://autoshort.site/bgm/finance_upbeat.mp3",
    "전원": "https://autoshort.site/bgm/rural_peaceful.mp3",
    "인생지혜": "https://autoshort.site/bgm/lifestyle_peaceful.mp3",
    "디지털부업": "https://autoshort.site/bgm/finance_upbeat.mp3",
    "중년뷰티": "https://autoshort.site/bgm/health_calm.mp3",
    "스마트폰AI": "https://autoshort.site/bgm/default_warm.mp3",
    "default": "https://autoshort.site/bgm/default_warm.mp3"
};

function getChannelConfig(channelId) {
    return CHANNEL_FULL_CONFIGS[channelId] || CHANNEL_FULL_CONFIGS["ch_1"];
}

function getChannelNumber(channelId) {
    const match = channelId.match(/ch_(\d+)/);
    return match ? parseInt(match[1]) : 1;
}

const channelId = $input.first().json.channelId || "ch_1";
const config = getChannelConfig(channelId);
const channelNumber = getChannelNumber(channelId);

return [{
    json: {
        channelId: channelId,
        channelNumber: channelNumber,
        channelName: config.name,
        topic: config.topic,
        voice: {
            voiceId: config.voiceId,
            voiceName: config.voiceName
        },
        logo: {
            url: config.logoUrl,
            position: "bottomRight",
            size: 80,
            opacity: 0.7
        },
        promptStyles: {
            intro: config.introStyle,
            outro: config.outroStyle
        },
        bgm: {
            url: BGM_LIBRARY[config.topic] || BGM_LIBRARY["default"],
            volume: config.bgm.volume,
            trim: config.bgm.trim,
            fadeEffect: config.bgm.fadeEffect
        },
        debug: {
            version: "5.0-OPTIMIZED",
            verificationDate: "2026-02-11",
            categories: ["건강", "재테크", "전원", "인생지혜", "디지털부업", "중년뷰티", "스마트폰AI"],
            optimization: "CPM/CPA 수익 극대화 7개 카테고리"
        }
    }
}];'''

    nodes[52]["parameters"]["jsCode"] = new_branding_router
    changes.append("1. Branding Router v5.0: 7개 카테고리 최적화 (음식/노후/국뽕/운동 → 인생지혜/디지털부업/중년뷰티/스마트폰AI)")
except Exception as e:
    errors.append(f"1. Branding Router error: {e}")

# ========================================================
# 2. AI PERSONA ROUTER [55] - 카테고리 매칭 업데이트
# ========================================================
try:
    ap_code = nodes[55]["parameters"]["jsCode"]

    # 카테고리 키 변경: wisdom(ch_10~12), sidejob(ch_13~15), beauty(ch_16~18), tech(ch_19~21)
    # 현재: wisdom은 "관계 & 노년의 지혜" → 유지 (적합)
    # 현재: sidejob은 "디지털 부업" → 유지 (적합)
    # 현재: beauty는 "뷰티 & 자세교정" → 유지 (적합)
    # 현재: tech는 "스마트폰/AI 꿀팁" → 유지 (적합)

    # 핵심 변경: ch_10~12를 음식→인생지혜로 매핑
    # 기존: if (channelNum <= 12) return AI_PERSONAS.wisdom[channelId];
    # → wisdom(ch_10~12)은 이미 인생지혜 컨셉이므로 코드 변경 불필요!

    # AI Persona 카테고리 주석만 업데이트
    ap_code = ap_code.replace(
        "// 4. 관계 & 노년의 지혜 (ch_10~12)",
        "// 4. 인생지혜 & 관계 (ch_10~12) - v5.0: 음식 카테고리에서 변경"
    )
    ap_code = ap_code.replace(
        "// 5. 디지털 부업 (ch_13~15)",
        "// 5. 디지털부업 & 재취업 (ch_13~15) - v5.0"
    )
    ap_code = ap_code.replace(
        "// 6. 뷰티 & 자세교정 (ch_16~18)",
        "// 6. 중년뷰티 & 자세교정 (ch_16~18) - v5.0"
    )
    ap_code = ap_code.replace(
        "// 7. 스마트폰/AI 꿀팁 (ch_19~21)",
        "// 7. 스마트폰AI & 생활꿀팁 (ch_19~21) - v5.0"
    )

    # 버전 업데이트
    ap_code = ap_code.replace(
        '* 버전: 4.0.0 (5060 유명인 페르소나 적용)',
        '* 버전: 5.0.0 (카테고리 최적화 + 5060 유명인 페르소나)'
    )

    nodes[55]["parameters"]["jsCode"] = ap_code
    changes.append("2. AI Persona Router v5.0: 카테고리 매칭 주석 업데이트")
except Exception as e:
    errors.append(f"2. AI Persona error: {e}")

# ========================================================
# 3. TOPIC OVERRIDE [56] - 폴백 주제 + 키워드 업데이트
# ========================================================
try:
    to_code = nodes[56]["parameters"]["jsCode"]

    # 키워드 검증 딕셔너리 교체
    old_keywords = '''const CHANNEL_KEYWORDS = {
    "건강": ["건강", "혈당", "당뇨", "혈압", "운동", "식단", "노화", "혈관", "면역"],
    "재테크": ["재테크", "연금", "투자", "ETF", "금", "부동산", "세금", "상속", "은퇴", "적금", "저축"],
    "전원": ["귀농", "귀촌", "시골", "농촌", "자연인", "전원", "토지"],
    "음식": ["음식", "식품", "먹거리", "건강식", "약초", "영양", "다이어트", "식단"],
    "노후": ["인생", "자녀", "부부", "노후", "처세", "가족", "관계", "은퇴생활"],
    "운동": ["운동", "걷기", "스트레칭", "근력", "헬스", "필라테스", "등산", "건강체조"],
    "국뽕": ["한국", "K-", "대한민국", "한류", "세계", "수출", "반도체", "BTS", "한식"],
    "default": []
};'''

    new_keywords = '''const CHANNEL_KEYWORDS = {
    "건강": ["건강", "혈당", "당뇨", "혈압", "운동", "식단", "노화", "혈관", "면역", "관절", "무릎", "허리"],
    "재테크": ["재테크", "연금", "투자", "ETF", "금", "부동산", "세금", "상속", "은퇴", "적금", "저축", "보험"],
    "전원": ["귀농", "귀촌", "시골", "농촌", "자연인", "전원", "토지", "텃밭", "농사"],
    "인생지혜": ["인생", "자녀", "부부", "관계", "처세", "가족", "지혜", "마음", "심리", "행복", "소통", "화해"],
    "디지털부업": ["부업", "수입", "온라인", "재취업", "창업", "쇼핑몰", "블로그", "스마트스토어", "수익", "돈벌기"],
    "중년뷰티": ["피부", "주름", "동안", "자세", "거북목", "탈모", "화장", "뷰티", "스킨케어", "교정", "스트레칭"],
    "스마트폰AI": ["스마트폰", "앱", "AI", "인공지능", "디지털", "챗봇", "인터넷", "보안", "갤럭시", "아이폰"],
    "default": []
};'''

    to_code = to_code.replace(old_keywords, new_keywords)

    # 폴백 주제 딕셔너리 교체
    old_fallback_start = '// 🔴 채널별 폴백 주제 (GPT 주제선정이 빈 결과일 때!)\nconst FALLBACK_TOPICS = {'
    old_fallback_end = '};\n\n// 🔴 주제 누락 감지'

    fb_start = to_code.index(old_fallback_start)
    fb_end = to_code.index(old_fallback_end) + len('};\n')

    new_fallback = '''// 🔴 채널별 폴백 주제 (GPT 주제선정이 빈 결과일 때!)
// v5.0: 최적화된 7개 카테고리
const FALLBACK_TOPICS = {
    "건강": {
        topics: ["아침에 물 한잔의 효과", "걷기 운동으로 혈당 관리", "50대 이후 꼭 먹어야 할 음식", "면역력 높이는 생활습관", "혈압 관리 핵심 수칙", "무릎 통증 잡는 간단 운동", "혈관 나이 되돌리는 습관"],
        hooks: ["이것 모르면 건강 잃습니다", "50대 70%가 잘못 알고 있어요", "의사들이 꼭 하는 습관", "매일 이것만 하면 혈관이 살아납니다", "절대 하면 안 되는 건강 습관", "무릎이 아프면 이것부터 하세요", "혈당 수치가 뚝 떨어집니다"],
        angles: ["손해회피", "숫자충격", "반전폭격", "비밀공개", "질문폭탄", "손해회피", "숫자충격"]
    },
    "재테크": {
        topics: ["국민연금 수령 전략", "ISA 절세 꿀팁", "50대 ETF 투자법", "퇴직금 굴리는 법", "부동산 대출 이자 줄이기", "상속세 줄이는 합법적 방법", "보험 리모델링으로 돈 아끼기"],
        hooks: ["이거 모르면 매년 100만원 손해", "은행원도 안 알려주는 비밀", "90%가 모르는 연금 수령 전략", "세금 아끼는 가장 쉬운 방법", "지금 안 하면 노후가 위험합니다", "상속세 폭탄 피하는 법", "보험료 절반으로 줄이는 방법"],
        angles: ["손해회피", "비밀공개", "숫자충격", "반전폭격", "거대숫자", "손해회피", "비밀공개"]
    },
    "전원": {
        topics: ["귀촌 첫 해 실수", "시골집 리모델링 비용", "텃밭 초보 가이드", "귀농 지원금 받는 법", "전원주택 장단점"],
        hooks: ["귀촌 전 이것만 알았어도", "시골살이 1년차의 현실", "정부 지원금 이렇게 많았어?", "전원주택의 숨겨진 비용", "이것 모르고 귀촌하면 후회합니다"],
        angles: ["손해회피", "반전폭격", "숫자충격", "비밀공개", "질문폭탄"]
    },
    "인생지혜": {
        topics: ["행복한 부부 대화법", "자녀와 거리두기 지혜", "60대 인간관계 정리법", "노후 외로움 극복 비결", "인생 2막 의미 찾기", "용서와 화해의 심리학", "감사 일기의 놀라운 효과"],
        hooks: ["은퇴 후 가장 후회하는 것", "자녀에게 절대 하면 안 되는 말", "노후 행복의 비결은 이것", "60대 부부가 꼭 알아야 할 것", "인생 2막의 숨겨진 기회", "이 한마디가 관계를 살립니다", "매일 이것만 하면 우울감이 사라져요"],
        angles: ["반전폭격", "손해회피", "비밀공개", "질문폭탄", "숫자충격", "반전폭격", "비밀공개"]
    },
    "디지털부업": {
        topics: ["50대 스마트스토어 시작법", "블로그로 월 100만원 벌기", "중년 재취업 성공 전략", "쿠팡 파트너스 수익 공개", "유튜브 없이 온라인 수익 내기", "AI로 부업하는 방법", "중년 프리랜서 되는 법"],
        hooks: ["50대도 월 100만원 부업 가능해요", "컴퓨터 못해도 됩니다 진짜로", "재취업 성공한 60대의 비결", "하루 1시간으로 용돈 벌기", "이 부업은 나이 상관없어요", "AI가 대신 돈 벌어줍니다", "퇴직 후 프리랜서로 성공한 비결"],
        angles: ["거대숫자", "비밀공개", "반전폭격", "숫자충격", "질문폭탄", "비밀공개", "반전폭격"]
    },
    "중년뷰티": {
        topics: ["10살 어려 보이는 세안법", "거북목 교정 5분 운동", "50대 피부 탄력 살리는 법", "주름 예방 생활습관", "자세교정으로 통증 잡기", "탈모 예방 두피 관리법", "동안 비결 TOP 5"],
        hooks: ["이것만 바꿔도 10살 어려 보여요", "거북목 방치하면 이렇게 됩니다", "피부과 의사가 매일 하는 습관", "이 자세가 당신을 늙게 만들어요", "탈모 시작되기 전에 이것 하세요", "50대가 꼭 써야 할 화장품 3가지", "동안인 사람들의 공통점"],
        angles: ["비밀공개", "손해회피", "숫자충격", "반전폭격", "질문폭탄", "비밀공개", "숫자충격"]
    },
    "스마트폰AI": {
        topics: ["스마트폰 숨은 기능 5가지", "AI 챗봇 활용법 초보편", "보이스피싱 예방 설정법", "카카오톡 유용한 기능", "갤럭시 배터리 오래 쓰는 법", "ChatGPT로 일상 편리하게", "스마트폰 사진 잘 찍는 법"],
        hooks: ["이 기능 아시면 진짜 편해져요", "AI가 이것까지 해준다고요?", "이 설정 안 하면 돈 뺏깁니다", "카톡에 이런 기능이 있었어요?", "배터리 50% 더 오래 가는 비밀", "ChatGPT 이렇게 쓰면 비서가 생겨요", "프로 사진작가 뺨치는 꿀팁"],
        angles: ["비밀공개", "숫자충격", "손해회피", "반전폭격", "비밀공개", "질문폭탄", "비밀공개"]
    }
};
'''

    to_code = to_code[:fb_start] + new_fallback + '\n// 🔴 주제 누락 감지' + to_code[to_code.index('// 🔴 주제 누락 감지') + len('// 🔴 주제 누락 감지'):]

    # 버전 업데이트
    to_code = to_code.replace(
        "// 버전: 2.2 (2026-02-09)",
        "// 버전: 3.0 (2026-02-11) - 7개 카테고리 최적화!"
    )

    nodes[56]["parameters"]["jsCode"] = to_code
    changes.append("3. Topic Override v3.0: 7개 카테고리 키워드 + 폴백 주제 업데이트")
except Exception as e:
    errors.append(f"3. Topic Override error: {e}")

# ========================================================
# 4. EDIT FIELDS [54] → 채널 자동순환 Code 노드로 교체
# ========================================================
try:
    # Edit Fields 노드를 Code 노드로 변환
    nodes[54]["type"] = "n8n-nodes-base.code"
    nodes[54]["name"] = "Channel Auto-Rotation"
    nodes[54]["parameters"] = {
        "jsCode": """// 채널 자동순환 (v1.0) - 34분 간격 기준
// 21채널 × 2회/일 = 42영상/일
// epoch 기반 카운터 (서버 재시작해도 유지)

const TOTAL_CHANNELS = 21;
const INTERVAL_MS = 34 * 60 * 1000; // 34분

const execSlot = Math.floor(Date.now() / INTERVAL_MS);
const channelIndex = (execSlot % TOTAL_CHANNELS) + 1;
const channelId = `ch_${channelIndex}`;

return [{ json: { channelId } }];"""
    }
    # typeVersion 변경 (Edit Fields는 3, Code는 2)
    nodes[54]["typeVersion"] = 2

    changes.append("4. Edit Fields → Channel Auto-Rotation Code 노드 교체 (21채널 라운드로빈)")
except Exception as e:
    errors.append(f"4. Edit Fields error: {e}")

# ========================================================
# SAVE
# ========================================================
nodesJson = json.dumps(nodes)
escapedJson = nodesJson.replace("'", "''")
sql = f"UPDATE workflow_entity SET nodes = '{escapedJson}', updatedAt = datetime('now') WHERE id = '{WF_ID}';"
with open("/tmp/update_v5_optimize.sql", "w") as f:
    f.write(sql)

result = subprocess.run(
    ["sqlite3", DB_PATH],
    input=open("/tmp/update_v5_optimize.sql").read(),
    capture_output=True, text=True, timeout=30
)

if result.returncode != 0:
    print("DB ERROR:", result.stderr)

# ========================================================
# VERIFY
# ========================================================
result2 = subprocess.run(
    ["sqlite3", DB_PATH, f"SELECT nodes FROM workflow_entity WHERE id='{WF_ID}';"],
    capture_output=True, text=True, timeout=10
)
v_nodes = json.loads(result2.stdout.strip())
v_br = v_nodes[52]["parameters"]["jsCode"]
v_to = v_nodes[56]["parameters"]["jsCode"]
v_ap = v_nodes[55]["parameters"]["jsCode"]
v_ef = v_nodes[54]

print("=== Changes ===")
for c in changes:
    print("  + %s" % c)

if errors:
    print()
    print("=== ERRORS ===")
    for e in errors:
        print("  ! %s" % e)

print()
print("=== Verify ===")

checks = {
    "BR v5.0": "5.0-OPTIMIZED" in v_br,
    "BR 인생지혜": '"인생지혜"' in v_br,
    "BR 디지털부업": '"디지털부업"' in v_br,
    "BR 중년뷰티": '"중년뷰티"' in v_br,
    "BR 스마트폰AI": '"스마트폰AI"' in v_br,
    "BR 음식 제거": '"음식"' not in v_br,
    "BR 노후 제거": '"노후"' not in v_br,
    "BR 국뽕 제거": '"국뽕"' not in v_br,
    "BR 운동 제거(topic)": 'topic: "운동"' not in v_br,
    "TO 인생지혜 키워드": '"인생지혜"' in v_to,
    "TO 디지털부업 키워드": '"디지털부업"' in v_to,
    "TO v3.0": "3.0" in v_to,
    "AP v5.0": "5.0.0" in v_ap,
    "EF → Code 타입": v_ef["type"] == "n8n-nodes-base.code",
    "EF 자동순환": "TOTAL_CHANNELS = 21" in v_ef["parameters"].get("jsCode", ""),
    "EF 34분간격": "34 * 60 * 1000" in v_ef["parameters"].get("jsCode", ""),
}

all_pass = True
for k, v in checks.items():
    status = "YES" if v else "NO <<<< FAIL"
    if not v:
        all_pass = False
    print("  %s: %s" % (k, status))

print()
print("  BR length: %d chars" % len(v_br))
print("  TO length: %d chars" % len(v_to))
print("  AP length: %d chars" % len(v_ap))
print()
if all_pass:
    print("ALL CHECKS PASSED - v5.0 카테고리 최적화 READY!")
else:
    print("SOME CHECKS FAILED!")
