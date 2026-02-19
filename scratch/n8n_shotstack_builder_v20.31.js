// ============================================================
// AIASF n8n Code Node - Shotstack JSON Builder
// v20.31 (21채널 완전 베리에이션 - 최종!)
// ============================================================
// 🔴🔴🔴 절대적 룰 (목숨 걸고 보호!) 🔴🔴🔴
// 1. 동적 싱크: 이미지슬라이드 & 자막 & TTS 완벽 동기화
// 2. 자막 잘림 방지: Width 1000px, Offset Y -0.23 (v19.4 기준!)
// 
// ✅ 5가지 완전 베리에이션:
// 1. 전환효과 (Transition) - 21개 고유 조합
// 2. 이미지 효과 (Effect) - zoomIn/Out, slide 베리에이션
// 3. 필터 (Filter) - boost, contrast, lighten, muted 베리에이션
// 4. 자막 스타일 미세 조정 (lineHeight, letterSpacing, opacity)
// 5. BGM 볼륨/트림/페이드 베리에이션
// ============================================================

// ==================== 1. 채널별 전환효과 (21개 고유!) ====================
const CHANNEL_TRANSITIONS = [
    { in: "fade", out: "fade" },                    // ch_1
    { in: "slideLeft", out: "slideRight" },         // ch_2
    { in: "slideUp", out: "slideDown" },            // ch_3
    { in: "carouselLeft", out: "carouselRight" },   // ch_4
    { in: "carouselUp", out: "carouselDown" },      // ch_5
    { in: "wipeLeft", out: "wipeRight" },           // ch_6
    { in: "reveal", out: "fade" },                  // ch_7
    { in: "zoom", out: "fade" },                    // ch_8
    { in: "slideRight", out: "slideLeft" },         // ch_9
    { in: "fade", out: "slideDown" },               // ch_10
    { in: "carouselRight", out: "carouselLeft" },   // ch_11
    { in: "wipeRight", out: "wipeLeft" },           // ch_12
    { in: "shuffleTopRight", out: "shuffleBottomLeft" },    // ch_13
    { in: "shuffleRightTop", out: "shuffleLeftBottom" },    // ch_14
    { in: "shuffleBottomRight", out: "shuffleTopLeft" },    // ch_15
    { in: "slideDown", out: "slideUp" },            // ch_16
    { in: "carouselDown", out: "carouselUp" },      // ch_17
    { in: "fade", out: "zoom" },                    // ch_18
    { in: "reveal", out: "wipeLeft" },              // ch_19
    { in: "zoom", out: "slideRight" },              // ch_20
    { in: "shuffleLeftTop", out: "shuffleRightBottom" }     // ch_21
];

// ==================== 2. 채널별 이미지 효과 (Effect) ====================
const CHANNEL_EFFECTS = [
    "zoomIn",           // ch_1
    "zoomInSlow",       // ch_2
    "zoomOut",          // ch_3
    "zoomOutSlow",      // ch_4
    "slideLeft",        // ch_5
    "slideLeftSlow",    // ch_6
    "slideRight",       // ch_7
    "slideRightSlow",   // ch_8
    "slideUp",          // ch_9
    "slideUpSlow",      // ch_10
    "slideDown",        // ch_11
    "slideDownSlow",    // ch_12
    "zoomInFast",       // ch_13
    "zoomOutFast",      // ch_14
    "slideLeftFast",    // ch_15
    "slideRightFast",   // ch_16
    "slideUpFast",      // ch_17
    "slideDownFast",    // ch_18
    "zoomIn",           // ch_19
    "zoomOut",          // ch_20
    "slideLeft"         // ch_21
];

// ==================== 3. 채널별 필터 (Filter) ====================
const CHANNEL_FILTERS = [
    "none",      // ch_1 - 기본
    "boost",     // ch_2 - 채도/대비 증가
    "none",      // ch_3
    "contrast",  // ch_4 - 대비 증가
    "none",      // ch_5
    "lighten",   // ch_6 - 밝게
    "none",      // ch_7
    "boost",     // ch_8
    "none",      // ch_9
    "muted",     // ch_10 - 채도 감소 (차분한 느낌)
    "none",      // ch_11
    "contrast",  // ch_12
    "none",      // ch_13
    "lighten",   // ch_14
    "none",      // ch_15
    "boost",     // ch_16
    "none",      // ch_17
    "none",      // ch_18
    "contrast",  // ch_19
    "none",      // ch_20
    "lighten"    // ch_21
];

// ==================== 4. 채널별 자막 스타일 (안전 범위!) ====================
const CHANNEL_STYLES = [
    { lineHeight: 1.75, letterSpacing: 2, bgOpacity: 0.70, overlap: 0.40 }, // ch_1
    { lineHeight: 1.80, letterSpacing: 2, bgOpacity: 0.68, overlap: 0.50 }, // ch_2
    { lineHeight: 1.85, letterSpacing: 2, bgOpacity: 0.72, overlap: 0.55 }, // ch_3
    { lineHeight: 1.70, letterSpacing: 3, bgOpacity: 0.72, overlap: 0.35 }, // ch_4
    { lineHeight: 1.78, letterSpacing: 2, bgOpacity: 0.70, overlap: 0.45 }, // ch_5
    { lineHeight: 1.82, letterSpacing: 1, bgOpacity: 0.68, overlap: 0.60 }, // ch_6
    { lineHeight: 1.90, letterSpacing: 2, bgOpacity: 0.65, overlap: 0.40 }, // ch_7
    { lineHeight: 1.85, letterSpacing: 3, bgOpacity: 0.70, overlap: 0.50 }, // ch_8
    { lineHeight: 1.80, letterSpacing: 1, bgOpacity: 0.75, overlap: 0.55 }, // ch_9
    { lineHeight: 1.88, letterSpacing: 2, bgOpacity: 0.72, overlap: 0.45 }, // ch_10
    { lineHeight: 1.75, letterSpacing: 3, bgOpacity: 0.68, overlap: 0.35 }, // ch_11
    { lineHeight: 1.82, letterSpacing: 1, bgOpacity: 0.70, overlap: 0.50 }, // ch_12
    { lineHeight: 1.72, letterSpacing: 2, bgOpacity: 0.70, overlap: 0.45 }, // ch_13
    { lineHeight: 1.80, letterSpacing: 2, bgOpacity: 0.72, overlap: 0.40 }, // ch_14
    { lineHeight: 1.78, letterSpacing: 3, bgOpacity: 0.68, overlap: 0.55 }, // ch_15
    { lineHeight: 1.85, letterSpacing: 2, bgOpacity: 0.65, overlap: 0.50 }, // ch_16
    { lineHeight: 1.80, letterSpacing: 1, bgOpacity: 0.70, overlap: 0.45 }, // ch_17
    { lineHeight: 1.75, letterSpacing: 3, bgOpacity: 0.75, overlap: 0.40 }, // ch_18
    { lineHeight: 1.78, letterSpacing: 2, bgOpacity: 0.70, overlap: 0.55 }, // ch_19
    { lineHeight: 1.82, letterSpacing: 2, bgOpacity: 0.68, overlap: 0.50 }, // ch_20
    { lineHeight: 1.80, letterSpacing: 3, bgOpacity: 0.72, overlap: 0.45 }  // ch_21
];

// ==================== 5. 채널별 BGM 설정 ====================
const CHANNEL_BGM = [
    { volume: 0.14, trim: 0, fadeEffect: "fadeOut" },      // ch_1
    { volume: 0.16, trim: 2, fadeEffect: "fadeInOut" },    // ch_2
    { volume: 0.15, trim: 4, fadeEffect: "fadeOut" },      // ch_3
    { volume: 0.13, trim: 1, fadeEffect: "fadeIn" },       // ch_4
    { volume: 0.17, trim: 3, fadeEffect: "fadeOut" },      // ch_5
    { volume: 0.15, trim: 5, fadeEffect: "fadeInOut" },    // ch_6
    { volume: 0.14, trim: 2, fadeEffect: "fadeOut" },      // ch_7
    { volume: 0.16, trim: 0, fadeEffect: "fadeIn" },       // ch_8
    { volume: 0.15, trim: 3, fadeEffect: "fadeOut" },      // ch_9
    { volume: 0.18, trim: 1, fadeEffect: "fadeInOut" },    // ch_10
    { volume: 0.14, trim: 4, fadeEffect: "fadeOut" },      // ch_11
    { volume: 0.15, trim: 2, fadeEffect: "fadeIn" },       // ch_12
    { volume: 0.16, trim: 0, fadeEffect: "fadeOut" },      // ch_13
    { volume: 0.13, trim: 5, fadeEffect: "fadeInOut" },    // ch_14
    { volume: 0.17, trim: 1, fadeEffect: "fadeOut" },      // ch_15
    { volume: 0.15, trim: 3, fadeEffect: "fadeIn" },       // ch_16
    { volume: 0.14, trim: 2, fadeEffect: "fadeOut" },      // ch_17
    { volume: 0.16, trim: 4, fadeEffect: "fadeInOut" },    // ch_18
    { volume: 0.15, trim: 0, fadeEffect: "fadeOut" },      // ch_19
    { volume: 0.17, trim: 3, fadeEffect: "fadeIn" },       // ch_20
    { volume: 0.14, trim: 1, fadeEffect: "fadeOut" }       // ch_21
];

// ==================== BGM 라이브러리 ====================
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

// ==================== 상수 정의 ====================
const HOOK_LEN = 3;
const INTRO_LEN = 5;
const OUTRO_LEN = 0;
const TARGET_TOTAL = 65;
const BODY_START = 5;
const BODY_LEN = TARGET_TOTAL - INTRO_LEN - OUTRO_LEN;
const MAX_SEGMENTS = 14;
const TARGET_SEGMENTS = 12;
const TTS_VOLUME = 1.0;

// ==================== 브랜딩 & 채널 설정 ====================
let brandingConfig = null;
let forcedTopic = null;
let channelIndex = 0;
let parseErrors = [];

try {
    const brandingNode = $('Branding Router').first();
    if (brandingNode?.json) {
        brandingConfig = brandingNode.json;
        forcedTopic = brandingConfig.topic || null;

        const channelId = brandingConfig.channelId || "ch_1";
        const match = channelId.match(/ch_(\d+)/);
        if (match) channelIndex = parseInt(match[1], 10) - 1;
        if (channelIndex < 0 || channelIndex > 20) channelIndex = 0;

        parseErrors.push(`✅ Channel: ${channelId} (index: ${channelIndex})`);
    }
} catch (e) { }

// 채널별 베리에이션 가져오기
const chTransition = CHANNEL_TRANSITIONS[channelIndex];
const chEffect = CHANNEL_EFFECTS[channelIndex];
const chFilter = CHANNEL_FILTERS[channelIndex];
const chStyle = CHANNEL_STYLES[channelIndex];
const chBGM = CHANNEL_BGM[channelIndex];

parseErrors.push(`🎬 Transition: ${chTransition.in}/${chTransition.out}`);
parseErrors.push(`✨ Effect: ${chEffect}`);
parseErrors.push(`🎨 Filter: ${chFilter}`);
parseErrors.push(`📝 Style: lH=${chStyle.lineHeight}, lS=${chStyle.letterSpacing}`);
parseErrors.push(`🎵 BGM: vol=${chBGM.volume}, trim=${chBGM.trim}s`);

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

// ==================== GPT 데이터 파싱 ====================
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
// 🔴🔴🔴 절대적 자막 규칙 (v19.4 기반 - 절대 변경 금지!) 🔴🔴🔴
// ============================================================
const SUBTITLE_ABSOLUTE = {
    width: 1000,      // 🔴 절대! 양쪽 잘림 방지!
    offsetY: -0.23    // 🔴 절대! v19.4 기준!
};

// ✅ 채널별 베리에이션 (안전 범위 내!)
const SUBTITLE_STYLE = {
    font: {
        family: "Noto Sans KR",
        size: 60,
        color: "#ffffff",
        opacity: 1,
        weight: "700"
    },
    style: {
        lineHeight: chStyle.lineHeight,
        letterSpacing: chStyle.letterSpacing
    },
    background: {
        color: brandingConfig?.branding?.primaryColor || "#000000",
        opacity: chStyle.bgOpacity
    }
};

// ==================== 미디어 URL 가져오기 ====================
let introVideoUrl = "";
try { introVideoUrl = $('Kling Polling Intro').first()?.json?.data?.output?.video_url || ""; } catch (e) { }

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
// 🔴🔴🔴 동적 싱크 (절대적 룰 - 한 글자도 변경 금지!) 🔴🔴🔴
// ============================================================
let segmentTimes = [];
let subtitleStartTimes = [];
let imageStartTimes = [];

if (USE_DYNAMIC_SYNC && ttsAlignment) {
    parseErrors.push("🎯 Dynamic sync ENABLED!");

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
    parseErrors.push("⚠️ Fallback timing (no TTS alignment)");

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
// 자막 클립 (절대적 룰 + 채널별 스타일!)
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
            font: { family: "Noto Sans KR", size: 56, color: "#ffffff", opacity: 1, weight: "900" },
            style: { lineHeight: chStyle.lineHeight, letterSpacing: chStyle.letterSpacing },
            background: { color: "#000000", opacity: chStyle.bgOpacity },
            align: { horizontal: "center", vertical: "middle" }
        },
        start: 0,
        length: HOOK_LEN,
        position: "center",
        width: SUBTITLE_ABSOLUTE.width,    // 🔴 절대!
        height: hookHeight,
        offset: { x: 0, y: -0.20 }
    });
}

if (introTitle) {
    subtitleClips.push({
        asset: {
            type: "rich-text",
            text: introTitle,
            font: { family: "Noto Sans KR", size: 72, color: "#ffffff", opacity: 1, weight: "900" },
            style: { lineHeight: 1.3 },
            background: { color: "#000000", opacity: chStyle.bgOpacity },
            align: { horizontal: "center", vertical: "middle" }
        },
        start: HOOK_LEN,
        length: INTRO_LEN - HOOK_LEN,
        position: "center",
        width: SUBTITLE_ABSOLUTE.width,    // 🔴 절대!
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
        width: SUBTITLE_ABSOLUTE.width,           // 🔴 절대! 1000px!
        height: dynamicHeight,
        offset: {
            x: 0,
            y: SUBTITLE_ABSOLUTE.offsetY          // 🔴 절대! -0.23!
        }
    });
}

// ============================================================
// 비주얼 클립 (5가지 베리에이션 모두 적용!)
// ============================================================
const visualClips = [];

if (introVideoUrl) {
    visualClips.push({
        asset: { type: "video", src: introVideoUrl, volume: 0 },
        start: 0,
        length: INTRO_LEN,
        fit: "cover",
        effect: chEffect,                    // ✅ 채널별 효과
        filter: chFilter,                    // ✅ 채널별 필터
        transition: { out: chTransition.out } // ✅ 채널별 전환
    });
} else {
    const introImage = isReverseMode && thumbnailImage ? thumbnailImage : (images[0] || placeholderImage);
    visualClips.push({
        asset: { type: "image", src: introImage },
        start: 0,
        length: INTRO_LEN,
        fit: "cover",
        effect: chEffect,                    // ✅ 채널별 효과
        filter: chFilter,                    // ✅ 채널별 필터
        transition: { out: chTransition.out } // ✅ 채널별 전환
    });
}

for (let i = 0; i < segments.length; i++) {
    const src = images[i] || images[0] || placeholderImage;
    const overlapTime = chStyle.overlap;

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
        effect: chEffect,                    // ✅ 채널별 효과
        filter: chFilter,                    // ✅ 채널별 필터
        transition: {
            in: chTransition.in,             // ✅ 채널별 전환 IN
            out: chTransition.out            // ✅ 채널별 전환 OUT
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
            effect: chBGM.fadeEffect,        // ✅ 채널별 페이드
            volume: chBGM.volume,            // ✅ 채널별 볼륨
            trim: chBGM.trim                 // ✅ 채널별 트림
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
            version: "20.31-FULL-VARIATIONS",
            channelIndex: channelIndex,
            absoluteRules: {
                width: SUBTITLE_ABSOLUTE.width,
                offsetY: SUBTITLE_ABSOLUTE.offsetY,
                dynamicSync: USE_DYNAMIC_SYNC,
                note: "🔴 절대 변경 금지! v19.4 기준!"
            },
            channelVariations: {
                transition: chTransition,
                effect: chEffect,
                filter: chFilter,
                style: chStyle,
                bgm: chBGM
            },
            variationSummary: {
                totalUniqueCombinations: "21 channels × 5 variations = 105 unique elements",
                transitions: "21 unique in/out pairs",
                effects: "zoomIn/Out, slide variations with speed modifiers",
                filters: "none, boost, contrast, lighten, muted",
                styles: "lineHeight 1.70-1.90, letterSpacing 1-3, opacity 0.65-0.75",
                bgm: "volume 0.13-0.18, trim 0-5s, fade effects"
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
