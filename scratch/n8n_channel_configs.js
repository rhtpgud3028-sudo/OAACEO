// ============================================================
// AIASF Phase 2 - 21채널 완전 차별화 설정
// v1.0 (2026-02-05)
// ============================================================
// 🎯 목표: YouTube 알고리즘이 21채널을 별개 채널로 인식
// 🔴 제약: 5060세대에게 거부감 없는 범위 내 베리에이션
// ============================================================

const CHANNEL_CONFIGS = {
    // ==================== 채널 1-7: 건강/의료 계열 ====================
    ch_1: {
        name: "건강한하루",
        topic: "건강",
        // TTS 설정
        voiceId: "pNInz6obpgDQGcFmaJgB",  // Adam - 차분한 남성
        voiceName: "Adam",
        // BGM 설정
        bgm: { volume: 0.14, trim: 0, fadeEffect: "fadeOut" },
        // 로고/워터마크
        logo: {
            url: "https://autoshort.site/logos/ch_1_logo.png",
            position: "bottomRight",
            size: 80,
            opacity: 0.7
        },
        // 인트로/아웃트로 프롬프트 스타일
        introStyle: "밝고 화사한 아침 햇살이 비치는 거실",
        outroStyle: "따뜻한 저녁 노을이 비치는 창가"
    },
    ch_2: {
        name: "시니어헬스",
        topic: "건강",
        voiceId: "ErXwobaYiN019PkySvjV",  // Antoni - 부드러운 남성
        voiceName: "Antoni",
        bgm: { volume: 0.16, trim: 2, fadeEffect: "fadeInOut" },
        logo: {
            url: "https://autoshort.site/logos/ch_2_logo.png",
            position: "bottomRight",
            size: 80,
            opacity: 0.7
        },
        introStyle: "깨끗한 병원 로비에서 의사와 상담하는 장면",
        outroStyle: "공원에서 산책하는 건강한 노부부"
    },
    ch_3: {
        name: "오래오래건강",
        topic: "건강",
        voiceId: "VR6AewLTigWG4xSOukaG",  // Arnold - 신뢰감 있는 남성
        voiceName: "Arnold",
        bgm: { volume: 0.13, trim: 1, fadeEffect: "fadeOut" },
        logo: {
            url: "https://autoshort.site/logos/ch_3_logo.png",
            position: "bottomRight",
            size: 80,
            opacity: 0.7
        },
        introStyle: "푸른 산과 맑은 공기가 느껴지는 자연 속",
        outroStyle: "가족들과 함께 웃으며 식사하는 모습"
    },

    // ==================== 채널 4-7: 재테크/금융 계열 ====================
    ch_4: {
        name: "똑똑한재테크",
        topic: "재테크",
        voiceId: "TxGEqnHWrfWFTfGW9XjX",  // Josh - 전문적인 남성
        voiceName: "Josh",
        bgm: { volume: 0.17, trim: 3, fadeEffect: "fadeIn" },
        logo: {
            url: "https://autoshort.site/logos/ch_4_logo.png",
            position: "bottomRight",
            size: 80,
            opacity: 0.7
        },
        introStyle: "현대적인 사무실에서 노트북을 보는 장면",
        outroStyle: "성공적인 투자 그래프가 보이는 화면"
    },
    ch_5: {
        name: "노후자산설계",
        topic: "재테크",
        voiceId: "yoZ06aMxZJJ28mfd3POQ",  // Sam - 친근한 남성
        voiceName: "Sam",
        bgm: { volume: 0.15, trim: 0, fadeEffect: "fadeInOut" },
        logo: {
            url: "https://autoshort.site/logos/ch_5_logo.png",
            position: "bottomRight",
            size: 80,
            opacity: 0.7
        },
        introStyle: "은행 창구에서 상담받는 중년 부부",
        outroStyle: "편안한 노후를 보내는 해변 풍경"
    },
    ch_6: {
        name: "시니어머니",
        topic: "재테크",
        voiceId: "21m00Tcm4TlvDq8ikWAM",  // Rachel - 차분한 여성
        voiceName: "Rachel",
        bgm: { volume: 0.14, trim: 4, fadeEffect: "fadeOut" },
        logo: {
            url: "https://autoshort.site/logos/ch_6_logo.png",
            position: "bottomRight",
            size: 80,
            opacity: 0.7
        },
        introStyle: "아늑한 서재에서 재무 서류를 검토하는 모습",
        outroStyle: "가족과 함께 새 집을 구경하는 장면"
    },
    ch_7: {
        name: "5060재테크",
        topic: "재테크",
        voiceId: "AZnzlk1XvdvUeBnXmlld",  // Domi - 밝은 여성
        voiceName: "Domi",
        bgm: { volume: 0.16, trim: 1, fadeEffect: "fadeIn" },
        logo: {
            url: "https://autoshort.site/logos/ch_7_logo.png",
            position: "bottomRight",
            size: 80,
            opacity: 0.7
        },
        introStyle: "카페에서 태블릿으로 주식 차트를 보는 장면",
        outroStyle: "여유로운 은퇴 생활을 즐기는 모습"
    },

    // ==================== 채널 8-10: 운동/피트니스 계열 ====================
    ch_8: {
        name: "건강한운동",
        topic: "운동",
        voiceId: "EXAVITQu4vr4xnSDxMaL",  // Bella - 활기찬 여성
        voiceName: "Bella",
        bgm: { volume: 0.13, trim: 2, fadeEffect: "fadeOut" },
        logo: {
            url: "https://autoshort.site/logos/ch_8_logo.png",
            position: "bottomRight",
            size: 80,
            opacity: 0.7
        },
        introStyle: "공원에서 스트레칭하는 중년 여성",
        outroStyle: "운동 후 상쾌하게 물을 마시는 장면"
    },
    ch_9: {
        name: "시니어피트니스",
        topic: "운동",
        voiceId: "MF3mGyEYCl7XYWbV9V6O",  // Elli - 온화한 여성
        voiceName: "Elli",
        bgm: { volume: 0.18, trim: 0, fadeEffect: "fadeInOut" },
        logo: {
            url: "https://autoshort.site/logos/ch_9_logo.png",
            position: "bottomRight",
            size: 80,
            opacity: 0.7
        },
        introStyle: "요가 매트 위에서 명상하는 장면",
        outroStyle: "산책로를 걷는 건강한 노부부"
    },
    ch_10: {
        name: "활력운동법",
        topic: "운동",
        voiceId: "jBpfuIE2acCO8z3wKNLl",  // Gigi - 에너지 넘치는 여성
        voiceName: "Gigi",
        bgm: { volume: 0.15, trim: 3, fadeEffect: "fadeOut" },
        logo: {
            url: "https://autoshort.site/logos/ch_10_logo.png",
            position: "bottomRight",
            size: 80,
            opacity: 0.7
        },
        introStyle: "헬스장에서 가벼운 운동을 하는 중년 남성",
        outroStyle: "운동 후 건강한 식사를 준비하는 모습"
    },

    // ==================== 채널 11-14: 음식/요리 계열 ====================
    ch_11: {
        name: "건강한밥상",
        topic: "음식",
        voiceId: "z9fAnlkpzviPz146aGWa",  // Glinda - 따뜻한 여성
        voiceName: "Glinda",
        bgm: { volume: 0.14, trim: 5, fadeEffect: "fadeIn" },
        logo: {
            url: "https://autoshort.site/logos/ch_11_logo.png",
            position: "bottomRight",
            size: 80,
            opacity: 0.7
        },
        introStyle: "깨끗한 주방에서 신선한 재료를 준비하는 장면",
        outroStyle: "가족들과 함께 맛있게 식사하는 모습"
    },
    ch_12: {
        name: "오래사는음식",
        topic: "음식",
        voiceId: "oWAxZDx7w5VEj9dCyTzz",  // Grace - 품위 있는 여성
        voiceName: "Grace",
        bgm: { volume: 0.17, trim: 1, fadeEffect: "fadeOut" },
        logo: {
            url: "https://autoshort.site/logos/ch_12_logo.png",
            position: "bottomRight",
            size: 80,
            opacity: 0.7
        },
        introStyle: "전통 한식 상차림이 보이는 밥상",
        outroStyle: "건강한 식재료가 가득한 시장 풍경"
    },
    ch_13: {
        name: "시니어푸드",
        topic: "음식",
        voiceId: "ThT5KcBeYPX3keUQqHPh",  // Dorothy - 친근한 여성
        voiceName: "Dorothy",
        bgm: { volume: 0.13, trim: 0, fadeEffect: "fadeInOut" },
        logo: {
            url: "https://autoshort.site/logos/ch_13_logo.png",
            position: "bottomRight",
            size: 80,
            opacity: 0.7
        },
        introStyle: "텃밭에서 직접 기른 채소를 수확하는 장면",
        outroStyle: "손자와 함께 요리하는 할머니"
    },
    ch_14: {
        name: "건강레시피",
        topic: "음식",
        voiceId: "jsCqWAovK2LkecY7zXl4",  // Freya - 상냥한 여성
        voiceName: "Freya",
        bgm: { volume: 0.16, trim: 2, fadeEffect: "fadeOut" },
        logo: {
            url: "https://autoshort.site/logos/ch_14_logo.png",
            position: "bottomRight",
            size: 80,
            opacity: 0.7
        },
        introStyle: "건강한 스무디를 만드는 장면",
        outroStyle: "예쁘게 플레이팅된 건강 요리"
    },

    // ==================== 채널 15-18: 노후/라이프스타일 계열 ====================
    ch_15: {
        name: "행복한노후",
        topic: "노후",
        voiceId: "onwK4e9ZLuTAKqWW03F9",  // Daniel - 따뜻한 남성
        voiceName: "Daniel",
        bgm: { volume: 0.15, trim: 4, fadeEffect: "fadeIn" },
        logo: {
            url: "https://autoshort.site/logos/ch_15_logo.png",
            position: "bottomRight",
            size: 80,
            opacity: 0.7
        },
        introStyle: "아름다운 정원에서 책을 읽는 노인",
        outroStyle: "손주와 함께 놀이터에서 노는 장면"
    },
    ch_16: {
        name: "시니어라이프",
        topic: "노후",
        voiceId: "N2lVS1w4EtoT3dr4eOWO",  // Callum - 신뢰감 남성
        voiceName: "Callum",
        bgm: { volume: 0.14, trim: 1, fadeEffect: "fadeOut" },
        logo: {
            url: "https://autoshort.site/logos/ch_16_logo.png",
            position: "bottomRight",
            size: 80,
            opacity: 0.7
        },
        introStyle: "여행지에서 사진을 찍는 중년 부부",
        outroStyle: "편안한 소파에서 TV를 보는 모습"
    },
    ch_17: {
        name: "즐거운인생2막",
        topic: "노후",
        voiceId: "IKne3meq5aSn9XLyUdCD",  // Charlie - 밝은 남성
        voiceName: "Charlie",
        bgm: { volume: 0.18, trim: 3, fadeEffect: "fadeInOut" },
        logo: {
            url: "https://autoshort.site/logos/ch_17_logo.png",
            position: "bottomRight",
            size: 80,
            opacity: 0.7
        },
        introStyle: "취미 교실에서 그림을 그리는 장면",
        outroStyle: "친구들과 함께 웃으며 대화하는 모습"
    },
    ch_18: {
        name: "5060라이프",
        topic: "노후",
        voiceId: "XB0fDUnXU5powFXDhCwa",  // Charlotte - 우아한 여성
        voiceName: "Charlotte",
        bgm: { volume: 0.13, trim: 0, fadeEffect: "fadeOut" },
        logo: {
            url: "https://autoshort.site/logos/ch_18_logo.png",
            position: "bottomRight",
            size: 80,
            opacity: 0.7
        },
        introStyle: "문화센터에서 강의를 듣는 장면",
        outroStyle: "가족 모임에서 행복하게 웃는 모습"
    },

    // ==================== 채널 19-21: 국뽕/자부심 계열 ====================
    ch_19: {
        name: "대한민국자랑",
        topic: "국뽕",
        voiceId: "CYw3kZ02Hs0563khs1Fj",  // Dave - 당당한 남성
        voiceName: "Dave",
        bgm: { volume: 0.17, trim: 2, fadeEffect: "fadeIn" },
        logo: {
            url: "https://autoshort.site/logos/ch_19_logo.png",
            position: "bottomRight",
            size: 80,
            opacity: 0.7
        },
        introStyle: "광화문 광장에서 태극기가 펄럭이는 장면",
        outroStyle: "현대적인 한국 도시 야경"
    },
    ch_20: {
        name: "코리아프라이드",
        topic: "국뽕",
        voiceId: "bVMeCyTHy58xNoL34h3p",  // Jeremy - 자신감 남성
        voiceName: "Jeremy",
        bgm: { volume: 0.15, trim: 5, fadeEffect: "fadeOut" },
        logo: {
            url: "https://autoshort.site/logos/ch_20_logo.png",
            position: "bottomRight",
            size: 80,
            opacity: 0.7
        },
        introStyle: "한복을 입은 사람들이 전통 마을을 걷는 장면",
        outroStyle: "K-POP 콘서트장의 열기 넘치는 모습"
    },
    ch_21: {
        name: "우리나라사랑",
        topic: "국뽕",
        voiceId: "JBFqnCBsd6RMkjVDRZzb",  // George - 깊은 남성
        voiceName: "George",
        bgm: { volume: 0.14, trim: 1, fadeEffect: "fadeInOut" },
        logo: {
            url: "https://autoshort.site/logos/ch_21_logo.png",
            position: "bottomRight",
            size: 80,
            opacity: 0.7
        },
        introStyle: "한강에서 배를 타며 서울 풍경을 보는 장면",
        outroStyle: "세계 각지에서 한국 문화를 즐기는 외국인들"
    }
};

// ==================== 채널 번호로 설정 가져오기 ====================
function getChannelConfig(channelNumber) {
    const key = `ch_${channelNumber}`;
    return CHANNEL_CONFIGS[key] || CHANNEL_CONFIGS.ch_1;
}

// ==================== 모듈 내보내기 ====================
module.exports = { CHANNEL_CONFIGS, getChannelConfig };
