// ============================================================
// AIASF n8n Code Node - Shotstack JSON Builder
// v20.26 PHASE1-STYLE (v19.9 기반 + 최소 수정)
// - Phase 1 자막 스타일 그대로 유지!
// - position: center, offsetY: -0.25 (화면 중앙 위)
// - rich-text asset 사용
// - 폰트 48 → 60px (5060세대)
// - 영상 길이 50 → 65초 + TTS 동적
// ============================================================

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

// ==================== 타임라인 설정 ====================
const INTRO_LEN = 5;
const OUTRO_LEN = 0;         // Phase 2: 아웃트로 제거
const TARGET_TOTAL = 65;     // 65초로 확장
const BODY_START = 5;
const BODY_LEN = TARGET_TOTAL - INTRO_LEN - OUTRO_LEN;
const MAX_SEGMENTS = 12;
const TARGET_SEGMENTS = 10;

const TTS_VOLUME = 1.0;
const BGM_VOLUME = 0.15;

// ==================== Branding (Phase 2) ====================
let brandingConfig = null;
let forcedTopic = null;
let brandingDebug = [];
let parseErrors = [];

try {
    const possibleNodeNames = ['Branding Router', 'BrandingRouter', 'branding router', 'Branding', 'Set Branding'];
    for (const nodeName of possibleNodeNames) {
        try {
            const node = $(nodeName).first();
            if (node?.json) {
                brandingConfig = node.json;
                forcedTopic = brandingConfig.topic || null;
                brandingDebug.push(`✅ Found: "${nodeName}" → topic: "${forcedTopic}"`);
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
        parseErrors.push(`🔧 TOPIC: "${gptCategory}" → "${forcedTopic}"`);
        return forcedTopic;
    }
    return gptCategory;
}

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

// ==================== GPT 데이터 파싱 ====================
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
        tags = gptData.tags || [category, "shorts", "5060", "시니어"];
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
parseErrors.push(`🎵 BGM: ${category} → ${bgmUrl.split('/').pop()}`);

// ==================== 상수 ====================
const placeholderImage = "https://images.pexels.com/photos/1563356/pexels-photo-1563356.jpeg?auto=compress&cs=tinysrgb&w=1080";
const primaryFont = "https://autoshort.site/fonts/static/NotoSansKR-Bold.ttf";

// ============================================================
// ✅ Phase 1 자막 절대 규칙 (v19.9 그대로!)
// ============================================================
const SUBTITLE_ABSOLUTE_RULES = {
    font: {
        family: "Noto Sans KR",
        size: 60,                  // 🔴 48 → 60px (5060세대!)
        color: "#ffffff",
        opacity: 1,
        weight: "700"
    },
    style: {
        lineHeight: 1.8,
        letterSpacing: 2
    },
    background: {
        // 🔴 Phase 2: Branding 색상 적용!
        color: brandingConfig?.branding?.primaryColor || "#000000",
        opacity: 0.85
    },
    size: {
        width: 900,               // Phase 1 그대로!
        height: 400
    },
    position: {
        offsetX: 0,
        offsetY: -0.25            // 🔴 Phase 1 그대로! (center 기준 25% 위)
    },
    maxLines: 3
};

// ==================== 미디어 URL ====================
let introVideoUrl = "";
try { introVideoUrl = $('Kling Polling Intro').first()?.json?.data?.output?.video_url || ""; } catch (e) { }

let outroVideoUrl = "";
try { outroVideoUrl = $('Kling Polling Outro').first()?.json?.data?.output?.video_url || ""; } catch (e) { }

// Hook TTS
let hookTtsUrl = "";
try {
    const boostHookResponse = $('Boost Hook Audio').first()?.json;
    if (boostHookResponse?.url) hookTtsUrl = boostHookResponse.url;
    if (!hookTtsUrl) {
        const convertResponse = $('Convert Hook Audio').first()?.json;
        if (convertResponse?.url) hookTtsUrl = convertResponse.url;
    }
} catch (e) { }

// Body TTS
let ttsAudioUrl = "";
let ttsAlignment = null;
let ttsActualEndTime = 0;

try {
    const elevenLabsNode = $('6. ElevenLabs TTS').first();
    if (elevenLabsNode?.json?.alignment) {
        ttsAlignment = elevenLabsNode.json.alignment;
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

// 이미지
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
    parseErrors.push(`🖼️ Images: ${images.length}`);
} catch (e) { }

let thumbnailImage = "";
try { thumbnailImage = $('DALL-E Thumbnail').first()?.json?.data?.[0]?.url || ""; } catch (e) { }

// ==================== TTS 기반 동적 영상 길이 ====================
let ACTUAL_VIDEO_LENGTH = TARGET_TOTAL;
if (ttsActualEndTime > 0) {
    const ttsBasedLength = BODY_START + ttsActualEndTime + 3;
    ACTUAL_VIDEO_LENGTH = Math.max(TARGET_TOTAL, ttsBasedLength);
    parseErrors.push(`🎬 Video length: ${ACTUAL_VIDEO_LENGTH.toFixed(2)}s`);
}

// ==================== 시간 배분 ====================
const segmentCount = segments.length || 1;
const perSegmentTime = (ACTUAL_VIDEO_LENGTH - INTRO_LEN) / segmentCount;

// ==================== 줄바꿈 함수 (Phase 1 그대로!) ====================
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
// ✅ 자막 클립 - Phase 1 스타일! (rich-text, center, offsetY:-0.25)
// ============================================================
const subtitleClips = [];

// Hook subtitle
if (hookText) {
    subtitleClips.push({
        asset: {
            type: "rich-text",      // 🔴 Phase 1: rich-text!
            text: hookText,
            font: {
                family: "Noto Sans KR",
                size: 56,
                color: "#ffffff",
                opacity: 1,
                weight: "900"
            },
            style: { lineHeight: 1.3 },
            background: { color: "#000000", opacity: 0.75 },
            align: { horizontal: "center", vertical: "middle" }
        },
        start: 0,
        length: 3,
        position: "center",         // 🔴 Phase 1: center!
        width: 900,
        height: 200,
        offset: { x: 0, y: -0.15 }
    });
}

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

// 본문 자막 (Phase 1 스타일!)
for (let i = 0; i < segments.length; i++) {
    const rawText = String(segments[i]?.text || "").trim();
    if (!rawText) continue;

    const formattedText = formatSubtitle(rawText);
    const lineCount = (formattedText.match(/\n/g) || []).length + 1;
    const dynamicHeight = Math.max(200, lineCount * 100 + 50);

    const startTime = INTRO_LEN + (i * perSegmentTime);
    let length = perSegmentTime;

    // 마지막 슬라이드는 영상 끝까지
    if (i === segments.length - 1) {
        length = ACTUAL_VIDEO_LENGTH - startTime;
    }

    subtitleClips.push({
        asset: {
            type: "rich-text",              // 🔴 Phase 1: rich-text!
            text: formattedText,
            font: SUBTITLE_ABSOLUTE_RULES.font,
            style: SUBTITLE_ABSOLUTE_RULES.style,
            background: SUBTITLE_ABSOLUTE_RULES.background,
            align: { horizontal: "center", vertical: "middle" }
        },
        start: startTime,
        length: Math.max(1, length),
        position: "center",                 // 🔴 Phase 1: center!
        width: SUBTITLE_ABSOLUTE_RULES.size.width,
        height: dynamicHeight,
        offset: {
            x: SUBTITLE_ABSOLUTE_RULES.position.offsetX,
            y: SUBTITLE_ABSOLUTE_RULES.position.offsetY  // 🔴 -0.25!
        }
    });
}

// ==================== 비주얼 클립 ====================
const visualClips = [];

// 인트로
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

// 본문 슬라이드
for (let i = 0; i < segments.length; i++) {
    const imageIndex = images.length > 0 ? (i % images.length) : 0;
    const src = images[imageIndex] || images[0] || placeholderImage;

    const startTime = INTRO_LEN + (i * perSegmentTime);
    let slideLength = perSegmentTime + 0.5;

    if (i === segments.length - 1) {
        slideLength = ACTUAL_VIDEO_LENGTH - startTime;
        parseErrors.push(`🔥 Last slide: ${startTime.toFixed(2)}s → ${(startTime + slideLength).toFixed(2)}s`);
    }

    visualClips.push({
        asset: { type: "image", src },
        start: startTime,
        length: Math.max(1, slideLength),
        fit: "cover"
    });
}

// ==================== 오디오 클립 ====================
const audioClips = [];

if (hookTtsUrl) {
    audioClips.push({
        asset: { type: "audio", src: hookTtsUrl, volume: TTS_VOLUME },
        start: 0,
        length: 3
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
        size: { width: 1080, height: 1920 },
        fps: 30
    }
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
            version: "20.26-PHASE1-STYLE",
            note: "Phase 1 자막 스타일 복원 (rich-text, center, offsetY:-0.25)",
            subtitle: {
                type: "rich-text",
                position: "center",
                offsetY: SUBTITLE_ABSOLUTE_RULES.position.offsetY,
                fontSize: SUBTITLE_ABSOLUTE_RULES.font.size,
                width: SUBTITLE_ABSOLUTE_RULES.size.width
            },
            timing: {
                targetTotal: TARGET_TOTAL,
                actualVideoLength: ACTUAL_VIDEO_LENGTH.toFixed(2),
                ttsActualEndTime: ttsActualEndTime.toFixed(2),
                segmentCount: segments.length,
                perSegmentTime: perSegmentTime.toFixed(2)
            },
            brandingDebug,
            parseErrors
        }
    }
}];
