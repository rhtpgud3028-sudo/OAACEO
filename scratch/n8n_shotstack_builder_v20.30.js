// ============================================================
// AIASF n8n Code Node - Shotstack JSON Builder
// v20.30 (21채널 베리에이션 적용!)
// ============================================================
// 🔴 절대적 룰 (건드리지 않음!):
// 1. 동적 싱크: 이미지슬라이드 & 자막 & TTS 완벽 동기화
// 2. 자막 잘림 방지: Width 1000px, Offset Y -0.23
// 
// ✅ 채널별 베리에이션:
// 1. 전환효과 - 21개 고유 조합
// 2. 자막 스타일 미세 조정 (lineHeight, letterSpacing, opacity)
// 3. BGM 볼륨/트림 베리에이션
// 4. 슬라이드 오버랩 베리에이션
// ============================================================

// ==================== 채널별 전환효과 배열 ====================
const CHANNEL_TRANSITIONS = [
    // ch_1 ~ ch_3 (Health)
    { in: "fade", out: "fade" },
    { in: "slideLeft", out: "slideRight" },
    { in: "slideUp", out: "slideDown" },
    // ch_4 ~ ch_6 (Finance)
    { in: "carouselLeft", out: "carouselRight" },
    { in: "carouselUp", out: "carouselDown" },
    { in: "wipeLeft", out: "wipeRight" },
    // ch_7 ~ ch_9 (Rural)
    { in: "reveal", out: "fade" },
    { in: "zoom", out: "fade" },
    { in: "slideRight", out: "slideLeft" },
    // ch_10 ~ ch_12 (Wisdom)
    { in: "fade", out: "slideDown" },
    { in: "carouselRight", out: "carouselLeft" },
    { in: "wipeRight", out: "wipeLeft" },
    // ch_13 ~ ch_15 (Sidejob)
    { in: "shuffleTopRight", out: "shuffleBottomLeft" },
    { in: "shuffleRightTop", out: "shuffleLeftBottom" },
    { in: "shuffleBottomRight", out: "shuffleTopLeft" },
    // ch_16 ~ ch_18 (Beauty)
    { in: "slideDown", out: "slideUp" },
    { in: "carouselDown", out: "carouselUp" },
    { in: "fade", out: "zoom" },
    // ch_19 ~ ch_21 (Tech)
    { in: "reveal", out: "wipeLeft" },
    { in: "zoom", out: "slideRight" },
    { in: "shuffleLeftTop", out: "shuffleRightBottom" }
];

// ==================== 채널별 스타일 베리에이션 ====================
const CHANNEL_STYLE_VARIATIONS = [
    // ch_1 ~ ch_3 (Health)
    { lineHeight: 1.75, letterSpacing: 2, bgOpacity: 0.70, overlap: 0.4 },
    { lineHeight: 1.80, letterSpacing: 2, bgOpacity: 0.68, overlap: 0.5 },
    { lineHeight: 1.85, letterSpacing: 2, bgOpacity: 0.72, overlap: 0.6 },
    // ch_4 ~ ch_6 (Finance)
    { lineHeight: 1.70, letterSpacing: 3, bgOpacity: 0.72, overlap: 0.3 },
    { lineHeight: 1.78, letterSpacing: 2, bgOpacity: 0.70, overlap: 0.5 },
    { lineHeight: 1.82, letterSpacing: 1, bgOpacity: 0.68, overlap: 0.7 },
    // ch_7 ~ ch_9 (Rural)
    { lineHeight: 1.90, letterSpacing: 2, bgOpacity: 0.65, overlap: 0.4 },
    { lineHeight: 1.85, letterSpacing: 3, bgOpacity: 0.70, overlap: 0.5 },
    { lineHeight: 1.80, letterSpacing: 1, bgOpacity: 0.75, overlap: 0.6 },
    // ch_10 ~ ch_12 (Wisdom)
    { lineHeight: 1.88, letterSpacing: 2, bgOpacity: 0.72, overlap: 0.5 },
    { lineHeight: 1.75, letterSpacing: 3, bgOpacity: 0.68, overlap: 0.4 },
    { lineHeight: 1.82, letterSpacing: 1, bgOpacity: 0.70, overlap: 0.6 },
    // ch_13 ~ ch_15 (Sidejob)
    { lineHeight: 1.72, letterSpacing: 2, bgOpacity: 0.70, overlap: 0.5 },
    { lineHeight: 1.80, letterSpacing: 2, bgOpacity: 0.72, overlap: 0.3 },
    { lineHeight: 1.78, letterSpacing: 3, bgOpacity: 0.68, overlap: 0.7 },
    // ch_16 ~ ch_18 (Beauty)
    { lineHeight: 1.85, letterSpacing: 2, bgOpacity: 0.65, overlap: 0.5 },
    { lineHeight: 1.80, letterSpacing: 1, bgOpacity: 0.70, overlap: 0.4 },
    { lineHeight: 1.75, letterSpacing: 3, bgOpacity: 0.75, overlap: 0.6 },
    // ch_19 ~ ch_21 (Tech)
    { lineHeight: 1.78, letterSpacing: 2, bgOpacity: 0.70, overlap: 0.5 },
    { lineHeight: 1.82, letterSpacing: 2, bgOpacity: 0.68, overlap: 0.4 },
    { lineHeight: 1.80, letterSpacing: 3, bgOpacity: 0.72, overlap: 0.6 }
];

// ==================== 채널별 BGM 베리에이션 ====================
const CHANNEL_BGM_VARIATIONS = [
    // ch_1 ~ ch_21
    { volume: 0.14, trimStart: 0 },
    { volume: 0.16, trimStart: 2 },
    { volume: 0.15, trimStart: 4 },
    { volume: 0.13, trimStart: 1 },
    { volume: 0.17, trimStart: 3 },
    { volume: 0.15, trimStart: 5 },
    { volume: 0.14, trimStart: 2 },
    { volume: 0.16, trimStart: 0 },
    { volume: 0.15, trimStart: 3 },
    { volume: 0.18, trimStart: 1 },
    { volume: 0.14, trimStart: 4 },
    { volume: 0.15, trimStart: 2 },
    { volume: 0.16, trimStart: 0 },
    { volume: 0.13, trimStart: 5 },
    { volume: 0.17, trimStart: 1 },
    { volume: 0.15, trimStart: 3 },
    { volume: 0.14, trimStart: 2 },
    { volume: 0.16, trimStart: 4 },
    { volume: 0.15, trimStart: 0 },
    { volume: 0.17, trimStart: 3 },
    { volume: 0.14, trimStart: 1 }
];

const BGM_LIBRARY = {
    "health": "https://autoshort.site/bgm/health_calm.mp3",
    "finance": "https://autoshort.site/bgm/finance_upbeat.mp3",
    "rural": "https://autoshort.site/bgm/lifestyle_peaceful.mp3",
    "wisdom": "https://autoshort.site/bgm/lifestyle_peaceful.mp3",
    "sidejob": "https://autoshort.site/bgm/finance_upbeat.mp3",
    "beauty": "https://autoshort.site/bgm/default_warm.mp3",
    "tech": "https://autoshort.site/bgm/default_warm.mp3",
    "건강": "https://autoshort.site/bgm/health_calm.mp3",
    "재테크": "https://autoshort.site/bgm/finance_upbeat.mp3",
    "운동": "https://autoshort.site/bgm/exercise_energetic.mp3",
    "음식": "https://autoshort.site/bgm/food_cozy.mp3",
    "노후": "https://autoshort.site/bgm/lifestyle_peaceful.mp3",
    "국뽕": "https://autoshort.site/bgm/korea_pride.mp3",
    "default": "https://autoshort.site/bgm/default_warm.mp3"
};

const HOOK_LEN = 3;
const INTRO_LEN = 5;
const OUTRO_LEN = 0;
const TARGET_TOTAL = 65;
const BODY_START = 5;
const BODY_LEN = TARGET_TOTAL - INTRO_LEN - OUTRO_LEN;
const MAX_SEGMENTS = 14;
const TARGET_SEGMENTS = 12;

const TTS_VOLUME = 1.0;

let brandingConfig = null;
let forcedTopic = null;
let channelIndex = 0;
let parseErrors = [];

try {
    const brandingNode = $('Branding Router').first();
    if (brandingNode?.json) {
        brandingConfig = brandingNode.json;
        forcedTopic = brandingConfig.topic || null;

        // 채널 인덱스 추출 (ch_1 → 0, ch_2 → 1, ...)
        const channelId = brandingConfig.channelId || "ch_1";
        const match = channelId.match(/ch_(\d+)/);
        if (match) channelIndex = parseInt(match[1], 10) - 1;
        if (channelIndex < 0 || channelIndex > 20) channelIndex = 0;

        parseErrors.push(`✅ Channel: ${channelId} (index: ${channelIndex})`);
    }
} catch (e) { }

// 채널별 베리에이션 가져오기
const channelTransition = CHANNEL_TRANSITIONS[channelIndex] || CHANNEL_TRANSITIONS[0];
const channelStyle = CHANNEL_STYLE_VARIATIONS[channelIndex] || CHANNEL_STYLE_VARIATIONS[0];
const channelBGM = CHANNEL_BGM_VARIATIONS[channelIndex] || CHANNEL_BGM_VARIATIONS[0];

parseErrors.push(`🎬 Transition: ${channelTransition.in}/${channelTransition.out}`);
parseErrors.push(`📝 Style: lineHeight=${channelStyle.lineHeight}, letterSpacing=${channelStyle.letterSpacing}`);
parseErrors.push(`🎵 BGM: volume=${channelBGM.volume}, trim=${channelBGM.trimStart}s`);

function enforceTopicFromBranding(gptCategory) {
    if (forcedTopic) {
        if (gptCategory !== forcedTopic) {
            parseErrors.push(`🔧 TOPIC: "${gptCategory}" → "${forcedTopic}"`);
        }
        return forcedTopic;
    }
    return gptCategory;
}

let USE_DYNAMIC_SYNC = false;
const SYNC_OFFSET = 0.5;

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

let gptData = {};
let segments = [];
let videoTitle = "AI 숏츠";
let category = "default";
let hookType = "";
let hookText = "";
let introVideoPrompt = "";
let outroVideoPrompt = "";
let introTitle = "";
let tags = [];
let isReverseMode = false;

try {
    const gptContent = $('3. GPT 스크립트').first()?.json?.message?.content || "";
    gptData = safeParseJSON(gptContent, {});

    if (gptData.image_analysis) isReverseMode = true;

    if (gptData.script) {
        const sentences = gptData.script.split(/(?<=[.!?])\s*/).filter(s => s.trim().length > 5);
        const imagePrompts = gptData.image_prompts || [];

        segments = sentences.map((text, i) => ({
            text: text.trim(),
            image_prompt: imagePrompts[i] || ""
        }));

        videoTitle = gptData.title || "AI 숏츠";
        category = enforceTopicFromBranding(gptData.category || "default");
        hookType = gptData.hook_type || "";
        hookText = gptData.hook_text || "";
        introVideoPrompt = gptData.intro_video_prompt || gptData.intro_prompt || "";
        outroVideoPrompt = gptData.outro_video_prompt || gptData.outro_prompt || "";
        introTitle = gptData.intro_title || videoTitle.substring(0, 15) || "건강 비법!";
        tags = gptData.tags || [category, "shorts", "5060", "시니어"];
    } else if (gptData.segments && Array.isArray(gptData.segments)) {
        segments = gptData.segments;
        videoTitle = gptData.youtube_title || gptData.title || "AI 숏츠";
        category = enforceTopicFromBranding(gptData.category || "default");
        hookType = gptData.hook_type || "";
        hookText = gptData.hook_text || "";
        introVideoPrompt = gptData.intro_video_prompt || gptData.intro_prompt || "";
        outroVideoPrompt = gptData.outro_video_prompt || gptData.outro_prompt || "";
        introTitle = gptData.intro_title || videoTitle.substring(0, 15) || "건강 비법!";
    }
} catch (e) {
    parseErrors.push("Primary parse failed: " + e.message);
}

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
            category = enforceTopicFromBranding(parsed.category || "default");
            introTitle = parsed.intro_title || videoTitle.substring(0, 15) || "건강 비법!";
            hookText = parsed.hook_text || "";
        }
    } catch (e) { }
}

if (segments.length === 0) {
    segments = [{ text: "콘텐츠를 로드할 수 없습니다.", image_prompt: "" }];
}
if (segments.length > MAX_SEGMENTS) segments = segments.slice(0, MAX_SEGMENTS);

const bgmUrl = BGM_LIBRARY[category] || BGM_LIBRARY["default"];
parseErrors.push(`🎵 BGM Topic: ${category}`);

const placeholderImage = "https://images.pexels.com/photos/1563356/pexels-photo-1563356.jpeg?auto=compress&cs=tinysrgb&w=1080";
const primaryFont = "https://autoshort.site/fonts/static/NotoSansKR-Bold.ttf";

// ============================================================
// 🔴 절대적 자막 규칙 (v19.4 - 건드리지 않음!)
// ============================================================
const SUBTITLE_ABSOLUTE_RULES = {
    width: 1000,              // 🔴 절대! 건드림 X
    offsetY: -0.23            // 🔴 절대! 건드림 X
};

// ✅ 채널별 베리에이션 적용 (안전 범위 내)
const SUBTITLE_STYLE = {
    font: {
        family: "Noto Sans KR",
        size: 60,
        color: "#ffffff",
        opacity: 1,
        weight: "700"
    },
    style: {
        lineHeight: channelStyle.lineHeight,        // 채널별 베리에이션
        letterSpacing: channelStyle.letterSpacing   // 채널별 베리에이션
    },
    background: {
        color: brandingConfig?.branding?.primaryColor || "#000000",
        opacity: channelStyle.bgOpacity            // 채널별 베리에이션
    }
};

let introVideoUrl = "";
try { introVideoUrl = $('Kling Polling Intro').first()?.json?.data?.output?.video_url || ""; } catch (e) { }

let outroVideoUrl = "";
if (OUTRO_LEN > 0) {
    try { outroVideoUrl = $('Kling Polling Outro').first()?.json?.data?.output?.video_url || ""; } catch (e) { }
}

let hookTtsUrl = "";
try {
    const boostHookResponse = $('Boost Hook Audio').first()?.json;
    if (boostHookResponse?.url) hookTtsUrl = boostHookResponse.url;
    if (!hookTtsUrl) {
        const convertResponse = $('Convert Hook Audio').first()?.json;
        if (convertResponse?.url) hookTtsUrl = convertResponse.url;
    }
} catch (e) { }

let ttsAudioUrl = "";
let ttsAlignment = null;
let ttsActualEndTime = 0;

try {
    const elevenLabsNode = $('6. ElevenLabs TTS').first();
    if (elevenLabsNode?.json?.alignment) {
        ttsAlignment = elevenLabsNode.json.alignment;
        USE_DYNAMIC_SYNC = true;

        const endTimes = ttsAlignment.character_end_times_seconds || [];
        if (endTimes.length > 0) {
            ttsActualEndTime = Math.max(...endTimes);
            parseErrors.push(`✅ TTS end: ${ttsActualEndTime.toFixed(2)}s`);
        }
    }

    const boostBodyResponse = $('Boost Body Audio').first()?.json;
    if (boostBodyResponse?.url) ttsAudioUrl = boostBodyResponse.url;
} catch (e) { }

if (!ttsAudioUrl) {
    try {
        const saveAudioNode = $('Save Audio').first();
        if (saveAudioNode) {
            let filePath = saveAudioNode.json?.fileName || saveAudioNode.json?.file?.name || "";
            if (filePath) {
                const fileName = filePath.split('/').pop();
                if (fileName) ttsAudioUrl = `https://autoshort.site/audio/${fileName}`;
            }
        }
        if (!ttsAudioUrl) {
            const convertResponse = $('Convert Audio').first()?.json;
            if (convertResponse?.url) ttsAudioUrl = convertResponse.url;
        }
    } catch (e) { }
}

let images = [];
try {
    const mergeData = $('Merge Images').first();
    if (mergeData?.json?.images) {
        images = mergeData.json.images.map(item =>
            typeof item === 'string' ? item : (item?.url || item?.src || "")
        ).filter(Boolean);
    }
    parseErrors.push(`🖼️ Images: ${images.length}`);
} catch (e) { }

let thumbnailImage = "";
try { thumbnailImage = $('DALL-E Thumbnail').first()?.json?.data?.[0]?.url || ""; } catch (e) { }

let ACTUAL_VIDEO_LENGTH = TARGET_TOTAL;
if (ttsActualEndTime > 0) {
    const ttsBasedLength = BODY_START + ttsActualEndTime + 3;
    ACTUAL_VIDEO_LENGTH = Math.max(TARGET_TOTAL, ttsBasedLength);
    parseErrors.push(`🎬 Video length: ${ACTUAL_VIDEO_LENGTH.toFixed(2)}s`);
}

// ============================================================
// 🔴 동적 싱크 (절대적 룰 - 건드리지 않음!)
// ============================================================
let segmentTimes = [];
let subtitleStartTimes = [];
let imageStartTimes = [];

if (USE_DYNAMIC_SYNC && ttsAlignment) {
    parseErrors.push("🎯 Dynamic sync enabled!");

    const startTimes = ttsAlignment.character_start_times_seconds || [];
    const endTimes = ttsAlignment.character_end_times_seconds || [];

    let charIndex = 0;

    for (let i = 0; i < segments.length; i++) {
        const sentenceLength = segments[i].text.length;
        const sentenceStart = charIndex;
        const sentenceEnd = charIndex + sentenceLength - 1;

        let startTime = startTimes[sentenceStart] || (i * 5);
        let endTime = endTimes[sentenceEnd] || ((i + 1) * 5);

        startTime += BODY_START;
        endTime += BODY_START;

        subtitleStartTimes.push(startTime);
        imageStartTimes.push(startTime);

        if (i === segments.length - 1) {
            segmentTimes.push(ACTUAL_VIDEO_LENGTH - startTime);
        } else {
            segmentTimes.push(endTime - startTime);
        }

        charIndex += sentenceLength + 1;
    }

} else {
    parseErrors.push("⚠️ Fallback timing");

    const SUBTITLE_START = BODY_START - SYNC_OFFSET;
    const IMAGE_START = BODY_START - SYNC_OFFSET;
    const totalChars = segments.reduce((sum, s) => sum + (s.text?.length || 0), 0);

    segmentTimes = segments.map(s => {
        const charCount = s.text?.length || 10;
        const ratio = charCount / totalChars;
        return Math.max(3, ratio * BODY_LEN);
    });

    let accumulatedTime = SUBTITLE_START;
    for (let i = 0; i < segmentTimes.length; i++) {
        subtitleStartTimes.push(accumulatedTime);
        accumulatedTime += segmentTimes[i];
    }

    accumulatedTime = IMAGE_START;
    for (let i = 0; i < segmentTimes.length; i++) {
        imageStartTimes.push(accumulatedTime);
        accumulatedTime += segmentTimes[i];
    }

    if (segmentTimes.length > 0) {
        const lastIndex = segmentTimes.length - 1;
        const lastStart = subtitleStartTimes[lastIndex];
        segmentTimes[lastIndex] = ACTUAL_VIDEO_LENGTH - lastStart;
    }
}

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

// ============================================================
// 자막 클립 (절대적 룰 유지 + 채널별 베리에이션)
// ============================================================
const subtitleClips = [];

if (hookText) {
    const formattedHook = formatSubtitle(hookText);
    const hookLineCount = (formattedHook.match(/\n/g) || []).length + 1;
    const hookHeight = Math.max(200, hookLineCount * 100 + 50);

    subtitleClips.push({
        asset: {
            type: "rich-text",
            text: formattedHook,
            font: {
                family: "Noto Sans KR",
                size: 56,
                color: "#ffffff",
                opacity: 1,
                weight: "900"
            },
            style: {
                lineHeight: channelStyle.lineHeight,
                letterSpacing: channelStyle.letterSpacing
            },
            background: { color: "#000000", opacity: channelStyle.bgOpacity },
            align: { horizontal: "center", vertical: "middle" }
        },
        start: 0,
        length: HOOK_LEN,
        position: "center",
        width: SUBTITLE_ABSOLUTE_RULES.width,    // 🔴 절대!
        height: hookHeight,
        offset: { x: 0, y: -0.20 }
    });
}

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
            style: { lineHeight: 1.3 },
            background: { color: "#000000", opacity: channelStyle.bgOpacity },
            align: { horizontal: "center", vertical: "middle" }
        },
        start: HOOK_LEN,
        length: INTRO_LEN - HOOK_LEN,
        position: "center",
        width: SUBTITLE_ABSOLUTE_RULES.width,    // 🔴 절대!
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
    const dynamicHeight = Math.max(200, lineCount * 100 + 50);

    subtitleClips.push({
        asset: {
            type: "rich-text",
            text: formattedText,
            font: SUBTITLE_STYLE.font,
            style: SUBTITLE_STYLE.style,
            background: SUBTITLE_STYLE.background,
            align: { horizontal: "center", vertical: "middle" }
        },
        start: subtitleStartTimes[i],
        length: segmentTimes[i],
        position: "center",
        width: SUBTITLE_ABSOLUTE_RULES.width,         // 🔴 절대! 1000px
        height: dynamicHeight,
        offset: {
            x: 0,
            y: SUBTITLE_ABSOLUTE_RULES.offsetY        // 🔴 절대! -0.23
        }
    });
}

// ============================================================
// 비주얼 클립 (채널별 전환효과 적용!)
// ============================================================
const visualClips = [];

if (introVideoUrl) {
    visualClips.push({
        asset: { type: "video", src: introVideoUrl, volume: 0 },
        start: 0,
        length: INTRO_LEN,
        fit: "cover",
        transition: { out: channelTransition.out }   // ✅ 채널별 전환효과
    });
} else {
    const introImage = isReverseMode && thumbnailImage ? thumbnailImage : (images[0] || placeholderImage);
    visualClips.push({
        asset: { type: "image", src: introImage },
        start: 0,
        length: INTRO_LEN,
        fit: "cover",
        transition: { out: channelTransition.out }   // ✅ 채널별 전환효과
    });
}

for (let i = 0; i < segments.length; i++) {
    const src = images[i] || images[0] || placeholderImage;

    // ✅ 채널별 오버랩 베리에이션 적용
    const overlapTime = channelStyle.overlap;

    let slideLength;
    if (i === segments.length - 1) {
        slideLength = ACTUAL_VIDEO_LENGTH - imageStartTimes[i];
    } else {
        slideLength = segmentTimes[i] + overlapTime;
    }

    visualClips.push({
        asset: { type: "image", src },
        start: imageStartTimes[i],
        length: slideLength,
        fit: "cover",
        transition: {
            in: channelTransition.in,    // ✅ 채널별 전환효과
            out: channelTransition.out   // ✅ 채널별 전환효과
        }
    });
}

// ==================== 오디오 클립 ====================
const audioClips = [];

if (hookTtsUrl) {
    audioClips.push({
        asset: { type: "audio", src: hookTtsUrl, volume: TTS_VOLUME },
        start: 0,
        length: HOOK_LEN
    });
}

if (ttsAudioUrl) {
    const ttsLength = ttsActualEndTime > 0
        ? Math.max(ttsActualEndTime + 1, BODY_LEN)
        : BODY_LEN;

    audioClips.push({
        asset: { type: "audio", src: ttsAudioUrl, volume: TTS_VOLUME },
        start: BODY_START,
        length: ttsLength
    });
}

// ==================== Shotstack JSON ====================
const shotstackBody = {
    timeline: {
        soundtrack: {
            src: bgmUrl,
            effect: "fadeOut",
            volume: channelBGM.volume,      // ✅ 채널별 볼륨
            trim: channelBGM.trimStart      // ✅ 채널별 트림 시작점
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

// ==================== 출력 ====================
return [{
    json: {
        bodyString: JSON.stringify(shotstackBody),
        videoTitle,
        category,
        introTitle,
        hookText,
        tags,
        script: gptData.script || "",
        intro_prompt: introVideoPrompt,
        outro_prompt: outroVideoPrompt,
        image_prompts: segments.map(s => s.image_prompt || ""),
        thumbnailImage: thumbnailImage || (images[0] || ""),
        debug: {
            version: "20.30-CHANNEL-VARIATIONS",
            channelIndex: channelIndex,
            absoluteRules: {
                width: SUBTITLE_ABSOLUTE_RULES.width,
                offsetY: SUBTITLE_ABSOLUTE_RULES.offsetY,
                dynamicSync: USE_DYNAMIC_SYNC
            },
            channelVariations: {
                transition: channelTransition,
                style: channelStyle,
                bgm: channelBGM
            },
            timing: {
                targetTotal: TARGET_TOTAL,
                actualVideoLength: ACTUAL_VIDEO_LENGTH,
                ttsActualEndTime: ttsActualEndTime,
                segmentCount: segments.length
            },
            parseErrors
        }
    }
}];
