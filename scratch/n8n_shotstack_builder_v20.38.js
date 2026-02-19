// ============================================================
// AIASF n8n Code Node - Shotstack JSON Builder
// v20.38 SOUNDTRACK-TRIM-FIX (2026-02-19)
// ============================================================
// 🔴 v19.4+v19.5 자막 절대 규칙 유지!
// ✅ 65초 = 인트로5s + 12슬라이드×5s (아웃트로 없음!)
// ✅ 12문장 GPT v6.17 완전 대응
// ✅ 21채널 5가지 베리에이션 (Transition/Effect/Filter/Style/BGM)
// ✅ Shotstack 폴링 루프 정상화 (maxRetries 제한)
// ============================================================
// 📋 검증 근거:
// - 위키 영상 구조: "65초 숏츠: AI 인트로(5s) + 12개 이미지(5s × 12 = 60s), 아웃트로 없음"
// - GPT v6.17: 12문장, 각 55-65자, 총 720자+
// - 위키 v20.31: 5가지 채널별 베리에이션
// - Shotstack API: status (queued→fetching→rendering→saving→done/failed)
// ============================================================

// ==================== 타임라인 설정 (위키 규칙 준수!) ====================
const INTRO_LEN = 5;          // 인트로 5초
const TARGET_TOTAL = 65;      // 🔴 65초! (위키 확정)
const BODY_LEN = TARGET_TOTAL - INTRO_LEN;  // 60초 (아웃트로 없음!)
const TARGET_SEGMENTS = 12;   // 🔴 12문장! (GPT v6.17)
const MAX_SEGMENTS = 12;
const MIN_SEGMENTS = 6;       // 최소 6문장 (폴백)

// ==================== 21채널 베리에이션 (v20.31 기반!) ====================
// 출처: 위키 v20.31 - YouTube 핑거프린트 회피용 5가지 차별화

// 1️⃣ Transition 베리에이션 (21개 고유 조합)
const TRANSITION_PRESETS = {
    1:  { in: "fade" },
    2:  { in: "zoom" },
    3:  { in: "slideLeft" },
    4:  { in: "slideRight" },
    5:  { in: "slideUp" },
    6:  { in: "slideDown" },
    7:  { in: "fade" },
    8:  { in: "zoom" },
    9:  { in: "slideLeft" },
    10: { in: "slideRight" },
    11: { in: "slideUp" },
    12: { in: "fade" },
    13: { in: "zoom" },
    14: { in: "slideDown" },
    15: { in: "slideLeft" },
    16: { in: "fade" },
    17: { in: "slideRight" },
    18: { in: "zoom" },
    19: { in: "slideUp" },
    20: { in: "slideDown" },
    21: { in: "slideLeft" }
};

// 2️⃣ Effect 베리에이션 (zoomIn/Out, slide + Fast/Slow)
const EFFECT_PRESETS = {
    1:  "zoomIn",
    2:  "zoomOut",
    3:  "slideLeft",
    4:  "slideRight",
    5:  "zoomInSlow",
    6:  "zoomOutSlow",
    7:  "slideLeftSlow",
    8:  "slideRightSlow",
    9:  "zoomIn",
    10: "zoomOut",
    11: "slideLeft",
    12: "slideRight",
    13: "zoomInSlow",
    14: "zoomOutSlow",
    15: "slideLeftSlow",
    16: "slideRightSlow",
    17: "zoomIn",
    18: "zoomOut",
    19: "slideLeft",
    20: "slideRight",
    21: "zoomInSlow"
};

// 3️⃣ Filter 베리에이션
const FILTER_PRESETS = {
    1:  "none",
    2:  "boost",
    3:  "contrast",
    4:  "lighten",
    5:  "muted",
    6:  "none",
    7:  "boost",
    8:  "contrast",
    9:  "lighten",
    10: "muted",
    11: "none",
    12: "boost",
    13: "contrast",
    14: "lighten",
    15: "muted",
    16: "none",
    17: "boost",
    18: "contrast",
    19: "lighten",
    20: "muted",
    21: "none"
};

// 4️⃣ Style 베리에이션 (자막 lineHeight/letterSpacing)
// 🔴 범위: lineHeight 1.70~1.90, letterSpacing 1~3 (위키 v20.31)
const STYLE_PRESETS = {
    1:  { lineHeight: 1.80, letterSpacing: 2 },
    2:  { lineHeight: 1.75, letterSpacing: 1 },
    3:  { lineHeight: 1.85, letterSpacing: 3 },
    4:  { lineHeight: 1.70, letterSpacing: 2 },
    5:  { lineHeight: 1.90, letterSpacing: 1 },
    6:  { lineHeight: 1.78, letterSpacing: 3 },
    7:  { lineHeight: 1.82, letterSpacing: 2 },
    8:  { lineHeight: 1.73, letterSpacing: 1 },
    9:  { lineHeight: 1.88, letterSpacing: 3 },
    10: { lineHeight: 1.76, letterSpacing: 2 },
    11: { lineHeight: 1.84, letterSpacing: 1 },
    12: { lineHeight: 1.71, letterSpacing: 3 },
    13: { lineHeight: 1.87, letterSpacing: 2 },
    14: { lineHeight: 1.74, letterSpacing: 1 },
    15: { lineHeight: 1.86, letterSpacing: 3 },
    16: { lineHeight: 1.79, letterSpacing: 2 },
    17: { lineHeight: 1.83, letterSpacing: 1 },
    18: { lineHeight: 1.72, letterSpacing: 3 },
    19: { lineHeight: 1.89, letterSpacing: 2 },
    20: { lineHeight: 1.77, letterSpacing: 1 },
    21: { lineHeight: 1.81, letterSpacing: 3 }
};

// ==================== 🔴 v19.4+v19.5 자막 절대 규칙 (변경 금지!) ====================
const SUBTITLE_ABSOLUTE_RULES = {
    font: {
        family: "Noto Sans KR",
        size: 48,              // 🔴 v19.5!
        color: "#ffffff",
        opacity: 1,
        weight: "700"
    },
    background: {
        color: "#000000",
        opacity: 0.7           // 🔴 v19.5!
    },
    size: {
        width: 850,            // 🔴 v19.7!
        height: 400
    },
    position: {
        offsetX: 0,
        offsetY: -0.15         // 🔴 v19.5!
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
        // GPT v6.17: 마침표로 구분된 12문장
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
        introTitle = gptData.intro_title || "";
        tags = gptData.tags || [category, "shorts", "5060", "시니어"];
    } else if (gptData.segments && Array.isArray(gptData.segments)) {
        segments = gptData.segments;
        videoTitle = gptData.youtube_title || gptData.title || "AI 숏츠";
        category = gptData.category || "default";
        hookType = gptData.hook_type || "";
        introVideoPrompt = gptData.intro_video_prompt || gptData.intro_prompt || "";
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
// 🔴 MAX 12개 (GPT v6.17 = 12문장!)
if (segments.length > MAX_SEGMENTS) segments = segments.slice(0, MAX_SEGMENTS);

// ==================== 2) 채널별 설정 (Branding Router v4) ====================
let channelNumber = 1;
let channelConfig = {};

try {
    const brandingData = $('Branding Router').first()?.json || {};
    channelNumber = brandingData.channelNumber || 1;
    channelConfig = {
        voiceId: brandingData.voice?.voiceId || "pNInz6obpgDQGcFmaJgB",
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
    channelConfig = {
        voiceId: "pNInz6obpgDQGcFmaJgB",
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

// ==================== 3) 채널별 베리에이션 가져오기 ====================
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
    // v20.36: PiAPI Kling = data.output.works[0].video.resource
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


// ==================== v20.36 동적 싱크: ElevenLabs alignment ====================
let alignment = null;
try {
    alignment = $('Decode Audio').first()?.json?.alignment;
} catch (e) { }

function getSentenceTimings(sentences, align) {
    if (!align || !align.characters || !align.character_start_times_seconds) {
        return null;
    }
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
            let ci = i;
            let si = 0;
            while (si < searchChars.length && ci < chars.length) {
                if (chars[ci] === ' ' || chars[ci] === ',' || chars[ci] === '.' || chars[ci] === '!') {
                    ci++;
                    continue;
                }
                if (chars[ci] !== searchChars[si]) {
                    match = false;
                    break;
                }
                ci++;
                si++;
            }
            if (match && si === searchChars.length) {
                foundIdx = i;
                break;
            }
        }

        if (foundIdx >= 0) {
            const sentStart = starts[foundIdx];
            const sentEndIdx = Math.min(foundIdx + cleanText.length + 5, chars.length - 1);
            let sentEnd = ends[sentEndIdx] || ends[ends.length - 1];
            const lastChars = cleanText.replace(/[\s,.!?]/g, '').slice(-3);
            for (let j = Math.min(foundIdx + cleanText.length + 10, chars.length - 1); j >= foundIdx; j--) {
                if (chars[j] === lastChars[lastChars.length - 1]) {
                    sentEnd = ends[j];
                    break;
                }
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

// ==================== 6) 시간 배분 (v20.36 동적 싱크!) ====================
const SUBTITLE_START = INTRO_LEN;
const segmentCount = segments.length || 1;

const sentenceTimings = getSentenceTimings(segments, alignment);
let segmentStartTimes = [];
let segmentDurations = [];

if (sentenceTimings && sentenceTimings.length >= segments.length * 0.7) {
    for (let i = 0; i < segments.length; i++) {
        const timing = sentenceTimings[i];
        if (timing) {
            segmentStartTimes.push(SUBTITLE_START + timing.start);
            segmentDurations.push(Math.max(2, timing.duration));
        } else {
            const prevEnd = segmentStartTimes.length > 0
                ? segmentStartTimes[segmentStartTimes.length - 1] + segmentDurations[segmentDurations.length - 1]
                : SUBTITLE_START;
            const estDur = (segments[i]?.text?.length || 20) * 0.08;
            segmentStartTimes.push(prevEnd);
            segmentDurations.push(Math.max(2, estDur));
        }
    }
} else {
    const totalChars = segments.reduce((sum, s) => sum + (s.text?.length || 0), 0);
    const rawTimes = segments.map(s => {
        const charCount = s.text?.length || 10;
        return Math.max(3, (charCount / totalChars) * BODY_LEN);
    });
    const rawTotal = rawTimes.reduce((a, b) => a + b, 0);
    const normalizedTimes = rawTimes.map(t => (t / rawTotal) * BODY_LEN);

    let acc = SUBTITLE_START;
    for (let i = 0; i < normalizedTimes.length; i++) {
        segmentStartTimes.push(acc);
        segmentDurations.push(normalizedTimes[i]);
        acc += normalizedTimes[i];
    }
}

const perSegmentTime = BODY_LEN / segmentCount;

// ==================== 7) 줄바꿈 함수 (v19.4!) ====================
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

// ==================== 8) 자막 클립 (v19.5 규칙 + 채널별 Style!) ====================
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

// 본문 자막 (v19.5 규칙 + 채널별 Style 베리에이션!)
for (let i = 0; i < segments.length; i++) {
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
            style: {
                lineHeight: channelStyle.lineHeight,       // ✅ 채널별!
                letterSpacing: channelStyle.letterSpacing   // ✅ 채널별!
            },
            background: SUBTITLE_ABSOLUTE_RULES.background,
            align: { horizontal: "center", vertical: "middle" }
        },
        start: segmentStartTimes[i],
        length: segmentDurations[i],
        position: "center",
        width: SUBTITLE_ABSOLUTE_RULES.size.width,
        height: dynamicHeight,
        offset: {
            x: SUBTITLE_ABSOLUTE_RULES.position.offsetX,
            y: SUBTITLE_ABSOLUTE_RULES.position.offsetY
        }
    });
}

// ==================== 9) 비주얼 클립 (채널별 Transition/Effect/Filter!) ====================
const visualClips = [];

// 인트로 (Kling 또는 이미지)
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

// 본문 12 슬라이드 (채널별 Transition + Effect + Filter!)
for (let i = 0; i < segments.length; i++) {
    const src = images[i] || images[images.length - 1] || placeholderImage;

    const clip = {
        asset: { type: "image", src: src },
        start: segmentStartTimes[i],
        length: segmentDurations[i],
        fit: "cover",
        transition: channelTransition,   // ✅ 채널별 트랜지션!
        effect: channelEffect            // ✅ 채널별 이펙트!
    };

    // ✅ 채널별 필터! (none이면 생략)
    if (channelFilter !== "none") {
        clip.filter = channelFilter;
    }

    visualClips.push(clip);
}

// 🔴 마지막 슬라이드를 TARGET_TOTAL까지 연장! (검은화면 방지!)
if (visualClips.length > 1) {
    const lastClip = visualClips[visualClips.length - 1];
    const lastEnd = lastClip.start + lastClip.length;
    if (lastEnd < TARGET_TOTAL) {
        lastClip.length = TARGET_TOTAL - lastClip.start;
    }
}

// ==================== 10) 로고/워터마크 클립 ====================
const logoClips = [];
// 🔴 v20.34: 로고 파일 미생성 → 스킵 (404 시 Shotstack 렌더 실패!)
// TODO: 로고 파일 생성 후 활성화
// if (channelConfig.logoUrl) {
//     logoClips.push({...});
// }

// ==================== 11) 오디오 클립 ====================
const TTS_OFFSET = 0;  // 🔴 v20.35: 인트로 끝나면 바로 TTS 시작 (싱크!)
const audioClips = [];
if (ttsAudioUrl) {
    audioClips.push({
        asset: { type: "audio", src: ttsAudioUrl },
        start: INTRO_LEN,  // v20.37: 인트로 끝나고 바로 시작
        length: TARGET_TOTAL  // v20.37: TTS 전체 재생 (65초) - 영상 끝까지!
    });
}

// ==================== 12) Shotstack JSON 생성 ====================
// fadeEffect 안전 변환
const VALID_FADE_EFFECTS = ["fadeIn", "fadeOut", "fadeInFadeOut"];
let safeFadeEffect = channelConfig.bgmFadeEffect || "fadeOut";
if (!VALID_FADE_EFFECTS.includes(safeFadeEffect)) {
    safeFadeEffect = safeFadeEffect === "fadeInOut" ? "fadeInFadeOut" : "fadeOut";
}

// 5️⃣ BGM 볼륨 = Branding Router에서 채널별로 받음 (0.13~0.18 범위)
const shotstackBody = {
    timeline: {
        soundtrack: {
            src: channelConfig.bgmUrl,
            effect: safeFadeEffect,
            volume: channelConfig.bgmVolume    // ✅ 채널별! (trim은 soundtrack에서 미지원 - v20.38 수정)
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
        tags,
        script: gptData.script || "",
        intro_prompt: introVideoPrompt,
        image_prompts: segments.map(s => s.image_prompt || ""),
        thumbnailImage: thumbnailImage || (images[0] || ""),
        // 채널 정보
        channelNumber,
        channelConfig: {
            voiceId: channelConfig.voiceId,
            voiceName: channelConfig.voiceName,
            hasLogo: !!channelConfig.logoUrl
        },
        // 폴링 제어 (n8n에서 참조)
        maxRetries: 20,        // 🔴 최대 20회 폴링 (5초×20=100초)
        pollInterval: 5,       // 5초 간격
        hookType,
        isReverseMode,
        hasThumbnail: !!thumbnailImage,
        debug: {
            version: "20.34-PHASE2-FULL",
            buildDate: "2026-02-09",
            timeline: {
                introLen: INTRO_LEN,
                bodyLen: BODY_LEN,
                targetTotal: TARGET_TOTAL,
                outroLen: 0,
                note: "🔴 65초 = 인트로5s + 12슬라이드 60s, 아웃트로 없음!"
            },
            subtitleRules: {
                fontSize: SUBTITLE_ABSOLUTE_RULES.font.size,
                width: SUBTITLE_ABSOLUTE_RULES.size.width,
                lineHeight: channelStyle.lineHeight,
                letterSpacing: channelStyle.letterSpacing,
                offsetY: SUBTITLE_ABSOLUTE_RULES.position.offsetY,
                bgOpacity: SUBTITLE_ABSOLUTE_RULES.background.opacity,
                note: "🔴 v19.4+v19.5 기반 + 채널별 Style 베리에이션!"
            },
            channelVariation: {
                channelNumber: chNum,
                transition: channelTransition,
                effect: channelEffect,
                filter: channelFilter,
                style: channelStyle,
                bgmVolume: channelConfig.bgmVolume,
                bgmTrim: channelConfig.bgmTrim,
                note: "✅ 5가지 베리에이션: Transition/Effect/Filter/Style/BGM"
            },
            segmentCount: segments.length,
            imagesFound: images.length,
            hasDynamicSync: !!(sentenceTimings && sentenceTimings.length > 0),
            alignmentSegments: sentenceTimings ? sentenceTimings.length : 0,
            hasIntroVideo: !!introVideoUrl,
            parseErrors
        }
    }
}];
