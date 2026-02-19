// ============================================================
// AIASF n8n Code Node - Shotstack JSON Builder
// v20.34 (2026-02-09) - TTS URL 수정: Save Audio(.mpga) → Convert Audio(.mp3)
// ============================================================
// 🔴 v19.4+v19.5 자막 규칙 100% 복원 (변경 절대 금지!)
// ✅ 채널 차별화: TTS voiceId, BGM, 로고, 인트로/아웃트로만!
// ✅ 5060세대 친화적 범위 유지
// ============================================================
// 📋 검증 완료:
// - Shotstack 로고 오버레이: 공식 문서 확인 ✅
// - ElevenLabs 한국어 음성 21개+: 공식 사이트 확인 ✅
// - YouTube 핑거프린트: 오디오+비디오 모두 분석 ✅
// ============================================================

// ==================== 타임라인 설정 ====================
const INTRO_LEN = 5;
const OUTRO_LEN = 5;
const TARGET_TOTAL = 50;
const BODY_LEN = TARGET_TOTAL - INTRO_LEN - OUTRO_LEN;
const MIN_SEGMENTS = 6;
const MAX_SEGMENTS = 10;
const TARGET_SEGMENTS = 6;

// ==================== 전환 설정 (5060 친화적 - 단순!) ====================
const TRANSITION_CONFIG = {
    intro: { in: "zoom" },
    slide: { in: "fade" },   // 모든 슬라이드 동일! (일관성)
    outro: { in: "fade" }
};

// ==================== 🔴🔴🔴 v19.4+v19.5 자막 절대 규칙 (변경 금지!) 🔴🔴🔴 ====================
// 출처: n8n_shotstack_builder.js (v19.5 최종본) L145-171, L313
const SUBTITLE_ABSOLUTE_RULES = {
    font: {
        family: "Noto Sans KR",
        size: 48,                     // 🔴 v19.5! (60→48)
        color: "#ffffff",
        opacity: 1,
        weight: "700"                 // Bold
    },
    style: {
        lineHeight: 1.8,              // 🔴 v19.5! (고정!)
        letterSpacing: 2              // 🔴 v19.5! (이모지 겹침 방지!)
    },
    background: {
        color: "#000000",
        opacity: 0.7                  // 🔴 v19.5! (고정!)
    },
    size: {
        width: 850,                   // 🔴 v19.7! (1000→850)
        height: 400                   // 기본값 (동적으로 계산됨)
    },
    position: {
        offsetX: 0,
        offsetY: -0.25                // 🔴 v19.5!
    }
};

// ==================== BGM 라이브러리 ====================
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

// ==================== 안전한 JSON 파싱 ====================
function safeParseJSON(str, fallback = {}) {
    if (!str || typeof str !== 'string') return fallback;
    try {
        let cleaned = str.trim();
        if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
        if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
        if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
        return JSON.parse(cleaned.trim());
    } catch (e) {
        return fallback;
    }
}

// ==================== 1) GPT 데이터 파싱 ====================
let gptData = {};
let segments = [];
let videoTitle = "AI 숏츠";
let category = "default";
let hookType = "";
let introVideoPrompt = "";
let outroVideoPrompt = "";
let introTitle = "";
let tags = [];
let parseErrors = [];
let isReverseMode = false;

try {
    const gptContent = $('3. GPT 스크립트').first()?.json?.message?.content || "";
    gptData = safeParseJSON(gptContent, {});

    if (gptData.image_analysis) {
        isReverseMode = true;
    }

    if (gptData.script) {
        const sentences = gptData.script.split(/(?<=[.!?])\s*/).filter(s => s.trim().length > 5);
        const imagePrompts = gptData.image_prompts || [];

        segments = sentences.map((text, i) => ({
            text: text.trim(),
            image_prompt: imagePrompts[i] || ""
        }));

        videoTitle = gptData.title || "AI 숏츠";
        category = gptData.category || "default";
        hookType = gptData.hook_type || "";
        introVideoPrompt = gptData.intro_video_prompt || gptData.intro_prompt || "";
        outroVideoPrompt = gptData.outro_video_prompt || gptData.outro_prompt || "";
        introTitle = gptData.intro_title || "";
        tags = gptData.tags || [category, "shorts", "5060", "시니어", "건강정보"];
    } else if (gptData.segments && Array.isArray(gptData.segments)) {
        segments = gptData.segments;
        videoTitle = gptData.youtube_title || gptData.title || "AI 숏츠";
        category = gptData.category || "default";
        hookType = gptData.hook_type || "";
        introVideoPrompt = gptData.intro_video_prompt || gptData.intro_prompt || "";
        outroVideoPrompt = gptData.outro_video_prompt || gptData.outro_prompt || "";
    }
} catch (e) {
    parseErrors.push("Primary parse failed: " + e.message);
}

// 폴백 처리
if (segments.length === 0) {
    try {
        const gptContent = $('3. GPT 스크립트').first()?.json?.message?.content || "";
        const parsed = safeParseJSON(gptContent, {});
        const fullScript = parsed.script_full || parsed.script || "";

        if (fullScript) {
            const sentences = fullScript.split(/(?<=[.!?])\s*/).filter(s => s.trim().length > 5);
            segments = sentences.slice(0, TARGET_SEGMENTS).map(text => ({
                text: text.trim(),
                image_prompt: ""
            }));
            videoTitle = parsed.youtube_title || "AI 숏츠";
            category = parsed.category || "default";
        }
    } catch (e) { }
}

if (segments.length === 0) {
    segments = [{ text: "콘텐츠를 로드할 수 없습니다.", image_prompt: "" }];
}
if (segments.length > MAX_SEGMENTS) segments = segments.slice(0, MAX_SEGMENTS);

// ==================== 2) 채널별 설정 가져오기 (Branding Router) ====================
let channelNumber = 1;
let channelConfig = {};

try {
    const brandingData = $('Branding Router').first()?.json || {};
    channelNumber = brandingData.channelNumber || 1;
    channelConfig = {
        voiceId: brandingData.voice?.voiceId || "Taemin",
        voiceName: brandingData.voice?.voiceName || "Taemin",
        logoUrl: brandingData.logo?.url || "",
        logoOpacity: brandingData.logo?.opacity || 0.7,
        bgmUrl: brandingData.bgm?.url || BGM_LIBRARY[category] || BGM_LIBRARY["default"],
        bgmVolume: brandingData.bgm?.volume || 0.15,
        bgmTrim: brandingData.bgm?.trim || 0,
        bgmFadeEffect: brandingData.bgm?.fadeEffect || "fadeOut",
        introStyle: brandingData.promptStyles?.intro || "",
        outroStyle: brandingData.promptStyles?.outro || ""
    };
} catch (e) {
    // 기본값 사용
    channelConfig = {
        voiceId: "Taemin",
        voiceName: "Taemin",
        logoUrl: "",
        logoOpacity: 0.7,
        bgmUrl: BGM_LIBRARY[category] || BGM_LIBRARY["default"],
        bgmVolume: 0.15,
        bgmTrim: 0,
        bgmFadeEffect: "fadeOut",
        introStyle: "",
        outroStyle: ""
    };
}

// ==================== 3) 상수 ====================
const placeholderImage = "https://shotstack-assets.s3.ap-southeast-2.amazonaws.com/footage/beach-overhead.jpg";
const primaryFont = "https://autoshort.site/fonts/static/NotoSansKR-Bold.ttf";

// ==================== 4) 영상/이미지 URL ====================
let introVideoUrl = "";
try { introVideoUrl = $('Kling Polling Intro').first()?.json?.data?.output?.video_url || ""; } catch (e) { }

let outroVideoUrl = "";
try { outroVideoUrl = $('Kling Polling Outro').first()?.json?.data?.output?.video_url || ""; } catch (e) { }

let ttsAudioUrl = "";
try {
    // 🔴 v20.34: 3단계 폴백 + .mpga 절대 차단!

    // 1순위: Convert Audio (최종 .mp3)
    try { ttsAudioUrl = $('Convert Audio').first()?.json?.url || ""; } catch (e1) { }

    // 2순위: Boost Body Audio
    if (!ttsAudioUrl) {
        try { ttsAudioUrl = $('Boost Body Audio').first()?.json?.url || ""; } catch (e2) { }
    }

    // 3순위: CP 저장 - TTS (checkpoint에 저장된 URL)
    if (!ttsAudioUrl) {
        try { ttsAudioUrl = $('CP 저장 - TTS').first()?.json?.audio_url || ""; } catch (e3) { }
    }

    // 4순위: Save Audio 파일명에서 boosted_.mp3 패턴 생성
    if (!ttsAudioUrl) {
        try {
            const filePath = $('Save Audio').first()?.json?.fileName || "";
            const fileName = filePath.split('/').pop();
            if (fileName) {
                const baseName = fileName.replace(/\.[^.]+$/, '');
                ttsAudioUrl = `https://autoshort.site/audio/boosted_${baseName}.mp3`;
            }
        } catch (e4) { }
    }

    // 🔴🔴🔴 최종 안전장치: .mpga URL은 Shotstack이 거부! 강제로 .mp3로 변환!
    if (ttsAudioUrl && ttsAudioUrl.includes('.mpga')) {
        ttsAudioUrl = ttsAudioUrl.replace('.mpga', '.mp3');
    }
} catch (e) { }

let images = [];
try {
    const mergeData = $('Merge Images').first();
    const imageArray = mergeData?.json?.images || [];
    images = imageArray.map(item => {
        if (typeof item === 'string') return item;
        return item?.url || item?.src || "";
    }).filter(Boolean);
} catch (e) { }

let thumbnailImage = "";
try {
    thumbnailImage = $('DALL-E Thumbnail').first()?.json?.data?.[0]?.url || "";
} catch (e) { }

// ==================== 5) 시간 배분 (v19.9 동적 글자수 기반!) ====================
const SUBTITLE_START = INTRO_LEN;
const segmentCount = segments.length || 1;

// v19.9: 글자 수 기반 동적 시간 배분
const totalChars = segments.reduce((sum, s) => sum + (s.text?.length || 0), 0);
const segmentTimes = segments.map((s, i) => {
    const charCount = s.text?.length || 10;
    const ratio = charCount / totalChars;
    return Math.max(3, ratio * BODY_LEN);
});

const segmentStartTimes = [];
let accumulatedTime = SUBTITLE_START;
for (let i = 0; i < segmentTimes.length; i++) {
    segmentStartTimes.push(accumulatedTime);
    accumulatedTime += segmentTimes[i];
}

const perSegmentTime = BODY_LEN / segmentCount;

// ==================== 6) 줄바꿈 함수 (v19.4!) ====================
function formatSubtitle(text) {
    if (!text) return "";
    const cleanText = String(text).trim();
    const MAX_CHARS_PER_LINE = 14;

    const lines = [];
    let remaining = cleanText;

    while (remaining.length > 0) {
        if (remaining.length <= MAX_CHARS_PER_LINE) {
            lines.push(remaining);
            remaining = '';
        } else {
            let cutPoint = MAX_CHARS_PER_LINE;
            const searchRange = remaining.substring(0, cutPoint + 5);
            const lastSpace = searchRange.lastIndexOf(' ');

            if (lastSpace >= cutPoint - 6 && lastSpace > 0) {
                cutPoint = lastSpace;
            }

            lines.push(remaining.substring(0, cutPoint).trim());
            remaining = remaining.substring(cutPoint).trim();
        }
    }

    return lines.join('\n');
}

// ==================== 7) 자막 클립 (v19.5 규칙 적용!) ====================
const subtitleClips = [];

// 인트로 타이틀
if (introTitle) {
    subtitleClips.push({
        asset: {
            type: "rich-text",
            text: introTitle,
            font: { family: "Noto Sans KR", size: 72, color: "#ffffff", opacity: 1, weight: "900" },
            style: { lineHeight: 1.3 },
            background: { color: "#000000", opacity: 0.6 },
            align: { horizontal: "center", vertical: "middle" }
        },
        start: 0,
        length: INTRO_LEN,
        position: "center",
        width: 900,
        height: 150,
        offset: { x: 0, y: 0.15 }
    });
}

// 본문 자막
for (let i = 0; i < segments.length; i++) {
    const rawText = String(segments[i]?.text || "").trim();
    if (!rawText) continue;

    const formattedText = formatSubtitle(rawText);
    const lineCount = (formattedText.match(/\n/g) || []).length + 1;

    // 🔴 v19.4: 동적 높이 계산 (줄당 100px + 여유 50px)
    const dynamicHeight = Math.max(200, lineCount * 100 + 50);

    subtitleClips.push({
        asset: {
            type: "rich-text",
            text: formattedText,
            font: SUBTITLE_ABSOLUTE_RULES.font,           // 🔴 v19.5!
            style: SUBTITLE_ABSOLUTE_RULES.style,         // 🔴 v19.5!
            background: SUBTITLE_ABSOLUTE_RULES.background, // 🔴 v19.5!
            align: { horizontal: "center", vertical: "middle" }
        },
        start: segmentStartTimes[i] || (SUBTITLE_START + i * perSegmentTime),
        length: segmentTimes[i] || perSegmentTime,
        position: "center",
        width: SUBTITLE_ABSOLUTE_RULES.size.width,        // 🔴 850px!
        height: dynamicHeight,                            // 🔴 동적!
        offset: {
            x: SUBTITLE_ABSOLUTE_RULES.position.offsetX,
            y: SUBTITLE_ABSOLUTE_RULES.position.offsetY   // 🔴 -0.25!
        }
    });
}

// ==================== 8) 비주얼 클립 ====================
const visualClips = [];

// 인트로
if (introVideoUrl) {
    visualClips.push({
        asset: { type: "video", src: introVideoUrl, volume: 0 },
        start: 0, length: INTRO_LEN, fit: "cover",
        transition: TRANSITION_CONFIG.intro
    });
} else {
    const introImage = isReverseMode && thumbnailImage ? thumbnailImage : (images[0] || placeholderImage);
    visualClips.push({
        asset: { type: "image", src: introImage },
        start: 0, length: INTRO_LEN, fit: "cover",
        transition: TRANSITION_CONFIG.intro
    });
}

// 본문 슬라이드
for (let i = 0; i < segments.length; i++) {
    const src = images[i] || images[images.length - 1] || placeholderImage;

    visualClips.push({
        asset: { type: "image", src },
        start: INTRO_LEN + (i * perSegmentTime),
        length: perSegmentTime,
        fit: "cover",
        transition: TRANSITION_CONFIG.slide  // 모든 슬라이드 동일 (5060 친화)
    });
}

// 아웃트로
const outroStart = INTRO_LEN + (segments.length * perSegmentTime);
if (outroVideoUrl) {
    visualClips.push({
        asset: { type: "video", src: outroVideoUrl, volume: 0 },
        start: outroStart, length: OUTRO_LEN, fit: "cover",
        transition: TRANSITION_CONFIG.outro
    });
} else {
    visualClips.push({
        asset: { type: "image", src: images[images.length - 1] || placeholderImage },
        start: outroStart, length: OUTRO_LEN, fit: "cover",
        transition: TRANSITION_CONFIG.outro
    });
}

// ==================== 9) 로고/워터마크 클립 (채널별!) ====================
// 출처: Shotstack 공식 문서 - position, offset, scale, fit: none 지원 확인됨
const logoClips = [];
// 🔴 v20.34: 로고 파일 미생성 → 스킵 (404 시 Shotstack 렌더 실패!)
// TODO: 로고 파일 생성 후 활성화
// if (channelConfig.logoUrl) {
//     logoClips.push({
//         asset: { type: "image", src: channelConfig.logoUrl },
//         start: 0,
//         length: TARGET_TOTAL,
//         fit: "none",
//         scale: 0.08,
//         position: "bottomRight",
//         offset: { x: -0.03, y: 0.05 },
//         opacity: channelConfig.logoOpacity
//     });
// }

// ==================== 10) 오디오 클립 ====================
const TTS_OFFSET = 4;
const audioClips = [];
if (ttsAudioUrl) {
    audioClips.push({
        asset: { type: "audio", src: ttsAudioUrl },
        start: INTRO_LEN - TTS_OFFSET,
        length: BODY_LEN + TTS_OFFSET
    });
}

// ==================== 11) Shotstack JSON 생성 ====================
// 🔴 fadeEffect 안전 변환 (Shotstack API는 fadeIn, fadeOut, fadeInFadeOut만 허용!)
const VALID_FADE_EFFECTS = ["fadeIn", "fadeOut", "fadeInFadeOut"];
let safeFadeEffect = channelConfig.bgmFadeEffect || "fadeOut";
if (!VALID_FADE_EFFECTS.includes(safeFadeEffect)) {
    // fadeInOut → fadeInFadeOut 자동 변환
    safeFadeEffect = safeFadeEffect === "fadeInOut" ? "fadeInFadeOut" : "fadeOut";
}

const shotstackBody = {
    timeline: {
        soundtrack: {
            src: channelConfig.bgmUrl,
            effect: safeFadeEffect,  // ✅ 안전하게 변환됨!
            volume: channelConfig.bgmVolume,
            trim: channelConfig.bgmTrim
        },
        background: "#000000",
        fonts: [{ src: primaryFont }],
        tracks: [
            ...(logoClips.length ? [{ clips: logoClips }] : []),  // ✅ 채널별 로고 (최상위)
            { clips: subtitleClips },
            { clips: visualClips },
            ...(audioClips.length ? [{ clips: audioClips }] : [])
        ]
    },
    output: { format: "mp4", resolution: "hd", aspectRatio: "9:16", fps: 30 }
};

// ==================== 12) 출력 ====================
return [{
    json: {
        bodyString: JSON.stringify(shotstackBody),
        videoTitle,
        category,
        introTitle,
        tags,
        script: gptData.script || "",
        intro_prompt: introVideoPrompt,
        outro_prompt: outroVideoPrompt,
        image_prompts: segments.map(s => s.image_prompt || ""),
        thumbnailImage: thumbnailImage || (images[0] || ""),
        // 채널 정보 출력
        channelNumber,
        channelConfig: {
            voiceId: channelConfig.voiceId,
            voiceName: channelConfig.voiceName,
            hasLogo: !!channelConfig.logoUrl
        },
        debug: {
            version: "20.34",
            verificationDate: "2026-02-09",
            // 🔴 자막 규칙 확인
            subtitleRules: {
                fontSize: SUBTITLE_ABSOLUTE_RULES.font.size,        // 48px
                width: SUBTITLE_ABSOLUTE_RULES.size.width,          // 850px
                lineHeight: SUBTITLE_ABSOLUTE_RULES.style.lineHeight, // 1.8
                letterSpacing: SUBTITLE_ABSOLUTE_RULES.style.letterSpacing, // 2
                offsetY: SUBTITLE_ABSOLUTE_RULES.position.offsetY,  // -0.25
                bgOpacity: SUBTITLE_ABSOLUTE_RULES.background.opacity, // 0.7
                note: "🔴 v19.4+v19.5 기반! 변경 절대 금지!"
            },
            // ✅ 채널별 차별화 요소
            channelDifferentiation: {
                voiceId: channelConfig.voiceId,
                bgm: {
                    volume: channelConfig.bgmVolume,
                    trim: channelConfig.bgmTrim,
                    fadeEffect: channelConfig.bgmFadeEffect
                },
                logo: channelConfig.logoUrl ? "적용됨" : "미적용",
                introStyle: channelConfig.introStyle ? "적용됨" : "미적용",
                note: "✅ TTS + BGM + 로고 + 인트로/아웃트로만 차별화!"
            },
            // 기타

            hookType,
            isReverseMode,
            hasThumbnail: !!thumbnailImage,
            segmentCount: segments.length,
            imagesFound: images.length,
            hasIntroVideo: !!introVideoUrl,
            hasOutroVideo: !!outroVideoUrl,
            transitionConfig: TRANSITION_CONFIG,
            parseErrors
        }
    }
}];
