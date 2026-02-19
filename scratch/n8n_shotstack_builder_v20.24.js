// ============================================================
// AIASF n8n Code Node - Shotstack JSON Builder
// v20.24 FINAL-FULLWIDTH-FIX
// - 자막 width/height 제거 → Shotstack이 자동으로 전체 화면 사용!
// - padding으로 좌우 여백 확보
// - offset.y = 0.35 (YouTube Safe Zone)
// ============================================================

/**
 * ✅ OUTPUT CANVAS (Shorts standard)
 */
const OUT_W = 1080;
const OUT_H = 1920;

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
const MAX_SEGMENTS = 12;
const TARGET_SEGMENTS = 10;

const TTS_VOLUME = 1.0;
const BGM_VOLUME = 0.15;

let brandingConfig = null;
let forcedTopic = null;
let brandingDebug = [];
let parseErrors = [];

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

// ============================================================
// ✅ Shotstack 공식 문서 발견!
// ============================================================
// "If you do not specify width and height for a text asset, 
//  its bounding box will default to the FULL WIDTH and HEIGHT 
//  of the viewport"
// 
// 🔴 즉, width/height를 설정하면 오히려 좁아짐!
// ✅ 해결: width/height 제거 → 전체 화면 사용
// ✅ padding으로 좌우 여백 확보
// ============================================================

// ✅ YouTube Safe Zone: 35% 위로
const SAFE_BOTTOM_Y = 0.35;

// ✅ 5060세대 가독성
const SUBTITLE_FONT_SIZE = 60;
const SUBTITLE_PADDING = 40;      // 🔴 좌우 여백 크게!
const SUBTITLE_LINEHEIGHT = 1.5;

// Hook text
const HOOK_FONT_SIZE = 48;
const HOOK_PADDING = 30;

// Intro title
const INTRO_FONT_SIZE = 64;
const INTRO_PADDING = 30;

function normalizeText(t) {
    return String(t ?? "")
        .replace(/\s+!/g, "!")
        .replace(/\s+\?/g, "?")
        .replace(/\s+\./g, ".")
        .trim();
}

// ============================================================
// ✅ Branding
// ============================================================
try {
    const possibleNodeNames = ['Branding Router', 'BrandingRouter', 'branding router', 'Branding', 'Set Branding'];

    for (const nodeName of possibleNodeNames) {
        try {
            const node = $(nodeName).first();
            if (node?.json) {
                brandingConfig = node.json;
                forcedTopic = brandingConfig.topic || null;
                brandingDebug.push(`✅ Found: "${nodeName}"`);
                brandingDebug.push(`   → topic: "${forcedTopic}"`);
                brandingDebug.push(`   → channelId: "${brandingConfig.channelId || 'N/A'}"`);
                break;
            }
        } catch (e) { }
    }

    if (!brandingConfig) {
        brandingDebug.push("⚠️ No branding node found → Phase 1 mode");
    }
} catch (e) {
    brandingDebug.push("❌ Branding error: " + e.message);
}

function enforceTopicFromBranding(gptCategory) {
    if (forcedTopic) {
        if (gptCategory !== forcedTopic) {
            parseErrors.push(`🔧 TOPIC OVERRIDE: GPT="${gptCategory}" → BRANDING="${forcedTopic}"`);
        } else {
            parseErrors.push(`✅ TOPIC MATCH: "${gptCategory}"`);
        }
        return forcedTopic;
    }
    parseErrors.push(`⚠️ NO BRANDING TOPIC → GPT category: "${gptCategory}"`);
    return gptCategory;
}

// ============================================================
// ✅ Parse GPT
// ============================================================
let gptData = {};
let segments = [];
let videoTitle = "AI 숏츠";
let category = "default";
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
        hookText = gptData.hook_text || "";
        introVideoPrompt = gptData.intro_video_prompt || gptData.intro_prompt || "";
        outroVideoPrompt = gptData.outro_video_prompt || gptData.outro_prompt || "";
        introTitle = gptData.intro_title || videoTitle.substring(0, 15) || "건강 비법!";
        tags = gptData.tags || [category, "shorts", "5060", "시니어", "건강정보"];
    } else if (gptData.segments && Array.isArray(gptData.segments)) {
        segments = gptData.segments;
        videoTitle = gptData.youtube_title || gptData.title || "AI 숏츠";
        category = enforceTopicFromBranding(gptData.category || "default");
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
parseErrors.push(`🎵 BGM selected: ${category} → ${bgmUrl.split('/').pop()}`);

const placeholderImage = "https://images.pexels.com/photos/1563356/pexels-photo-1563356.jpeg?auto=compress&cs=tinysrgb&w=1080";
const primaryFont = "https://autoshort.site/fonts/static/NotoSansKR-Bold.ttf";

// ============================================================
// ✅ Subtitle Style - width/height 제거!
// ============================================================
const getSubtitleConfig = () => {
    const brandColor = brandingConfig?.branding?.primaryColor || "#000000";

    return {
        font: {
            family: "Noto Sans KR",
            size: SUBTITLE_FONT_SIZE,
            color: "#ffffff",
            opacity: 1,
            weight: 700,
            lineHeight: SUBTITLE_LINEHEIGHT
        },
        background: {
            color: brandColor,
            opacity: 0.85,
            padding: SUBTITLE_PADDING,  // 🔴 여백으로 좌우 공간 확보!
            borderRadius: 16
        },
        alignment: {
            horizontal: "center",
            vertical: "center"
        }
        // ✅ width 제거! Shotstack이 자동으로 전체 화면 사용
    };
};

const SUBTITLE_CONFIG = getSubtitleConfig();

// ============================================================
// ✅ Load media URLs
// ============================================================
let introVideoUrl = "";
try { introVideoUrl = $('Kling Polling Intro').first()?.json?.data?.output?.video_url || ""; } catch (e) { }

let outroVideoUrl = "";
if (OUTRO_LEN > 0) {
    try { outroVideoUrl = $('Kling Polling Outro').first()?.json?.data?.output?.video_url || ""; } catch (e) { }
}

// Hook TTS
let hookTtsUrl = "";
try {
    const boostHookResponse = $('Boost Hook Audio').first()?.json;
    if (boostHookResponse?.url) hookTtsUrl = boostHookResponse.url;

    if (!hookTtsUrl) {
        const convertResponse = $('Convert Hook Audio').first()?.json;
        if (convertResponse?.url) {
            hookTtsUrl = convertResponse.url;
        } else if (convertResponse?.data) {
            const parsed = safeParseJSON(convertResponse.data, {});
            hookTtsUrl = parsed.url || "";
        }
    }
} catch (e) {
    parseErrors.push("Hook TTS URL parse failed: " + e.message);
}

// Body TTS
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
            parseErrors.push(`✅ TTS actual end time: ${ttsActualEndTime.toFixed(2)}s`);
        }
    }
    const boostBodyResponse = $('Boost Body Audio').first()?.json;
    if (boostBodyResponse?.url) ttsAudioUrl = boostBodyResponse.url;
} catch (e) {
    parseErrors.push("ElevenLabs alignment parse failed: " + e.message);
}

if (!ttsAudioUrl) {
    try {
        const saveAudioNode = $('Save Audio').first();
        if (saveAudioNode) {
            let filePath = "";
            if (saveAudioNode.json?.fileName) filePath = saveAudioNode.json.fileName;
            else if (saveAudioNode.json?.file?.name) filePath = saveAudioNode.json.file.name;
            else if (saveAudioNode.json?.data?.fileName) filePath = saveAudioNode.json.data.fileName;

            if (filePath) {
                const fileName = filePath.split('/').pop();
                if (fileName) ttsAudioUrl = `https://autoshort.site/audio/${fileName}`;
            }
        }

        if (!ttsAudioUrl) {
            const convertResponse = $('Convert Audio').first()?.json;
            if (convertResponse?.url) {
                ttsAudioUrl = convertResponse.url;
            } else if (convertResponse?.data) {
                const parsed = safeParseJSON(convertResponse.data, {});
                ttsAudioUrl = parsed.url || "";
            }
        }
    } catch (e) {
        parseErrors.push("Body TTS URL parse failed: " + e.message);
    }
}

// Images merge
let images = [];
try {
    const mergeData = $('Merge Images').first();
    if (mergeData?.json?.images) {
        const imageArray = mergeData.json.images;
        images = imageArray.map(item => (typeof item === 'string' ? item : (item?.url || item?.src || ""))).filter(Boolean);
    }
    if (images.length === 0 && Array.isArray(mergeData?.json)) {
        images = mergeData.json.map(item => item?.url || item?.src || "").filter(Boolean);
    }
    if (images.length === 0) {
        const allMergeData = $('Merge Images').all();
        images = allMergeData.map(item => item?.json?.url || item?.json?.src || "").filter(Boolean);
    }
    parseErrors.push(`🖼️ Images found: ${images.length}`);
} catch (e) {
    parseErrors.push("Image merge parse failed: " + e.message);
}

let thumbnailImage = "";
try { thumbnailImage = $('DALL-E Thumbnail').first()?.json?.data?.[0]?.url || ""; } catch (e) { }

// ============================================================
// ✅ TTS 기반 동적 영상 길이
// ============================================================
let ACTUAL_VIDEO_LENGTH = TARGET_TOTAL;

if (ttsActualEndTime > 0) {
    const ttsBasedLength = BODY_START + ttsActualEndTime + 3;
    ACTUAL_VIDEO_LENGTH = Math.max(TARGET_TOTAL, ttsBasedLength);
    parseErrors.push(`🎬 Dynamic video length: ${ACTUAL_VIDEO_LENGTH.toFixed(2)}s`);
} else {
    parseErrors.push(`⚠️ No TTS alignment → Using default ${TARGET_TOTAL}s`);
}

// ============================================================
// ✅ Timing
// ============================================================
let segmentTimes = [];
let subtitleStartTimes = [];
let imageStartTimes = [];

const SLIDE_DURATION = 6.0;
const segmentCount = segments.length || 1;

if (USE_DYNAMIC_SYNC && ttsAlignment) {
    parseErrors.push("🎯 Using dynamic sync from ElevenLabs alignment!");

    const startTimes = ttsAlignment.character_start_times_seconds || [];
    const endTimes = ttsAlignment.character_end_times_seconds || [];

    let charIndex = 0;

    for (let i = 0; i < segments.length; i++) {
        const sentenceLength = segments[i].text.length;
        const sentenceStart = charIndex;
        const sentenceEnd = charIndex + sentenceLength - 1;

        let startTime = startTimes[sentenceStart] || (i * SLIDE_DURATION);
        let endTime = endTimes[sentenceEnd] || ((i + 1) * SLIDE_DURATION);

        startTime += BODY_START;
        endTime += BODY_START;

        subtitleStartTimes.push(startTime);
        imageStartTimes.push(startTime);

        if (i === segments.length - 1) {
            const remainingTime = ACTUAL_VIDEO_LENGTH - startTime;
            segmentTimes.push(Math.max(2.0, remainingTime));
        } else {
            const duration = endTime - startTime;
            segmentTimes.push(Math.max(0.5, duration));
        }

        charIndex += sentenceLength + 1;
    }
} else {
    parseErrors.push("⚠️ Fallback to equal-duration timing");
    const SUBTITLE_START = BODY_START - SYNC_OFFSET;
    const IMAGE_START = BODY_START - SYNC_OFFSET;

    for (let i = 0; i < segmentCount; i++) {
        segmentTimes.push(SLIDE_DURATION);
        subtitleStartTimes.push(SUBTITLE_START + (i * SLIDE_DURATION));
        imageStartTimes.push(IMAGE_START + (i * SLIDE_DURATION));
    }

    if (segmentTimes.length > 0) {
        const lastIndex = segmentTimes.length - 1;
        const lastStart = subtitleStartTimes[lastIndex];
        const remaining = ACTUAL_VIDEO_LENGTH - lastStart;
        segmentTimes[lastIndex] = Math.max(2.0, remaining);
    }
}

// ============================================================
// ✅ Subtitle Clips - width/height 없이 전체 화면 사용!
// ============================================================
const subtitleClips = [];

// Hook subtitle
if (hookText) {
    subtitleClips.push({
        asset: {
            type: "text",
            text: normalizeText(hookText),
            // ✅ width/height 제거! 전체 화면 사용
            font: {
                family: "Noto Sans KR",
                size: HOOK_FONT_SIZE,
                color: "#ffffff",
                opacity: 1,
                weight: 900,
                lineHeight: 1.3
            },
            background: {
                color: "#000000",
                opacity: 0.75,
                padding: HOOK_PADDING,
                borderRadius: 12
            },
            alignment: { horizontal: "center", vertical: "center" }
        },
        start: 0,
        length: HOOK_LEN,
        position: "center",
        offset: { x: 0, y: -0.15 }
    });
}

// Intro title
if (introTitle) {
    subtitleClips.push({
        asset: {
            type: "text",
            text: normalizeText(introTitle),
            // ✅ width/height 제거!
            font: {
                family: "Noto Sans KR",
                size: INTRO_FONT_SIZE,
                color: "#ffffff",
                opacity: 1,
                weight: 900,
                lineHeight: 1.2
            },
            background: {
                color: "#000000",
                opacity: 0.6,
                padding: INTRO_PADDING,
                borderRadius: 12
            },
            alignment: { horizontal: "center", vertical: "center" }
        },
        start: HOOK_LEN,
        length: INTRO_LEN - HOOK_LEN,
        position: "center",
        offset: { x: 0, y: 0.15 }
    });
}

// ✅ Body subtitles - width/height 없이!
for (let i = 0; i < segments.length; i++) {
    const rawText = normalizeText(segments[i]?.text || "");
    if (!rawText) continue;

    subtitleClips.push({
        asset: {
            type: "text",
            text: rawText,
            // ✅ width/height 완전 제거! Shotstack이 전체 화면으로 자동 설정
            font: SUBTITLE_CONFIG.font,
            background: SUBTITLE_CONFIG.background,
            alignment: SUBTITLE_CONFIG.alignment
        },
        start: subtitleStartTimes[i],
        length: segmentTimes[i],
        position: "bottom",
        offset: { x: 0, y: SAFE_BOTTOM_Y }
    });
}

// ============================================================
// ✅ Visual Clips
// ============================================================
const visualClips = [];

if (introVideoUrl) {
    visualClips.push({
        asset: { type: "video", src: introVideoUrl, volume: 0 },
        start: 0,
        length: INTRO_LEN,
        fit: "cover"
    });
} else {
    const introImage = isReverseMode && thumbnailImage ? thumbnailImage : (images[0] || placeholderImage);
    visualClips.push({
        asset: { type: "image", src: introImage },
        start: 0,
        length: INTRO_LEN,
        fit: "cover"
    });
}

for (let i = 0; i < segments.length; i++) {
    const imageIndex = images.length > 0 ? (i % images.length) : 0;
    const src = images[imageIndex] || images[0] || placeholderImage;

    let slideLength;
    if (i === segments.length - 1) {
        const calculatedLength = ACTUAL_VIDEO_LENGTH - imageStartTimes[i];
        slideLength = Math.max(2.0, calculatedLength);
        parseErrors.push(`🔥 Last slide: start=${imageStartTimes[i].toFixed(2)}s, length=${slideLength.toFixed(2)}s`);
    } else {
        slideLength = Math.max(0.5, (segmentTimes[i] || 0) + 0.5);
    }

    visualClips.push({
        asset: { type: "image", src },
        start: imageStartTimes[i],
        length: slideLength,
        fit: "cover"
    });
}

// ============================================================
// ✅ Audio Clips
// ============================================================
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
    parseErrors.push(`🎤 TTS audio length: ${ttsLength.toFixed(2)}s`);
}

// ============================================================
// ✅ Shotstack JSON
// ============================================================
const shotstackBody = {
    timeline: {
        soundtrack: { src: bgmUrl, effect: "fadeOut", volume: BGM_VOLUME },
        background: "#000000",
        fonts: [{ src: primaryFont }],
        tracks: [
            { clips: subtitleClips },
            { clips: visualClips },
            ...(audioClips.length ? [{ clips: audioClips }] : [])
        ]
    },
    output: {
        format: "mp4",
        size: { width: OUT_W, height: OUT_H },
        fps: 30
    }
};

// ============================================================
// ✅ Return
// ============================================================
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
            version: "20.24-FULLWIDTH-FIX",
            output: { width: OUT_W, height: OUT_H },
            subtitle: {
                widthMode: "FULL VIEWPORT (no width/height set)",
                fontSize: SUBTITLE_FONT_SIZE,
                padding: SUBTITLE_PADDING,
                bottomOffsetY: SAFE_BOTTOM_Y,
                note: "Shotstack auto-fills to full screen when width/height omitted"
            },
            brandingDebug,
            topicInfo: {
                forcedTopic: forcedTopic || "없음 (Phase 1)",
                gptCategory: gptData.category || "N/A",
                finalCategory: category,
                bgmApplied: bgmUrl.split('/').pop()
            },
            timing: {
                targetTotal: TARGET_TOTAL,
                actualVideoLength: ACTUAL_VIDEO_LENGTH.toFixed(2),
                ttsActualEndTime: ttsActualEndTime.toFixed(2),
                segmentCount: segments.length
            },
            assets: {
                imagesFound: images.length,
                hasIntroVideo: !!introVideoUrl,
                hasHookTts: !!hookTtsUrl,
                hasBodyTts: !!ttsAudioUrl,
                phase2Enabled: !!brandingConfig
            },
            parseErrors
        }
    }
}];
