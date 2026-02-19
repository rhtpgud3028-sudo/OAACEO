/**
 * AIASF Phase 2 - 21채널 브랜딩 마스터 설정
 * 버전: 3.1.0 (미사용 항목 정리)
 * 작성일: 2026-01-23
 * 
 * 🔥 v3.1 업그레이드:
 * - 미사용 항목 8개 삭제 (보안 및 심플화)
 * - 삭제: secondaryColor, accentColor, subtitleBg, subtitleText, 
 *         fontFamily, fontSize, lineHeight, ctaStyle
 * - 유지: primaryColor, logoOverlay, channels, voiceId, voiceName, 
 *         celebrity, persona, ctas
 * 
 * 사용법: n8n Code 노드에 복사-붙여넣기
 */

// ============================================
// 브랜딩 설정 (7개 주제 × 3채널) - 심플화!
// ============================================

const BRANDING_CONFIG = {
    // 1. 저속노화 & 혈당 (ch_1~3)
    // 🌟 페르소나: 홍혜걸 (비온뒤, 200만 구독자)
    "health": {
        primaryColor: "#228B22",
        logoOverlay: "health_logo.png",
        channels: ["ch_1", "ch_2", "ch_3"],
        voiceId: "w5eZjob1kXfLB9HjpFqU",
        voiceName: "ChulSu",
        celebrity: "홍혜걸 (비온뒤, 200만 구독자)",
        persona: "홍혜걸 스타일",
        ctas: [
            "고정 댓글에서 혈당 관리 비법 바로 확인하세요",
            "더 자세한 식단 정보, 고정 댓글에 정리해뒀어요",
            "효과 본 분들 후기, 고정 댓글에서 확인하세요"
        ]
    },

    // 2. 은퇴자산 & 상속 (ch_4~6)
    // 🌟 페르소나: 김미경 (184만 구독자)
    // 🔊 보이스: Man Bo (활기차고 재미있는 중년 남성)
    "finance": {
        primaryColor: "#000080",
        logoOverlay: "finance_logo.png",
        channels: ["ch_4", "ch_5", "ch_6"],
        voiceId: "ZZ4xhVcc83kZBfNIlIIz",
        voiceName: "Man Bo",
        celebrity: "김미경 (김미경TV, 184만 구독자)",
        persona: "김미경 스타일",
        ctas: [
            "무료 상담 신청, 고정 댓글 링크 클릭하세요",
            "절세 가이드 PDF, 고정 댓글에서 무료 다운",
            "맞춤 설계 받아보세요, 고정 댓글 확인"
        ]
    },

    // 3. 전원주택 & 토지 (ch_7~9)
    // 🌟 페르소나: 나는 자연인이다 (MBN, 5060 남성 시청률 1위)
    "rural": {
        primaryColor: "#8B4513",
        logoOverlay: "rural_logo.png",
        channels: ["ch_7", "ch_8", "ch_9"],
        voiceId: "H8ObVvroE5JXeeUSJakg",
        voiceName: "Wonmoon",
        celebrity: "나는 자연인이다 (MBN, 5060 남성 시청률 1위)",
        persona: "나는 자연인이다 스타일",
        ctas: [
            "전원주택 매물 정보, 고정 댓글에 정리했어요",
            "귀촌 체크리스트, 고정 댓글에서 다운받으세요",
            "추천 지역 리스트, 고정 댓글 확인하세요"
        ]
    },

    // 4. 인간관계 & 지혜 (ch_10~12)
    // 🌟 페르소나: 오은영 박사 (금쪽같은 내새끼, TV 인지도 100%)
    "wisdom": {
        primaryColor: "#8B7355",
        logoOverlay: "wisdom_logo.png",
        channels: ["ch_10", "ch_11", "ch_12"],
        voiceId: "DMkRitQrfpiddSQT5adl",
        voiceName: "Jjeong",
        celebrity: "오은영 박사 (금쪽같은 내새끼, TV 인지도 100%)",
        persona: "오은영 박사 스타일",
        ctas: [
            "마음에 닿는 글귀 모음, 고정 댓글에서 무료 배포",
            "더 많은 이야기, 고정 댓글 링크에서 만나요",
            "공감되셨다면 주변 분께 공유해주세요"
        ]
    },

    // 5. 디지털부업 (ch_13~15)
    // 🌟 페르소나: 신사임당 (100만+ 구독, 경제 유튜버)
    "sidejob": {
        primaryColor: "#FF8C00",
        logoOverlay: "sidejob_logo.png",
        channels: ["ch_13", "ch_14", "ch_15"],
        voiceId: "xi3rF0t7dg7uN2M0WUhr",
        voiceName: "Yuna",
        celebrity: "신사임당 (100만+ 구독, 경제 유튜버)",
        persona: "신사임당 스타일",
        ctas: [
            "시작 가이드북, 고정 댓글에서 무료 다운로드",
            "실제 수익 인증, 고정 댓글에서 확인하세요",
            "초보 맞춤 강의, 고정 댓글 링크 클릭"
        ]
    },

    // 6. 뷰티 & 자세교정 (ch_16~18)
    // 🌟 페르소나: 정샘물 (겟잇뷰티, TV 인지도 100%)
    "beauty": {
        primaryColor: "#FF69B4",
        logoOverlay: "beauty_logo.png",
        channels: ["ch_16", "ch_17", "ch_18"],
        voiceId: "sSoVF9lUgTGJz0Xz3J9y",
        voiceName: "Jina",
        celebrity: "정샘물 (겟잇뷰티, TV 인지도 100%)",
        persona: "정샘물 스타일",
        ctas: [
            "저도 쓰는 제품, 고정 댓글에서 특가 안내",
            "따라하기 쉬운 루틴, 고정 댓글 확인",
            "10분 교정 운동, 고정 댓글에서 PDF 다운"
        ]
    },

    // 7. 스마트폰/AI (ch_19~21)
    // 🌟 페르소나: 잇섭 (IT 유튜버, 250만+ 구독자)
    "tech": {
        primaryColor: "#007FFF",
        logoOverlay: "tech_logo.png",
        channels: ["ch_19", "ch_20", "ch_21"],
        voiceId: "Ir7oQcBXWiq4oFGROCfj",
        voiceName: "Taemin",
        celebrity: "잇섭 (IT 유튜버, 250만+ 구독자)",
        persona: "잇섭 스타일",
        ctas: [
            "이 영상 저장해두시면 필요할 때 도움됩니다",
            "알림 설정하시면 꿀팁 놓치지 않아요",
            "도움됐다면 좋아요 한 번만 부탁드려요"
        ]
    }
};

// ============================================
// 오디오 설정 (BGM 볼륨 최적화)
// ============================================

const AUDIO_CONFIG = {
    ttsVolume: 1.0,       // TTS 정상 볼륨
    bgmVolume: 0.15,      // BGM 15% (나레이션 우선)
    hookVolume: 0.8,      // 후킹 TTS 80%
    fadeInMs: 500,        // 페이드인 0.5초
    fadeOutMs: 1000       // 페이드아웃 1초
};

// ============================================
// 유틸리티 함수
// ============================================

function getBrandingByChannel(channelId) {
    for (const [key, config] of Object.entries(BRANDING_CONFIG)) {
        if (config.channels.includes(channelId)) {
            const channelIndex = config.channels.indexOf(channelId);
            return {
                topic: key,
                channelIndex: channelIndex,
                cta: config.ctas[channelIndex] || config.ctas[0],
                ...config
            };
        }
    }
    // 기본값: 건강 주제
    return {
        topic: "health",
        channelIndex: 0,
        cta: BRANDING_CONFIG.health.ctas[0],
        ...BRANDING_CONFIG.health
    };
}

function getVoiceId(channelId) {
    const branding = getBrandingByChannel(channelId);
    return branding.voiceId;
}

function getCTA(channelId) {
    const branding = getBrandingByChannel(channelId);
    return branding.cta;
}

// ============================================
// n8n 출력 - 심플화!
// ============================================

const channelId = $input.first().json.channelId || "ch_1";
const branding = getBrandingByChannel(channelId);

return [{
    json: {
        channelId: channelId,
        topic: branding.topic,
        branding: {
            primaryColor: branding.primaryColor,
            logoOverlay: branding.logoOverlay
        },
        voice: {
            voiceId: branding.voiceId,
            voiceName: branding.voiceName
        },
        cta: branding.cta,
        persona: branding.persona,
        celebrity: branding.celebrity,
        audio: AUDIO_CONFIG
    }
}];
