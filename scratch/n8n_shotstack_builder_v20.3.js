// ============================================================
// AIASF n8n Code Node - Shotstack JSON Builder
// v20.5 TTS-SYNC-FIX + SLIDE-FIX (2026-01-13)
// ============================================================
// 🔥 v20.5 수정사항:
// 1. TTS 오프셋 3.5초로 변경 (이미지/자막보다 3.5초 늦게 시작)
// 2. 마지막 이미지 정확한 타이밍 (10초 표시 문제 해결)
// 3. 스크립트 45초 전체 재생 보장
// ============================================================

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
const OUTRO_LEN = 0;  // v20.4: 아웃트로 제거! ($384/월 절감)
const TARGET_TOTAL = 50;
const BODY_LEN = TARGET_TOTAL - INTRO_LEN - OUTRO_LEN;  // = 45초
const MIN_SEGMENTS = 6;
const MAX_SEGMENTS = 10;
const TARGET_SEGMENTS = 8;  // v20.2: 8개로 변경

// ==================== v20.2: 트랜지션 비활성화! ====================
// ⚠️ 트랜지션이 자막 렌더링에 영향을 주는 문제 발견!
const DISABLE_TRANSITIONS = true;  // true = 트랜지션 제거

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
let introTitle = "";  // v19.5: 인트로 타이틀!
let tags = [];  // v19.5: 자동 태그!
let parseErrors = [];
let isReverseMode = false;  // v18.1 역발상 모드 플래그

try {
    const gptContent = $('3. GPT 스크립트').first()?.json?.message?.content || "";
    gptData = safeParseJSON(gptContent, {});

    // v18.1: 역발상 모드 감지 (image_analysis 필드가 있으면 역발상)
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

        // v20.2: 인트로 타이틀 폴백 강화!
        introTitle = gptData.intro_title || videoTitle.substring(0, 15) || "건강 비법!";

        tags = gptData.tags || [category, "shorts", "5060", "시니어", "건강정보"];
    } else if (gptData.segments && Array.isArray(gptData.segments)) {
        segments = gptData.segments;
        videoTitle = gptData.youtube_title || gptData.title || "AI 숏츠";
        category = gptData.category || "default";
        hookType = gptData.hook_type || "";
        introVideoPrompt = gptData.intro_video_prompt || gptData.intro_prompt || "";
        outroVideoPrompt = gptData.outro_video_prompt || gptData.outro_prompt || "";
        introTitle = gptData.intro_title || videoTitle.substring(0, 15) || "건강 비법!";
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
            introTitle = parsed.intro_title || videoTitle.substring(0, 15) || "건강 비법!";
        }
    } catch (e) { }
}

if (segments.length === 0) {
    segments = [{ text: "콘텐츠를 로드할 수 없습니다.", image_prompt: "" }];
}
if (segments.length > MAX_SEGMENTS) segments = segments.slice(0, MAX_SEGMENTS);

const bgmUrl = BGM_LIBRARY[category] || BGM_LIBRARY["default"];

// ==================== 2) 상수 ====================
const placeholderImage = "https://shotstack-assets.s3.ap-southeast-2.amazonaws.com/footage/beach-overhead.jpg";
const primaryFont = "https://autoshort.site/fonts/static/NotoSansKR-Bold.ttf";

// ==================== v19.5 자막 절대적 규칙 ====================
const SUBTITLE_ABSOLUTE_RULES = {
    font: {
        family: "Noto Sans KR",
        size: 48,
        color: "#ffffff",
        opacity: 1,
        weight: "700"
    },
    style: {
        lineHeight: 1.8,
        letterSpacing: 2
    },
    background: {
        color: "#000000",
        opacity: 0.7
    },
    size: {
        width: 850,
        height: 400
    },
    position: {
        offsetX: 0,
        offsetY: -0.25
    },
    maxLines: 3
};

// ==================== 3) 영상/이미지 URL ====================
let introVideoUrl = "";
try { introVideoUrl = $('Kling Polling Intro').first()?.json?.data?.output?.video_url || ""; } catch (e) { }

// v20.4: 아웃트로 URL은 OUTRO_LEN > 0일 때만 가져옴
let outroVideoUrl = "";
if (OUTRO_LEN > 0) {
    try { outroVideoUrl = $('Kling Polling Outro').first()?.json?.data?.output?.video_url || ""; } catch (e) { }
}

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

// v18.1: 역발상 모드 - 썸네일 이미지 우선 처리
let thumbnailImage = "";
try {
    thumbnailImage = $('DALL-E Thumbnail').first()?.json?.data?.[0]?.url || "";
} catch (e) { }

// ==================== 4) 시간 배분 (동적 글자수 기반!) ====================
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

// ==================== 5) 줄바꿈 함수 ====================
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

// ==================== 6) 자막 클립 ====================
const subtitleClips = [];

// v20.2: 인트로 타이틀 클립 (반드시 표시!)
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
    const dynamicHeight = Math.max(200, lineCount * 100 + 50);

    subtitleClips.push({
        asset: {
            type: "rich-text",
            text: formattedText,
            font: SUBTITLE_ABSOLUTE_RULES.font,
            style: SUBTITLE_ABSOLUTE_RULES.style,
            background: SUBTITLE_ABSOLUTE_RULES.background,
            align: { horizontal: "center", vertical: "middle" }
        },
        start: segmentStartTimes[i] || (SUBTITLE_START + i * perSegmentTime),
        length: segmentTimes[i] || perSegmentTime,
        position: "center",
        width: SUBTITLE_ABSOLUTE_RULES.size.width,
        height: dynamicHeight,
        offset: {
            x: SUBTITLE_ABSOLUTE_RULES.position.offsetX,
            y: SUBTITLE_ABSOLUTE_RULES.position.offsetY
        }
    });
}

// ==================== 7) 비주얼 클립 (v20.2: 트랜지션 조건부!) ====================
const visualClips = [];

// 인트로
if (introVideoUrl) {
    const introClip = {
        asset: { type: "video", src: introVideoUrl, volume: 0 },
        start: 0,
        length: INTRO_LEN,
        fit: "cover"
    };
    // v20.2: 트랜지션 비활성화 옵션
    if (!DISABLE_TRANSITIONS) {
        introClip.transition = { in: "zoom" };
    }
    visualClips.push(introClip);
} else {
    const introImage = isReverseMode && thumbnailImage ? thumbnailImage : (images[0] || placeholderImage);
    const introClip = {
        asset: { type: "image", src: introImage },
        start: 0,
        length: INTRO_LEN,
        fit: "cover"
    };
    if (!DISABLE_TRANSITIONS) {
        introClip.transition = { in: "zoom" };
    }
    visualClips.push(introClip);
}

// 본문 슬라이드 (v20.4: 동적 타이밍으로 자막-이미지-TTS 완벽 싱크!)
for (let i = 0; i < segments.length; i++) {
    const src = images[i] || images[images.length - 1] || placeholderImage;
    const slideClip = {
        asset: { type: "image", src },
        start: segmentStartTimes[i],  // v20.4: 동적 시작 시간 (자막과 동일)
        length: segmentTimes[i],       // v20.4: 동적 길이 (글자수 비례)
        fit: "cover"
    };
    // v20.2: 트랜지션 비활성화 옵션
    if (!DISABLE_TRANSITIONS) {
        if (i === 0 || i === segments.length - 1) {
            slideClip.transition = { in: "zoom" };
        } else {
            slideClip.transition = { in: "fade" };
        }
    }
    visualClips.push(slideClip);
}

// v20.4: 아웃트로 조건부 (OUTRO_LEN > 0일 때만 실행!)
if (OUTRO_LEN > 0) {
    const outroStart = INTRO_LEN + (segments.length * perSegmentTime);
    if (outroVideoUrl) {
        const outroClip = {
            asset: { type: "video", src: outroVideoUrl, volume: 0 },
            start: outroStart,
            length: OUTRO_LEN,
            fit: "cover"
        };
        if (!DISABLE_TRANSITIONS) {
            outroClip.transition = { in: "fade" };
        }
        visualClips.push(outroClip);
    } else {
        const outroClip = {
            asset: { type: "image", src: images[images.length - 1] || placeholderImage },
            start: outroStart,
            length: OUTRO_LEN,
            fit: "cover"
        };
        if (!DISABLE_TRANSITIONS) {
            outroClip.transition = { in: "fade" };
        }
        visualClips.push(outroClip);
    }
}

// v20.5: TTS 오프셋 조정 (TTS가 3.5초 빨랐음 → 3.5초 늦게 시작)
const TTS_OFFSET = -3.5;  // 음수 = TTS가 늦게 시작
const audioClips = [];
// v20.5: TTS 시작시간 조정 (TTS_OFFSET이 음수면 늦게 시작)
const ttsStart = INTRO_LEN + Math.abs(TTS_OFFSET);  // 5 + 3.5 = 8.5초에 시작
if (ttsAudioUrl) audioClips.push({ asset: { type: "audio", src: ttsAudioUrl }, start: ttsStart, length: BODY_LEN });

// ==================== 9) Shotstack JSON ====================
const shotstackBody = {
    timeline: {
        soundtrack: { src: bgmUrl, effect: "fadeOut", volume: 0.25 },
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
            version: "20.5-TTS-SYNC-FIX-v2",
            hookType,
            isReverseMode,
            hasThumbnail: !!thumbnailImage,
            segmentCount: segments.length,
            imagesFound: images.length,
            hasIntroVideo: !!introVideoUrl,
            hasOutroVideo: !!outroVideoUrl,
            hasIntroTitle: !!introTitle,
            transitionsDisabled: DISABLE_TRANSITIONS,
            parseErrors
        }
    }
}];
