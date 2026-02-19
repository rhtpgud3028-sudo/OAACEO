/**
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
}];
