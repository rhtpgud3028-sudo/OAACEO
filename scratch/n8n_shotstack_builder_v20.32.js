// ============================================================
// AIASF n8n Code Node - Shotstack JSON Builder
// v20.32 - Phase 2 Ready (v19.4+v19.5 기반 + 최소 베리에이션)
// ============================================================
// 🔥 v19.4+v19.5 자막 규칙 100% 복원:
// 1. Font: Noto Sans KR, 48px, Bold, lineHeight 1.8
// 2. letterSpacing: 2px (이모지 겹침 방지)
// 3. Background: black, opacity 0.7
// 4. Width: 850px, Height: 동적 (줄당 100px + 50)
// 5. offsetY: -0.25, 줄 수 제한 없음
// ============================================================
// 🔴 베리에이션 원칙: 자막 스타일 변경 금지! BGM만 채널별 차별화!
// ============================================================

// ==================== 채널별 BGM 베리에이션 (21채널) ====================
// ⚠️ 이것만 채널별로 다르게! YouTube 핑거프린트 차별화 핵심!
const CHANNEL_BGM_VARIATIONS = [
    { volume: 0.14, trim: 0, fadeEffect: "fadeOut" },      // ch_1
    { volume: 0.16, trim: 2, fadeEffect: "fadeInOut" },    // ch_2
    { volume: 0.13, trim: 1, fadeEffect: "fadeOut" },      // ch_3
    { volume: 0.17, trim: 3, fadeEffect: "fadeIn" },       // ch_4
    { volume: 0.15, trim: 0, fadeEffect: "fadeInOut" },    // ch_5
    { volume: 0.14, trim: 4, fadeEffect: "fadeOut" },      // ch_6
    { volume: 0.16, trim: 1, fadeEffect: "fadeIn" },       // ch_7
    { volume: 0.13, trim: 2, fadeEffect: "fadeOut" },      // ch_8
    { volume: 0.18, trim: 0, fadeEffect: "fadeInOut" },    // ch_9
    { volume: 0.15, trim: 3, fadeEffect: "fadeOut" },      // ch_10
    { volume: 0.14, trim: 5, fadeEffect: "fadeIn" },       // ch_11
    { volume: 0.17, trim: 1, fadeEffect: "fadeOut" },      // ch_12
    { volume: 0.13, trim: 0, fadeEffect: "fadeInOut" },    // ch_13
    { volume: 0.16, trim: 2, fadeEffect: "fadeOut" },      // ch_14
    { volume: 0.15, trim: 4, fadeEffect: "fadeIn" },       // ch_15
    { volume: 0.14, trim: 1, fadeEffect: "fadeOut" },      // ch_16
    { volume: 0.18, trim: 3, fadeEffect: "fadeInOut" },    // ch_17
    { volume: 0.13, trim: 0, fadeEffect: "fadeOut" },      // ch_18
    { volume: 0.17, trim: 2, fadeEffect: "fadeIn" },       // ch_19
    { volume: 0.15, trim: 5, fadeEffect: "fadeOut" },      // ch_20
    { volume: 0.14, trim: 1, fadeEffect: "fadeInOut" }     // ch_21
];

const BGM_LIBRARY = {
    "건강": "https://autoshort.site/bgm/health_calm.mp3",
    "재테크": "https://autoshort.site/bgm/finance_upbeat.mp3",
    "운동": "https://autoshort.site/bgm/exercise_energetic.mp3",
    "음식": "https://autoshort.site/bgm/food_cozy.mp3",
    "노후": "https://autoshort.site/bgm/lifestyle_peaceful.mp3",
    "국뽕": "https://autoshort.site/bgm/korea_pride.mp3",
    "default": "https://autoshort.site/bgm/default_warm.mp3"
};

// ==================== 타임라인 설정 ====================
const INTRO_LEN = 5;
const OUTRO_LEN = 5;
const TARGET_TOTAL = 50;
const BODY_LEN = TARGET_TOTAL - INTRO_LEN - OUTRO_LEN;
const MIN_SEGMENTS = 6;
const MAX_SEGMENTS = 10;
const TARGET_SEGMENTS = 6;

// ==================== 전환 설정 (5060 친화적 - 단순!) ====================
// ⚠️ fade/zoom만 사용! 복잡한 전환 금지!
const TRANSITION_CONFIG = {
    firstSlide: { in: "zoom" },           // 첫 슬라이드: 줌인 (주목도 UP)
    middleSlide: { in: "fade" },          // 중간 슬라이드: 부드러운 페이드
    lastSlide: { in: "zoom" },            // 마지막 슬라이드: 줌으로 강조
    intro: { in: "zoom" },                // 인트로: 줌인 (후킹)
    outro: { in: "fade" }                 // 아웃트로: 부드럽게 마무리
};

// ==================== 안전한 JSON 파싱 함수 ====================
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
let channelNumber = 1;  // 채널 번호 (1-21)

try {
    const gptContent = $('3. GPT 스크립트').first()?.json?.message?.content || "";
    gptData = safeParseJSON(gptContent, {});

    if (gptData.image_analysis) {
        isReverseMode = true;
    }

    // 채널 번호 추출 (branding_router에서 전달)
    try {
        const brandingData = $('Branding Router').first()?.json || {};
        channelNumber = brandingData.channelNumber || brandingData.channel_number || 1;
    } catch (e) {
        // 폴백: 랜덤 또는 기본값
        channelNumber = Math.floor(Math.random() * 21) + 1;
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

// ==================== 채널별 BGM 설정 적용 ====================
const channelIndex = Math.max(0, Math.min(20, channelNumber - 1));
const chBGM = CHANNEL_BGM_VARIATIONS[channelIndex];

const bgmUrl = BGM_LIBRARY[category] || BGM_LIBRARY["default"];

// ==================== 2) 상수 ====================
const placeholderImage = "https://shotstack-assets.s3.ap-southeast-2.amazonaws.com/footage/beach-overhead.jpg";
const primaryFont = "https://autoshort.site/fonts/static/NotoSansKR-Bold.ttf";

// ==================== 🔴🔴🔴 v19.4+v19.5 자막 절대적 규칙 (변경 금지!) 🔴🔴🔴 ====================
const SUBTITLE_ABSOLUTE_RULES = {
    font: {
        family: "Noto Sans KR",
        size: 48,                     // 🔴 v19.5: 48px!
        color: "#ffffff",
        opacity: 1,
        weight: "700"
    },
    style: {
        lineHeight: 1.8,              // 🔴 v19.5: 1.8!
        letterSpacing: 2              // 🔴 v19.5: 2!
    },
    background: {
        color: "#000000",
        opacity: 0.7                  // 🔴 v19.5: 0.7!
    },
    size: {
        width: 850,                   // 🔴 v19.7: 850px!
        height: 400
    },
    position: {
        offsetX: 0,
        offsetY: -0.25                // 🔴 v19.5: -0.25!
    },
    maxLines: 3
};

// ==================== 3) 영상/이미지 URL ====================
let introVideoUrl = "";
try { introVideoUrl = $('Kling Polling Intro').first()?.json?.data?.output?.video_url || ""; } catch (e) { }

let outroVideoUrl = "";
try { outroVideoUrl = $('Kling Polling Outro').first()?.json?.data?.output?.video_url || ""; } catch (e) { }

let ttsAudioUrl = "";
try {
    const filePath = $('Save Audio').first()?.json?.fileName || "";
    const fileName = filePath.split('/').pop();
    if (fileName) ttsAudioUrl = `https://autoshort.site/audio/${fileName}`;
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

// ==================== 4) 시간 배분 (v19.9 동적 글자수 기반!) ====================
const SUBTITLE_START = INTRO_LEN;
const segmentCount = segments.length || 1;

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

// ==================== 5) 줄바꿈 함수 (v19.4!) ====================
function formatSubtitle(text) {
    if (!text) return "";
    const cleanText = String(text).trim();
    const MAX_CHARS_PER_LINE = 14;  // 🔴 v19.4: 14자!

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

// ==================== 6) 자막 클립 (v19.4+v19.5 스타일!) ====================
const subtitleClips = [];

// 인트로 타이틀
if (introTitle) {
    subtitleClips.push({
        asset: {
            type: "rich-text",
            text: introTitle,
            font: {
                family: "Noto Sans KR",
                size: 72,
                color: "#ffffff",
                opacity: 1,
                weight: "900"
            },
            style: {
                lineHeight: 1.3
            },
            background: {
                color: "#000000",
                opacity: 0.6
            },
            align: { horizontal: "center", vertical: "middle" }
        },
        start: 0,
        length: INTRO_LEN,
        position: "center",
        width: 900,
        height: 150,
        offset: {
            x: 0,
            y: 0.15
        }
    });
}

// 본문 자막 클립
for (let i = 0; i < segments.length; i++) {
    const rawText = String(segments[i]?.text || "").trim();
    if (!rawText) continue;

    const formattedText = formatSubtitle(rawText);
    const lineCount = (formattedText.match(/\n/g) || []).length + 1;

    // 🔴 v19.4: 동적 높이! (줄당 100px + 50)
    const dynamicHeight = Math.max(200, lineCount * 100 + 50);

    subtitleClips.push({
        asset: {
            type: "rich-text",
            text: formattedText,
            font: SUBTITLE_ABSOLUTE_RULES.font,           // 🔴 변경 금지!
            style: SUBTITLE_ABSOLUTE_RULES.style,         // 🔴 변경 금지!
            background: SUBTITLE_ABSOLUTE_RULES.background, // 🔴 변경 금지!
            align: { horizontal: "center", vertical: "middle" }
        },
        start: segmentStartTimes[i] || (SUBTITLE_START + i * perSegmentTime),
        length: segmentTimes[i] || perSegmentTime,
        position: "center",
        width: SUBTITLE_ABSOLUTE_RULES.size.width,        // 🔴 850px!
        height: dynamicHeight,                            // 🔴 동적 높이!
        offset: {
            x: SUBTITLE_ABSOLUTE_RULES.position.offsetX,
            y: SUBTITLE_ABSOLUTE_RULES.position.offsetY   // 🔴 -0.25!
        }
    });
}

// ==================== 7) 비주얼 클립 (5060 친화적!) ====================
const visualClips = [];

function getTransition(index, total, type = 'slide') {
    if (type === 'intro') return TRANSITION_CONFIG.intro;
    if (type === 'outro') return TRANSITION_CONFIG.outro;
    if (index === 0) return TRANSITION_CONFIG.firstSlide;
    if (index === total - 1) return TRANSITION_CONFIG.lastSlide;
    return TRANSITION_CONFIG.middleSlide;
}

// 인트로
if (introVideoUrl) {
    visualClips.push({
        asset: { type: "video", src: introVideoUrl, volume: 0 },
        start: 0,
        length: INTRO_LEN,
        fit: "cover",
        transition: TRANSITION_CONFIG.intro
    });
} else {
    const introImage = isReverseMode && thumbnailImage ? thumbnailImage : (images[0] || placeholderImage);
    visualClips.push({
        asset: { type: "image", src: introImage },
        start: 0,
        length: INTRO_LEN,
        fit: "cover",
        transition: TRANSITION_CONFIG.intro
    });
}

// 본문 슬라이드
for (let i = 0; i < segments.length; i++) {
    const src = images[i] || images[images.length - 1] || placeholderImage;
    const trans = getTransition(i, segments.length, 'slide');

    visualClips.push({
        asset: { type: "image", src },
        start: INTRO_LEN + (i * perSegmentTime),
        length: perSegmentTime,
        fit: "cover",
        transition: trans
    });
}

// 아웃트로
const outroStart = INTRO_LEN + (segments.length * perSegmentTime);
if (outroVideoUrl) {
    visualClips.push({
        asset: { type: "video", src: outroVideoUrl, volume: 0 },
        start: outroStart,
        length: OUTRO_LEN,
        fit: "cover",
        transition: TRANSITION_CONFIG.outro
    });
} else {
    visualClips.push({
        asset: { type: "image", src: images[images.length - 1] || placeholderImage },
        start: outroStart,
        length: OUTRO_LEN,
        fit: "cover",
        transition: TRANSITION_CONFIG.outro
    });
}

// ==================== 8) 오디오 클립 ====================
const TTS_OFFSET = 4;
const audioClips = [];
if (ttsAudioUrl) {
    audioClips.push({
        asset: { type: "audio", src: ttsAudioUrl },
        start: INTRO_LEN - TTS_OFFSET,
        length: BODY_LEN + TTS_OFFSET
    });
}

// ==================== 9) Shotstack JSON ====================
const shotstackBody = {
    timeline: {
        soundtrack: {
            src: bgmUrl,
            effect: chBGM.fadeEffect,     // ✅ 채널별 페이드 효과!
            volume: chBGM.volume,         // ✅ 채널별 볼륨!
            trim: chBGM.trim              // ✅ 채널별 시작점!
        },
        background: "#000000",
        fonts: [{ src: primaryFont }],
        tracks: [
            { clips: subtitleClips },
            { clips: visualClips },
            ...(audioClips.length ? [{ clips: audioClips }] : [])
        ]
    },
    output: { format: "mp4", resolution: "hd", aspectRatio: "9:16", fps: 30 }
};

// ==================== 10) 출력 ====================
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
        debug: {
            version: "20.32-PHASE2-READY",
            channelNumber,
            hookType,
            isReverseMode,
            hasThumbnail: !!thumbnailImage,
            segmentCount: segments.length,
            imagesFound: images.length,
            hasIntroVideo: !!introVideoUrl,
            hasOutroVideo: !!outroVideoUrl,
            // 🔴 v19.4+v19.5 규칙 확인!
            absoluteRules: {
                fontSizePx: SUBTITLE_ABSOLUTE_RULES.font.size,
                width: SUBTITLE_ABSOLUTE_RULES.size.width,
                offsetY: SUBTITLE_ABSOLUTE_RULES.position.offsetY,
                note: "🔴 v19.4+v19.5 기반! 자막 스타일 변경 금지!"
            },
            // ✅ 채널별 베리에이션 (BGM만!)
            channelVariation: {
                bgm: chBGM,
                note: "✅ BGM 설정만 채널별 차별화!"
            },
            transitionConfig: TRANSITION_CONFIG,
            parseErrors
        }
    }
}];
