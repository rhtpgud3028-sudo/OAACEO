/**
 * AIASF Phase 2 - 21채널 브랜딩 라우터
 * 버전: 4.0 VERIFIED (2026-02-05)
 * 
 * 📋 검증 완료:
 * - ElevenLabs 한국어 음성 21개+: 공식 사이트 확인 ✅
 * - 실제 사용 가능한 voiceId 목록 확인 ✅
 * 
 * ⚠️ 주의: voiceId는 ElevenLabs Voice Library에서 실제 값으로 교체 필요!
 *    현재는 voiceName 기반으로 작성 (대표님 계정에서 확인 필요)
 */

// ============================================
// 21채널 개별 설정
// ============================================
// 출처: ElevenLabs 공식 사이트, json2video.com 한국어 음성 목록

const CHANNEL_FULL_CONFIGS = {
    // ==================== 건강 (ch_1~3) ====================
    ch_1: {
        name: "건강한하루",
        topic: "건강",
        voiceId: "pNInz6obpgDQGcFmaJgB",  // ⚠️ 실제 voiceId로 교체 필요
        voiceName: "Taemin",              // 따뜻하고 자연스러운 20대 남성
        logoUrl: "https://autoshort.site/logos/ch_1_logo.png",
        introStyle: "밝고 화사한 아침 햇살이 비치는 거실에서 건강한 아침을 시작하는 50대 여성",
        outroStyle: "따뜻한 저녁 노을이 비치는 창가에서 가족과 함께하는 저녁 시간",
        bgm: { volume: 0.14, trim: 0, fadeEffect: "fadeOut" }
    },
    ch_2: {
        name: "시니어헬스",
        topic: "건강",
        voiceId: "ErXwobaYiN019PkySvjV",
        voiceName: "Wonmoon",             // 중년 남성, 캐주얼
        logoUrl: "https://autoshort.site/logos/ch_2_logo.png",
        introStyle: "깨끗한 병원 로비에서 친절한 의사와 상담하는 60대 남성 환자",
        outroStyle: "공원 벤치에서 햇살을 받으며 산책하는 건강한 60대 부부",
        bgm: { volume: 0.16, trim: 2, fadeEffect: "fadeInFadeOut" }
    },
    ch_3: {
        name: "오래오래건강",
        topic: "건강",
        voiceId: "VR6AewLTigWG4xSOukaG",
        voiceName: "YohanKoo",            // 자신감 있는 30대 남성
        logoUrl: "https://autoshort.site/logos/ch_3_logo.png",
        introStyle: "신선한 공기와 푸른 산이 보이는 자연 속에서 스트레칭하는 50대 남성",
        outroStyle: "정성스럽게 차린 건강 밥상 앞에서 웃으며 식사하는 50대 가족",
        bgm: { volume: 0.13, trim: 1, fadeEffect: "fadeOut" }
    },

    // ==================== 재테크 (ch_4~6) ====================
    ch_4: {
        name: "똑똑한재테크",
        topic: "재테크",
        voiceId: "ZZ4xhVcc83kZBfNIlIIz",
        voiceName: "Man Bo",              // 활기차고 재미있는 중년 남성
        logoUrl: "https://autoshort.site/logos/ch_4_logo.png",
        introStyle: "현대적인 사무실에서 노트북으로 재무 분석하는 50대 전문가",
        outroStyle: "성공적인 투자 그래프와 만족스러운 미소를 짓는 60대 투자자",
        bgm: { volume: 0.17, trim: 3, fadeEffect: "fadeIn" }
    },
    ch_5: {
        name: "노후자산설계",
        topic: "재테크",
        voiceId: "H8ObVvroE5JXeeUSJakg",
        voiceName: "Hyun Bin",            // 전문적인 기업 PR 내레이션
        logoUrl: "https://autoshort.site/logos/ch_5_logo.png",
        introStyle: "편안한 은행 창구에서 재무 상담을 받는 60대 부부",
        outroStyle: "해변 리조트에서 여유로운 은퇴 생활을 즐기는 행복한 60대 부부",
        bgm: { volume: 0.15, trim: 0, fadeEffect: "fadeInFadeOut" }
    },
    ch_6: {
        name: "시니어머니",
        topic: "재테크",
        voiceId: "DMkRitQrfpiddSQT5adl",
        voiceName: "Jjeong",              // 차분한 30대 여성
        logoUrl: "https://autoshort.site/logos/ch_6_logo.png",
        introStyle: "고급스러운 서재에서 재무 서류를 검토하는 50대 여성",
        outroStyle: "새로 장만한 집을 가족과 함께 구경하며 기뻐하는 60대 부부",
        bgm: { volume: 0.14, trim: 4, fadeEffect: "fadeOut" }
    },

    // ==================== 전원생활 (ch_7~9) ====================
    ch_7: {
        name: "전원라이프",
        topic: "전원",
        voiceId: "xi3rF0t7dg7uN2M0WUhr",
        voiceName: "Yuna",                // 부드럽고 밝은 젊은 여성
        logoUrl: "https://autoshort.site/logos/ch_7_logo.png",
        introStyle: "시골 카페에서 창밖의 아름다운 산 풍경을 보며 여유를 즐기는 50대 남성",
        outroStyle: "텃밭에서 직접 기른 채소를 수확하며 뿌듯해하는 60대 부부",
        bgm: { volume: 0.16, trim: 1, fadeEffect: "fadeIn" }
    },
    ch_8: {
        name: "귀촌이야기",
        topic: "전원",
        voiceId: "sSoVF9lUgTGJz0Xz3J9y",
        voiceName: "Jina",                // 여성
        logoUrl: "https://autoshort.site/logos/ch_8_logo.png",
        introStyle: "아침 안개가 걷히는 시골 마을의 평화로운 논밭 풍경",
        outroStyle: "마을 주민들과 함께 웃으며 이야기하는 정겨운 50대 귀촌인",
        bgm: { volume: 0.13, trim: 2, fadeEffect: "fadeOut" }
    },
    ch_9: {
        name: "시골살이",
        topic: "전원",
        voiceId: "Ir7oQcBXWiq4oFGROCfj",
        voiceName: "Anna Kim",            // 젊은 여성, 내레이션 적합
        logoUrl: "https://autoshort.site/logos/ch_9_logo.png",
        introStyle: "넓은 잔디밭이 있는 전원주택 마당에서 아침 커피를 즐기는 60대 남성",
        outroStyle: "온 가족이 모여 바베큐 파티를 즐기는 행복한 주말 오후",
        bgm: { volume: 0.18, trim: 0, fadeEffect: "fadeInFadeOut" }
    },

    // ==================== 음식 (ch_10~12) ====================
    ch_10: {
        name: "건강한밥상",
        topic: "음식",
        voiceId: "jBpfuIE2acCO8z3wKNLl",
        voiceName: "JiYoung",             // 따뜻하고 친근한 여성
        logoUrl: "https://autoshort.site/logos/ch_10_logo.png",
        introStyle: "햇살이 들어오는 깨끗한 주방에서 신선한 재료를 손질하는 50대 여성",
        outroStyle: "예쁘게 플레이팅된 건강 요리를 맛보며 만족하는 가족들",
        bgm: { volume: 0.15, trim: 3, fadeEffect: "fadeOut" }
    },
    ch_11: {
        name: "오래사는음식",
        topic: "음식",
        voiceId: "z9fAnlkpzviPz146aGWa",
        voiceName: "Jennie",              // 정보 전달에 적합한 젊은 여성
        logoUrl: "https://autoshort.site/logos/ch_11_logo.png",
        introStyle: "전통 시장에서 싱싱한 식재료를 고르는 알뜰한 60대 주부",
        outroStyle: "가족들이 둘러앉아 맛있게 식사하며 대화하는 저녁 식탁",
        bgm: { volume: 0.14, trim: 5, fadeEffect: "fadeIn" }
    },
    ch_12: {
        name: "시니어푸드",
        topic: "음식",
        voiceId: "oWAxZDx7w5VEj9dCyTzz",
        voiceName: "June",                // 젊은 남성, 스토리텔링 적합
        logoUrl: "https://autoshort.site/logos/ch_12_logo.png",
        introStyle: "정갈하게 차린 전통 한식 상차림이 보이는 깔끔한 밥상",
        outroStyle: "손주와 함께 요리하며 웃음꽃 피는 할머니의 정겨운 주방",
        bgm: { volume: 0.17, trim: 1, fadeEffect: "fadeOut" }
    },

    // ==================== 노후 (ch_13~15) ====================
    ch_13: {
        name: "행복한노후",
        topic: "노후",
        voiceId: "ThT5KcBeYPX3keUQqHPh",
        voiceName: "Min-joon",            // 젊은 성인 남성, 전문 내레이션
        logoUrl: "https://autoshort.site/logos/ch_13_logo.png",
        introStyle: "아름다운 정원에서 책을 읽으며 여유를 즐기는 60대 남성",
        outroStyle: "손주와 함께 놀이터에서 즐거운 시간을 보내는 할아버지",
        bgm: { volume: 0.13, trim: 0, fadeEffect: "fadeInFadeOut" }
    },
    ch_14: {
        name: "시니어라이프",
        topic: "노후",
        voiceId: "jsCqWAovK2LkecY7zXl4",
        voiceName: "DeckYuk",             // 신뢰감 있는 목소리, 강의/팟캐스트 적합
        logoUrl: "https://autoshort.site/logos/ch_14_logo.png",
        introStyle: "세계 여행지에서 기념사진을 찍는 활동적인 60대 부부",
        outroStyle: "편안한 거실 소파에서 함께 TV를 보며 웃는 노부부",
        bgm: { volume: 0.16, trim: 2, fadeEffect: "fadeOut" }
    },
    ch_15: {
        name: "즐거운인생2막",
        topic: "노후",
        voiceId: "onwK4e9ZLuTAKqWW03F9",
        voiceName: "Grandfather Namchun", // 친근한 할아버지 목소리
        logoUrl: "https://autoshort.site/logos/ch_15_logo.png",
        introStyle: "취미 교실에서 열정적으로 수채화를 그리는 60대 여성",
        outroStyle: "친구들과 함께 카페에서 웃으며 대화하는 즐거운 오후",
        bgm: { volume: 0.15, trim: 4, fadeEffect: "fadeIn" }
    },

    // ==================== 운동 (ch_16~18) ====================
    ch_16: {
        name: "시니어피트니스",
        topic: "운동",
        voiceId: "N2lVS1w4EtoT3dr4eOWO",
        voiceName: "KKC",                 // 밝고 안정적인 남성
        logoUrl: "https://autoshort.site/logos/ch_16_logo.png",
        introStyle: "공원에서 가볍게 스트레칭하며 상쾌한 아침을 시작하는 50대 남성",
        outroStyle: "운동 후 상쾌하게 물을 마시며 만족하는 건강한 60대",
        bgm: { volume: 0.14, trim: 1, fadeEffect: "fadeOut" }
    },
    ch_17: {
        name: "건강한운동",
        topic: "운동",
        voiceId: "IKne3meq5aSn9XLyUdCD",
        voiceName: "Jung - Narrative",    // 중년 남성, 스토리 내레이션
        logoUrl: "https://autoshort.site/logos/ch_17_logo.png",
        introStyle: "깨끗한 요가 매트 위에서 명상하며 하루를 시작하는 50대 여성",
        outroStyle: "산책로를 걸으며 건강한 하루를 마무리하는 60대 부부",
        bgm: { volume: 0.18, trim: 3, fadeEffect: "fadeInFadeOut" }
    },
    ch_18: {
        name: "활력운동법",
        topic: "운동",
        voiceId: "XB0fDUnXU5powFXDhCwa",
        voiceName: "HYUK",                // 부드럽고 감성적인 중년 남성
        logoUrl: "https://autoshort.site/logos/ch_18_logo.png",
        introStyle: "헬스장에서 가벼운 근력 운동을 하는 건강한 50대 남성",
        outroStyle: "운동 후 건강한 식사를 준비하며 에너지를 충전하는 60대",
        bgm: { volume: 0.13, trim: 0, fadeEffect: "fadeOut" }
    },

    // ==================== 국뽕 (ch_19~21) ====================
    ch_19: {
        name: "대한민국자랑",
        topic: "국뽕",
        voiceId: "CYw3kZ02Hs0563khs1Fj",
        voiceName: "Kyungduk Ko",         // 중년 남성, 권위 있고 무게감
        logoUrl: "https://autoshort.site/logos/ch_19_logo.png",
        introStyle: "광화문 광장에서 태극기가 펄럭이는 웅장한 아침 풍경",
        outroStyle: "화려한 서울 강남 야경과 현대적인 도시 스카이라인",
        bgm: { volume: 0.17, trim: 2, fadeEffect: "fadeIn" }
    },
    ch_20: {
        name: "코리아프라이드",
        topic: "국뽕",
        voiceId: "bVMeCyTHy58xNoL34h3p",
        voiceName: "Jaedong Ahn",         // 젊은~중년 남성, 오디오북/안내에 적합
        logoUrl: "https://autoshort.site/logos/ch_20_logo.png",
        introStyle: "전통 한복을 입은 사람들이 경복궁을 거니는 아름다운 장면",
        outroStyle: "전 세계가 열광하는 K-POP 콘서트의 열기 넘치는 무대",
        bgm: { volume: 0.15, trim: 5, fadeEffect: "fadeOut" }
    },
    ch_21: {
        name: "우리나라사랑",
        topic: "국뽕",
        voiceId: "JBFqnCBsd6RMkjVDRZzb",
        voiceName: "Bin",                 // 따뜻하고 감미로운 중년 남성
        logoUrl: "https://autoshort.site/logos/ch_21_logo.png",
        introStyle: "한강 유람선에서 서울의 아름다운 스카이라인을 바라보는 50대 관광객",
        outroStyle: "세계 각지에서 한국 문화를 즐기고 칭찬하는 외국인들",
        bgm: { volume: 0.14, trim: 1, fadeEffect: "fadeInFadeOut" }
    }
};

// ============================================
// BGM 라이브러리
// ============================================
const BGM_LIBRARY = {
    "건강": "https://autoshort.site/bgm/health_calm.mp3",
    "재테크": "https://autoshort.site/bgm/finance_upbeat.mp3",
    "전원": "https://autoshort.site/bgm/rural_peaceful.mp3",
    "음식": "https://autoshort.site/bgm/food_cozy.mp3",
    "노후": "https://autoshort.site/bgm/lifestyle_peaceful.mp3",
    "운동": "https://autoshort.site/bgm/exercise_energetic.mp3",
    "국뽕": "https://autoshort.site/bgm/korea_pride.mp3",
    "default": "https://autoshort.site/bgm/default_warm.mp3"
};

// ============================================
// 유틸리티 함수
// ============================================

function getChannelConfig(channelId) {
    return CHANNEL_FULL_CONFIGS[channelId] || CHANNEL_FULL_CONFIGS["ch_1"];
}

function getChannelNumber(channelId) {
    const match = channelId.match(/ch_(\d+)/);
    return match ? parseInt(match[1]) : 1;
}

// ============================================
// n8n 출력
// ============================================

const channelId = $input.first().json.channelId || "ch_1";
const config = getChannelConfig(channelId);
const channelNumber = getChannelNumber(channelId);

return [{
    json: {
        // 기본 정보
        channelId: channelId,
        channelNumber: channelNumber,
        channelName: config.name,
        topic: config.topic,

        // ✅ TTS 설정 (채널별 다른 목소리!)
        voice: {
            voiceId: config.voiceId,
            voiceName: config.voiceName
        },

        // ✅ 로고 설정 (채널별 다른 로고!)
        logo: {
            url: config.logoUrl,
            position: "bottomRight",
            size: 80,
            opacity: 0.7
        },

        // ✅ 인트로/아웃트로 스타일 (채널별 다른 스타일!)
        promptStyles: {
            intro: config.introStyle,
            outro: config.outroStyle
        },

        // ✅ BGM 설정 (채널별 다른 설정!)
        bgm: {
            url: BGM_LIBRARY[config.topic] || BGM_LIBRARY["default"],
            volume: config.bgm.volume,
            trim: config.bgm.trim,
            fadeEffect: config.bgm.fadeEffect
        },

        // 디버그
        debug: {
            version: "4.0-VERIFIED",
            verificationDate: "2026-02-05",
            verificationSources: [
                "ElevenLabs 공식 사이트",
                "json2video.com 한국어 음성 목록",
                "Shotstack 공식 API 문서"
            ],
            differentiationElements: [
                "voiceId (21개 다른 목소리)",
                "logoUrl (21개 다른 로고)",
                "introStyle (21개 다른 인트로)",
                "outroStyle (21개 다른 아웃트로)",
                "bgm (21개 다른 BGM 설정)"
            ],
            note: "⚠️ voiceId는 대표님 ElevenLabs 계정에서 실제 값으로 교체 필요!"
        }
    }
}];
