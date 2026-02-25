// ============================================================
// AIASF n8n Code Node - Shotstack JSON Builder
// v20.39 INTRO-HOOK-TTS (2026-02-22)
// ============================================================
// 🔥 v6.18 GPT 대응: 13문장 구조 (인트로 후킹 + 본문 12)
// 🎤 인트로 TTS: 0~5초 강력한 후킹 멘트 (TTS 포함!)
// 🔊 BGM 볼륨: Branding Router v5.1 (0.30~0.40, 들린다!)
// 📏 동적 영상 길이: TTS 실제 길이 기반 (후킹멘트 안 잘림!)
// ============================================================
// 📋 변경사항:
// - 13문장 구조: segments[0]=인트로 후킹, segments[1~12]=본문
// - TTS 시작: 0초 (인트로 포함, 기존 5초→0초)
// - TTS 볼륨: 1.0 명시 (BGM 대비 균형)
// - BGM 볼륨: 0.30~0.40 (2배+ 상향, TTS 대비 -10dB)
// - 동적 TARGET_TOTAL: TTS 실제 길이 + 여유 2초
// ============================================================

// ==================== 타임라인 설정 ====================
const INTRO_LEN = 5;          // 인트로 5초
const TARGET_SEGMENTS = 13;   // 🔥 13문장! (GPT v6.18: 인트로 후킹 + 본문 12)
const MAX_SEGMENTS = 13;      // 🔥 13개!
const MIN_SEGMENTS = 7;       // 최소 7문장 (폴백)

// ==================== 21채널 베리에이션 ====================
const TRANSITION_PRESETS = {
    1:  { in: "fade" }, 2:  { in: "zoom" }, 3:  { in: "slideLeft" }, 4:  { in: "slideRight" },
    5:  { in: "slideUp" }, 6:  { in: "slideDown" }, 7:  { in: "fade" }, 8:  { in: "zoom" },
    9:  { in: "slideLeft" }, 10: { in: "slideRight" }, 11: { in: "slideUp" }, 12: { in: "fade" },
    13: { in: "zoom" }, 14: { in: "slideDown" }, 15: { in: "slideLeft" }, 16: { in: "fade" },
    17: { in: "slideRight" }, 18: { in: "zoom" }, 19: { in: "slideUp" }, 20: { in: "slideDown" },
    21: { in: "slideLeft" }
};

const EFFECT_PRESETS = {
    1: "zoomIn", 2: "zoomOut", 3: "slideLeft", 4: "slideRight", 5: "zoomInSlow",
    6: "zoomOutSlow", 7: "slideLeftSlow", 8: "slideRightSlow", 9: "zoomIn", 10: "zoomOut",
    11: "slideLeft", 12: "slideRight", 13: "zoomInSlow", 14: "zoomOutSlow", 15: "slideLeftSlow",
    16: "slideRightSlow", 17: "zoomIn", 18: "zoomOut", 19: "slideLeft", 20: "slideRight", 21: "zoomInSlow"
};

const FILTER_PRESETS = {
    1: "none", 2: "boost", 3: "contrast", 4: "lighten", 5: "muted", 6: "none",
    7: "boost", 8: "contrast", 9: "lighten", 10: "muted", 11: "none", 12: "boost",
    13: "contrast", 14: "lighten", 15: "muted", 16: "none", 17: "boost", 18: "contrast",
    19: "lighten", 20: "muted", 21: "none"
};

const STYLE_PRESETS = {
    1: { lineHeight: 1.80, letterSpacing: 2 }, 2: { lineHeight: 1.75, letterSpacing: 1 },
    3: { lineHeight: 1.85, letterSpacing: 3 }, 4: { lineHeight: 1.70, letterSpacing: 2 },
    5: { lineHeight: 1.90, letterSpacing: 1 }, 6: { lineHeight: 1.78, letterSpacing: 3 },
    7: { lineHeight: 1.82, letterSpacing: 2 }, 8: { lineHeight: 1.73, letterSpacing: 1 },
    9: { lineHeight: 1.88, letterSpacing: 3 }, 10: { lineHeight: 1.76, letterSpacing: 2 },
    11: { lineHeight: 1.84, letterSpacing: 1 }, 12: { lineHeight: 1.71, letterSpacing: 3 },
    13: { lineHeight: 1.87, letterSpacing: 2 }, 14: { lineHeight: 1.74, letterSpacing: 1 },
    15: { lineHeight: 1.86, letterSpacing: 3 }, 16: { lineHeight: 1.79, letterSpacing: 2 },
    17: { lineHeight: 1.83, letterSpacing: 1 }, 18: { lineHeight: 1.72, letterSpacing: 3 },
    19: { lineHeight: 1.89, letterSpacing: 2 }, 20: { lineHeight: 1.77, letterSpacing: 1 },
    21: { lineHeight: 1.81, letterSpacing: 3 }
};

// ==================== 자막 절대 규칙 ====================
const SUBTITLE_ABSOLUTE_RULES = {
    font: { family: "Noto Sans KR", size: 48, color: "#ffffff", opacity: 1, weight: "700" },
    background: { color: "#000000", opacity: 0.7 },
    size: { width: 850, height: 400 },
    position: { offsetX: 0, offsetY: -0.15 }
};

// ==================== BGM 라이브러리 ====================
const BGM_LIBRARY = {
    "건강": "https://autoshort.site/bgm/health_calm.mp3",
    "재테크": "https://autoshort.site/bgm/finance_upbeat.mp3",
    "전원": "https://autoshort.site/bgm/lifestyle_peaceful.mp3",
    "인생지혜": "https://autoshort.site/bgm/lifestyle_peaceful.mp3",
    "디지털부업": "https://autoshort.site/bgm/finance_upbeat.mp3",
    "중년뷰티": "https://autoshort.site/bgm/health_calm.mp3",
    "스마트폰AI": "https://autoshort.site/bgm/default_warm.mp3",
    "default": "https://autoshort.site/bgm/default_warm.mp3"
};

// ==================== JSON 파싱 ====================
function safeParseJSON(str, fallback = {}) {
    if (!str || typeof str !== 'string') return fallback;
    try {
        let cleaned = str.trim();
        if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
        if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
        if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
        return JSON.parse(cleaned.trim());
    } catch (e) { return fallback; }
}

// ==================== 1) GPT 데이터 파싱 (v6.18: 13문장!) ====================
let gptData = {};
let segments = [];
let videoTitle = "AI 숏츠";
let category = "default";
let hookType = "";
let introVideoPrompt = "";
let introTitle = "";
let introHookSpeech = "";  // 🔥 v6.18: 인트로 후킹 멘트
let tags = [];
let parseErrors = [];
let isReverseMode = false;

try {
    const gptContent = $('3. GPT 스크립트').first()?.json?.message?.content || "";
    gptData = safeParseJSON(gptContent, {});

    if (gptData.image_analysis) isReverseMode = true;

    if (gptData.script) {
        // GPT v6.18: 13문장 (마침표 구분)
        const sentences = gptData.script.split(/(?<=[.!?])\s*/).filter(s => s.trim().length > 3);
        const imagePrompts = gptData.image_prompts || [];  // 12개 (본문용)

        // 🔥 segments[0] = 인트로 후킹, segments[1~12] = 본문 12문장
        segments = sentences.map((text, i) => ({
            text: text.trim(),
            image_prompt: i === 0 ? "" : (imagePrompts[i-1] || "")  // 인트로는 이미지 없음!
        }));

        videoTitle = gptData.title || "AI 숏츠";
        category = gptData.category || "default";
        hookType = gptData.hook_type || "";
        introVideoPrompt = gptData.intro_video_prompt || gptData.intro_prompt || "";
        introTitle = gptData.intro_title || "";
        introHookSpeech = gptData.intro_hook_speech || segments[0]?.text || "";  // 🔥 인트로 후킹
        tags = gptData.tags || [category, "shorts", "5060", "시니어"];
    } else if (gptData.segments && Array.isArray(gptData.segments)) {
        segments = gptData.segments;
        videoTitle = gptData.youtube_title || gptData.title || "AI 숏츠";
        category = gptData.category || "default";
        hookType = gptData.hook_type || "";
        introVideoPrompt = gptData.intro_video_prompt || gptData.intro_prompt || "";
        introHookSpeech = gptData.intro_hook_speech || segments[0]?.text || "";
    }
} catch (e) { parseErrors.push("Primary parse failed: " + e.message); }

// 폴백
if (segments.length === 0) {
    try {
        const gptContent = $('3. GPT 스크립트').first()?.json?.message?.content || "";
        const parsed = safeParseJSON(gptContent, {});
        const fullScript = parsed.script_full || parsed.script || "";
        if (fullScript) {
            const sentences = fullScript.split(/(?<=[.!?])\s*/).filter(s => s.trim().length > 3);
            segments = sentences.slice(0, TARGET_SEGMENTS).map((text, i) => ({
                text: text.trim(),
                image_prompt: i === 0 ? "" : ""
            }));
            videoTitle = parsed.youtube_title || "AI 숏츠";
            category = parsed.category || "default";
        }
    } catch (e) { }
}

if (segments.length === 0) segments = [{ text: "콘텐츠를 로드할 수 없습니다.", image_prompt: "" }];
if (segments.length > MAX_SEGMENTS) segments = segments.slice(0, MAX_SEGMENTS);

// ==================== 2) 채널별 설정 (Branding Router v5.1) ====================
let channelNumber = 1;
let channelConfig = {};

try {
    const brandingData = $('Branding Router').first()?.json || {};
    channelNumber = brandingData.channelNumber || 1;
    channelConfig = {
        voiceId: brandingData.voice?.voiceId || "w5eZjob1kXfLB9HjpFqU",
        voiceName: brandingData.voice?.voiceName || "ChulSu",
        logoUrl: brandingData.logo?.url || "",
        logoOpacity: brandingData.logo?.opacity || 0.7,
        bgmUrl: brandingData.bgm?.url || BGM_LIBRARY[category] || BGM_LIBRARY["default"],
        bgmVolume: brandingData.bgm?.volume || 0.32,  // 🔥 v5.1: 0.30~0.40!
        bgmFadeEffect: brandingData.bgm?.fadeEffect || "fadeOut",
        introStyle: brandingData.promptStyles?.intro || "",
        outroStyle: brandingData.promptStyles?.outro || ""
    };
} catch (e) {
    channelConfig = {
        voiceId: "w5eZjob1kXfLB9HjpFqU", voiceName: "ChulSu", logoUrl: "", logoOpacity: 0.7,
        bgmUrl: BGM_LIBRARY[category] || BGM_LIBRARY["default"], bgmVolume: 0.32,
        bgmFadeEffect: "fadeOut", introStyle: "", outroStyle: ""
    };
}

// ==================== 3) 채널별 베리에이션 ====================
const chNum = channelNumber;
const channelTransition = TRANSITION_PRESETS[chNum] || { in: "fade" };
const channelEffect = EFFECT_PRESETS[chNum] || "zoomIn";
const channelFilter = FILTER_PRESETS[chNum] || "none";
const channelStyle = STYLE_PRESETS[chNum] || { lineHeight: 1.80, letterSpacing: 2 };

// ==================== 4) 상수 ====================
const placeholderImage = "https://shotstack-assets.s3.ap-southeast-2.amazonaws.com/footage/beach-overhead.jpg";
const primaryFont = "https://autoshort.site/fonts/static/NotoSansKR-Bold.ttf";

// ==================== 5) 영상/이미지 URL ====================
let introVideoUrl = "";
try {
    const klingJson = $('Kling Polling Intro').first()?.json;
    const works = klingJson?.data?.output?.works;
    if (works && works.length > 0) {
        introVideoUrl = works[0]?.video?.resource || works[0]?.resource?.resource || "";
    }
    if (!introVideoUrl) {
        introVideoUrl = klingJson?.data?.output?.video_url || klingJson?.video_url || "";
    }
} catch (e) { }

let ttsAudioUrl = "";
try {
    try { ttsAudioUrl = $('Convert Audio').first()?.json?.url || ""; } catch (e1) { }
    if (!ttsAudioUrl) {
        try { ttsAudioUrl = $('Boost Body Audio').first()?.json?.url || ""; } catch (e2) { }
    }
    if (!ttsAudioUrl) {
        try { ttsAudioUrl = $('CP 저장 - TTS').first()?.json?.audio_url || ""; } catch (e3) { }
    }
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
    if (ttsAudioUrl && ttsAudioUrl.includes('.mpga')) {
        ttsAudioUrl = ttsAudioUrl.replace('.mpga', '.mp3');
    }
} catch (e) { }

// ==================== v20.39 동적 싱크: ElevenLabs alignment ====================
let alignment = null;
try {
    alignment = $('Decode Audio').first()?.json?.alignment;
} catch (e) { }

function getSentenceTimings(sentences, align) {
    if (!align || !align.characters || !align.character_start_times_seconds) return null;
    const chars = align.characters;
    const starts = align.character_start_times_seconds;
    const ends = align.character_end_times_seconds;
    const timings = [];
    let searchFrom = 0;

    for (const sentence of sentences) {
        const text = sentence.text || sentence;
        const cleanText = String(text).trim();
        if (!cleanText) continue;

        const searchChars = cleanText.replace(/[\s,.!?]/g, '').substring(0, 6);
        let foundIdx = -1;

        for (let i = searchFrom; i < chars.length - searchChars.length; i++) {
            let match = true;
            let ci = i, si = 0;
            while (si < searchChars.length && ci < chars.length) {
                if (chars[ci] === ' ' || chars[ci] === ',' || chars[ci] === '.' || chars[ci] === '!') { ci++; continue; }
                if (chars[ci] !== searchChars[si]) { match = false; break; }
                ci++; si++;
            }
            if (match && si === searchChars.length) { foundIdx = i; break; }
        }

        if (foundIdx >= 0) {
            const sentStart = starts[foundIdx];
            const sentEndIdx = Math.min(foundIdx + cleanText.length + 5, chars.length - 1);
            let sentEnd = ends[sentEndIdx] || ends[ends.length - 1];
            const lastChars = cleanText.replace(/[\s,.!?]/g, '').slice(-3);
            for (let j = Math.min(foundIdx + cleanText.length + 10, chars.length - 1); j >= foundIdx; j--) {
                if (chars[j] === lastChars[lastChars.length - 1]) { sentEnd = ends[j]; break; }
            }
            timings.push({ start: sentStart, end: sentEnd, duration: sentEnd - sentStart, text: cleanText });
            searchFrom = foundIdx + Math.floor(cleanText.length * 0.5);
        } else {
            const prevEnd = timings.length > 0 ? timings[timings.length - 1].end : 0;
            const estimatedDur = cleanText.length * 0.08;
            timings.push({ start: prevEnd, end: prevEnd + estimatedDur, duration: estimatedDur, text: cleanText });
            searchFrom = Math.min(searchFrom + cleanText.length, chars.length - 1);
        }
    }
    return timings;
}

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

// ==================== 6) 시간 배분 (v20.39: 13문장 동적 싱크!) ====================
const sentenceTimings = getSentenceTimings(segments, alignment);

// 🔥 TTS 실제 길이 추출 (alignment 마지막 시간)
let ttsRealLength = 60;  // 기본값
if (alignment && alignment.character_end_times_seconds && alignment.character_end_times_seconds.length > 0) {
    ttsRealLength = alignment.character_end_times_seconds[alignment.character_end_times_seconds.length - 1];
}

// 🔥 동적 영상 길이: TTS 길이 + 여유 2초 (최소 65초)
const TARGET_TOTAL = Math.max(65, Math.ceil(ttsRealLength) + 2);

let segmentStartTimes = [];
let segmentDurations = [];

if (sentenceTimings && sentenceTimings.length >= segments.length * 0.7) {
    // 동적 싱크 성공!
    for (let i = 0; i < segments.length; i++) {
        const timing = sentenceTimings[i];
        if (timing) {
            // 🔥 인트로 후킹(i=0)은 0초부터, 본문(i>=1)은 TTS 실제 시간 그대로 사용
            segmentStartTimes.push(timing.start);
            segmentDurations.push(Math.max(2, timing.duration));
        } else {
            const prevEnd = segmentStartTimes.length > 0
                ? segmentStartTimes[segmentStartTimes.length - 1] + segmentDurations[segmentDurations.length - 1]
                : 0;
            const estDur = (segments[i]?.text?.length || 20) * 0.08;
            segmentStartTimes.push(prevEnd);
            segmentDurations.push(Math.max(2, estDur));
        }
    }
} else {
    // 폴백: 균등 분배
    const totalChars = segments.reduce((sum, s) => sum + (s.text?.length || 0), 0);
    const rawTimes = segments.map(s => {
        const charCount = s.text?.length || 10;
        return Math.max(3, (charCount / totalChars) * ttsRealLength);
    });
    const rawTotal = rawTimes.reduce((a, b) => a + b, 0);
    const normalizedTimes = rawTimes.map(t => (t / rawTotal) * ttsRealLength);

    let acc = 0;
    for (let i = 0; i < normalizedTimes.length; i++) {
        segmentStartTimes.push(acc);
        segmentDurations.push(normalizedTimes[i]);
        acc += normalizedTimes[i];
    }
}

// ==================== 7) 줄바꿈 함수 ====================
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
            if (lastSpace >= cutPoint - 6 && lastSpace > 0) cutPoint = lastSpace;
            lines.push(remaining.substring(0, cutPoint).trim());
            remaining = remaining.substring(cutPoint).trim();
        }
    }
    return lines.join('\n');
}

// ==================== 8) 자막 클립 (v20.39: 13문장!) ====================
const subtitleClips = [];

// 🔥 인트로 타이틀 (기존 유지, 0~5초, 큰 폰트)
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

// 🔥 인트로 후킹 자막 (segments[0], 0~duration, 일반 폰트, 하단)
if (segments[0]) {
    const introHookText = String(segments[0]?.text || "").trim();
    if (introHookText) {
        const formattedText = formatSubtitle(introHookText);
        const lineCount = (formattedText.match(/\n/g) || []).length + 1;
        const dynamicHeight = Math.max(150, lineCount * 70 + 80);  // 인트로는 작게

        subtitleClips.push({
            asset: {
                type: "rich-text",
                text: formattedText,
                font: SUBTITLE_ABSOLUTE_RULES.font,
                style: { lineHeight: channelStyle.lineHeight, letterSpacing: channelStyle.letterSpacing },
                background: SUBTITLE_ABSOLUTE_RULES.background,
                align: { horizontal: "center", vertical: "middle" }
            },
            start: segmentStartTimes[0],  // 0초
            length: Math.min(INTRO_LEN, segmentDurations[0]),  // 최대 5초
            position: "center",
            width: SUBTITLE_ABSOLUTE_RULES.size.width,
            height: dynamicHeight,
            offset: { x: SUBTITLE_ABSOLUTE_RULES.position.offsetX, y: SUBTITLE_ABSOLUTE_RULES.position.offsetY }
        });
    }
}

// 🔥 본문 자막 (segments[1~12], TTS 실제 시간 기준)
for (let i = 1; i < segments.length; i++) {
    const rawText = String(segments[i]?.text || "").trim();
    if (!rawText) continue;

    const formattedText = formatSubtitle(rawText);
    const lineCount = (formattedText.match(/\n/g) || []).length + 1;
    const dynamicHeight = Math.max(250, lineCount * 90 + 100);

    subtitleClips.push({
        asset: {
            type: "rich-text",
            text: formattedText,
            font: SUBTITLE_ABSOLUTE_RULES.font,
            style: { lineHeight: channelStyle.lineHeight, letterSpacing: channelStyle.letterSpacing },
            background: SUBTITLE_ABSOLUTE_RULES.background,
            align: { horizontal: "center", vertical: "middle" }
        },
        start: segmentStartTimes[i],  // TTS 실제 시간
        length: segmentDurations[i],
        position: "center",
        width: SUBTITLE_ABSOLUTE_RULES.size.width,
        height: dynamicHeight,
        offset: { x: SUBTITLE_ABSOLUTE_RULES.position.offsetX, y: SUBTITLE_ABSOLUTE_RULES.position.offsetY }
        });
}

// ==================== 9) 비주얼 클립 (v20.39: 인트로 + 본문 12개) ====================
const visualClips = [];

// 🔥 인트로 (Kling 영상, 0~5초)
if (introVideoUrl) {
    visualClips.push({
        asset: { type: "video", src: introVideoUrl, volume: 0 },
        start: 0,
        length: INTRO_LEN,
        fit: "cover",
        transition: { in: "zoom" }
    });
} else {
    const introImage = isReverseMode && thumbnailImage ? thumbnailImage : (images[0] || placeholderImage);
    visualClips.push({
        asset: { type: "image", src: introImage },
        start: 0,
        length: INTRO_LEN,
        fit: "cover",
        transition: { in: "zoom" }
    });
}

// 🔥 본문 12 슬라이드 (segments[1~12], TTS 실제 시간 기준)
for (let i = 1; i < segments.length; i++) {
    const src = images[i-1] || images[images.length - 1] || placeholderImage;  // i=1이면 images[0]

    const clip = {
        asset: { type: "image", src: src },
        start: segmentStartTimes[i],  // TTS 실제 시간
        length: segmentDurations[i],
        fit: "cover",
        transition: channelTransition,
        effect: channelEffect
    };

    if (channelFilter !== "none") clip.filter = channelFilter;
    visualClips.push(clip);
}

// 🔥 마지막 슬라이드 연장 (TARGET_TOTAL까지)
if (visualClips.length > 1) {
    const lastClip = visualClips[visualClips.length - 1];
    const lastEnd = lastClip.start + lastClip.length;
    if (lastEnd < TARGET_TOTAL) {
        lastClip.length = TARGET_TOTAL - lastClip.start;
    }
}

// ==================== 10) 로고/워터마크 클립 ====================
const logoClips = [];

// ==================== 11) 오디오 클립 (v20.39: 0초부터 시작!) ====================
const audioClips = [];
if (ttsAudioUrl) {
    audioClips.push({
        asset: { type: "audio", src: ttsAudioUrl, volume: 1.0 },  // 🔥 TTS 볼륨 1.0 명시!
        start: 0,  // 🔥 인트로부터 시작! (기존 INTRO_LEN → 0)
        length: ttsRealLength  // 🔥 TTS 실제 길이
    });
}

// ==================== 12) Shotstack JSON 생성 ====================
const VALID_FADE_EFFECTS = ["fadeIn", "fadeOut", "fadeInFadeOut"];
let safeFadeEffect = channelConfig.bgmFadeEffect || "fadeOut";
if (!VALID_FADE_EFFECTS.includes(safeFadeEffect)) {
    safeFadeEffect = safeFadeEffect === "fadeInOut" ? "fadeInFadeOut" : "fadeOut";
}

const shotstackBody = {
    timeline: {
        soundtrack: {
            src: channelConfig.bgmUrl,
            effect: safeFadeEffect,
            volume: channelConfig.bgmVolume  // 🔥 0.30~0.40 (v5.1)
        },
        background: "#000000",
        fonts: [{ src: primaryFont }],
        tracks: [
            ...(logoClips.length ? [{ clips: logoClips }] : []),
            { clips: subtitleClips },
            { clips: visualClips },
            ...(audioClips.length ? [{ clips: audioClips }] : [])
        ]
    },
    output: {
        format: "mp4",
        resolution: "hd",
        aspectRatio: "9:16",
        fps: 30
    }
};

// ==================== 13) 출력 ====================
return [{
    json: {
        bodyString: JSON.stringify(shotstackBody),
        videoTitle,
        category,
        introTitle,
        introHookSpeech,  // 🔥 v6.18
        tags,
        script: gptData.script || "",
        intro_prompt: introVideoPrompt,
        image_prompts: segments.slice(1).map(s => s.image_prompt || ""),  // 본문 12개만
        thumbnailImage: thumbnailImage || (images[0] || ""),
        channelNumber,
        channelConfig: {
            voiceId: channelConfig.voiceId,
            voiceName: channelConfig.voiceName,
            hasLogo: !!channelConfig.logoUrl
        },
        maxRetries: 20,
        pollInterval: 5,
        hookType,
        isReverseMode,
        hasThumbnail: !!thumbnailImage,
        debug: {
            version: "20.39-INTRO-HOOK-TTS",
            buildDate: "2026-02-22",
            timeline: {
                introLen: INTRO_LEN,
                ttsRealLength: ttsRealLength,
                targetTotal: TARGET_TOTAL,
                note: "🔥 13문장 (인트로 후킹 + 본문 12), 동적 길이 조정!"
            },
            audioFix: {
                ttsStart: "0초 (인트로 포함!)",
                ttsVolume: 1.0,
                bgmVolume: channelConfig.bgmVolume,
                ratio: "TTS 1.0 : BGM 0.30~0.40 (-10dB)",
                note: "🔊 BGM 2배+ 상향, 들린다!"
            },
            subtitleRules: {
                fontSize: SUBTITLE_ABSOLUTE_RULES.font.size,
                width: SUBTITLE_ABSOLUTE_RULES.size.width,
                lineHeight: channelStyle.lineHeight,
                letterSpacing: channelStyle.letterSpacing,
                offsetY: SUBTITLE_ABSOLUTE_RULES.position.offsetY,
                bgOpacity: SUBTITLE_ABSOLUTE_RULES.background.opacity,
                note: "v19.4+v19.5 기반 + 채널별 Style"
            },
            channelVariation: {
                channelNumber: chNum,
                transition: channelTransition,
                effect: channelEffect,
                filter: channelFilter,
                style: channelStyle,
                bgmVolume: channelConfig.bgmVolume,
                note: "5가지 베리에이션"
            },
            segmentCount: segments.length,
            imagesFound: images.length,
            hasDynamicSync: !!(sentenceTimings && sentenceTimings.length > 0),
            alignmentSegments: sentenceTimings ? sentenceTimings.length : 0,
            hasIntroVideo: !!introVideoUrl,
            introHookIncluded: !!segments[0],
            parseErrors
        }
    }
}];
