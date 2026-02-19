// ============================================================
// AIASF n8n Code Node - Shotstack JSON Builder
// v20.0 ULTIMATE-ENHANCEMENT (2026-01-08)
// ============================================================
// 🔥 v20.0 변경사항:
// 1. 시간 정규화 (총합 = BODY_LEN 보장)
// 2. 비주얼↔자막 동적 시간 동기화
// 3. 아웃트로 시작 시간 동적 계산
// 4. BGM 감정 연동 (4구간 볼륨 + trim)
// 5. 효과음 레이어 (옵션)
// 6. TTS offset 안전장치
// 7. 100% 방어적 코드 (모든 참조 안전!)
// ============================================================

// ==================== 🛡️ 안전한 노드 참조 함수 ====================
// 노드 이름이 없거나 다르면 null 반환 (오류 없이 진행!)
function safeGetNode(nodeName) {
    try {
        const node = $(nodeName);
        if (!node || typeof node.first !== 'function') return null;
        return node.first()?.json || null;
    } catch (e) {
        return null;
    }
}

// ==================== 라이브러리 설정 ====================
const BGM_LIBRARY = {
    "건강": "https://autoshort.site/bgm/health_calm.mp3",
    "재테크": "https://autoshort.site/bgm/finance_upbeat.mp3",
    "운동": "https://autoshort.site/bgm/exercise_energetic.mp3",
    "음식": "https://autoshort.site/bgm/food_cozy.mp3",
    "노후": "https://autoshort.site/bgm/lifestyle_peaceful.mp3",
    "국뽕": "https://autoshort.site/bgm/korea_pride.mp3",
    "default": "https://autoshort.site/bgm/default_warm.mp3"
};

// v20.0: 효과음 라이브러리 (대표님 파일 업로드 후 사용)
// ⚠️ 외부 CDN은 직접 링크 불가 → 서버에 직접 업로드 필요!
const SFX_LIBRARY = {
    "impact": "https://autoshort.site/sfx/sfx_impact.mp3",
    "ding": "https://autoshort.site/sfx/sfx_ding.mp3",
    "whoosh": "https://autoshort.site/sfx/sfx_whoosh.mp3"
};
const ENABLE_SFX = true;  // ✅ 활성화 완료!

// v20.0: BGM 감정 연동 볼륨 설정
const BGM_VOLUME_CONFIG = {
    intro: 0.15,     // 인트로: 낮게 (TTS 강조)
    body: 0.25,      // 본문: 보통
    climax: 0.35,    // CTA직전: 높게 (감성 UP)
    outro: 0.4       // 아웃트로: 최고 (따뜻한 마무리)
};

// ==================== 타임라인 설정 ====================
const INTRO_LEN = 5;
const OUTRO_LEN = 5;
const TARGET_TOTAL = 50;
const BODY_LEN = TARGET_TOTAL - INTRO_LEN - OUTRO_LEN;  // 40초
const MIN_SEGMENTS = 6;
const MAX_SEGMENTS = 10;
const TARGET_SEGMENTS = 8;
const TTS_OFFSET = 4;  // TTS 앞당김 (초)

// ==================== 줌 트랜지션 설정 ====================
// v20.1: 🧪 테스트 - 트랜지션 제거하여 자막 문제 원인 파악!
// 문제가 해결되면 트랜지션이 원인, 안 해결되면 다른 원인
const DISABLE_TRANSITIONS = true;  // 🔧 테스트용! 해결되면 false로 변경

const TRANSITION_CONFIG = DISABLE_TRANSITIONS ? {
    firstSlide: null,
    middleSlide: null,
    lastSlide: null,
    intro: null,
    outro: null
} : {
    firstSlide: { in: "zoomFast" },
    middleSlide: { in: "fadeFast" },
    lastSlide: { in: "zoomFast" },
    intro: { in: "zoomFast" },
    outro: { in: "fadeFast" }
};

// ==================== 자막 절대 규칙 ====================
const SUBTITLE_RULES = {
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
        heightPerLine: 100,
        minHeight: 200,
        padding: 50
    },
    position: {
        offsetX: 0,
        offsetY: -0.25
    },
    maxCharsPerLine: 14
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

// ==================== 줄바꿈 함수 ====================
function formatSubtitle(text) {
    if (!text) return "";
    const cleanText = String(text).trim();
    const MAX_CHARS = SUBTITLE_RULES.maxCharsPerLine;
    const lines = [];
    let remaining = cleanText;

    while (remaining.length > 0) {
        if (remaining.length <= MAX_CHARS) {
            lines.push(remaining);
            break;
        }
        let cutPoint = MAX_CHARS;
        const searchRange = remaining.substring(0, cutPoint + 5);
        const lastSpace = searchRange.lastIndexOf(' ');
        if (lastSpace >= cutPoint - 6 && lastSpace > 0) {
            cutPoint = lastSpace;
        }
        lines.push(remaining.substring(0, cutPoint).trim());
        remaining = remaining.substring(cutPoint).trim();
    }
    return lines.join('\n');
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
    // 🛡️ v20.0: 여러 가능한 노드 이름 시도! (오류 방지)
    const possibleGptNodes = ['3. GPT 스크립트', 'GPT 스크립트', 'GPT Script', 'OpenAI Chat'];
    let gptContent = "";
    for (const nodeName of possibleGptNodes) {
        try {
            const nodeData = safeGetNode(nodeName);
            if (nodeData?.message?.content) {
                gptContent = nodeData.message.content;
                break;
            }
        } catch (e) { /* 다음 노드 시도 */ }
    }
    if (!gptContent) {
        // 마지막 시도: 직접 참조
        gptContent = $('3. GPT 스크립트').first()?.json?.message?.content || "";
    }
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
    } catch (e) { parseErrors.push("Fallback parse failed: " + e.message); }
}

if (segments.length === 0) {
    segments = [{ text: "콘텐츠를 로드할 수 없습니다.", image_prompt: "" }];
}
if (segments.length > MAX_SEGMENTS) segments = segments.slice(0, MAX_SEGMENTS);

const bgmUrl = BGM_LIBRARY[category] || BGM_LIBRARY["default"];

// ==================== 2) 상수 ====================
const placeholderImage = "https://shotstack-assets.s3.ap-southeast-2.amazonaws.com/footage/beach-overhead.jpg";
const primaryFont = "https://autoshort.site/fonts/static/NotoSansKR-Bold.ttf";

// ==================== 3) 영상/이미지 URL (🛡️ 안전한 참조!) ====================
// 가능한 노드 이름 목록으로 시도
let introVideoUrl = "";
const introNodes = ['Kling Polling Intro', 'Kling Intro', 'Intro Video'];
for (const n of introNodes) {
    const data = safeGetNode(n);
    if (data?.data?.output?.video_url) { introVideoUrl = data.data.output.video_url; break; }
}

let outroVideoUrl = "";
const outroNodes = ['Kling Polling Outro', 'Kling Outro', 'Outro Video'];
for (const n of outroNodes) {
    const data = safeGetNode(n);
    if (data?.data?.output?.video_url) { outroVideoUrl = data.data.output.video_url; break; }
}

let ttsAudioUrl = "";
const audioNodes = ['Save Audio', 'TTS Audio', 'Typecast'];
for (const n of audioNodes) {
    const data = safeGetNode(n);
    if (data?.fileName) {
        const fileName = data.fileName.split('/').pop();
        if (fileName) { ttsAudioUrl = `https://autoshort.site/audio/${fileName}`; break; }
    }
}

let images = [];
const imageNodes = ['Merge Images', 'DALL-E Images', 'Images'];
for (const n of imageNodes) {
    const data = safeGetNode(n);
    if (data?.images && Array.isArray(data.images)) {
        images = data.images.map(item => {
            if (typeof item === 'string') return item;
            return item?.url || item?.src || "";
        }).filter(Boolean);
        if (images.length > 0) break;
    }
}

let thumbnailImage = "";
const thumbNodes = ['DALL-E Thumbnail', 'Thumbnail', 'OpenAI Image'];
for (const n of thumbNodes) {
    const data = safeGetNode(n);
    if (data?.data?.[0]?.url) { thumbnailImage = data.data[0].url; break; }
}

// ==================== 4) 시간 배분 (v20.0 정규화!) ====================
const SUBTITLE_START = INTRO_LEN;
const segmentCount = segments.length || 1;

// 총 글자수 계산
const totalChars = segments.reduce((sum, s) => sum + (s.text?.length || 0), 0) || 1;

// 비율 기반 시간 계산 (최소 3초 보장)
let rawTimes = segments.map((s) => {
    const charCount = s.text?.length || 10;
    const ratio = charCount / totalChars;
    return Math.max(3, ratio * BODY_LEN);
});

// v20.0: 총합이 BODY_LEN이 되도록 정규화!
const rawTotal = rawTimes.reduce((a, b) => a + b, 0) || 1;
const segmentTimes = rawTimes.map(t => t * (BODY_LEN / rawTotal));

// 시작 시간 누적 계산
const segmentStartTimes = [];
let accumulatedTime = SUBTITLE_START;
for (let i = 0; i < segmentTimes.length; i++) {
    segmentStartTimes.push(accumulatedTime);
    accumulatedTime += segmentTimes[i];
}

// v20.0: 아웃트로 시작 = 마지막 자막 끝나는 시점!
const outroStart = accumulatedTime;

// 폴백용 균등 시간 (사용하지 않지만 안전장치)
const perSegmentTime = BODY_LEN / segmentCount;

// ==================== 5) 자막 클립 생성 ====================
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
    const dynamicHeight = Math.max(
        SUBTITLE_RULES.size.minHeight,
        lineCount * SUBTITLE_RULES.size.heightPerLine + SUBTITLE_RULES.size.padding
    );

    subtitleClips.push({
        asset: {
            type: "rich-text",
            text: formattedText,
            font: SUBTITLE_RULES.font,
            style: SUBTITLE_RULES.style,
            background: SUBTITLE_RULES.background,
            align: { horizontal: "center", vertical: "middle" }
        },
        start: segmentStartTimes[i],
        length: segmentTimes[i],
        position: "center",
        width: SUBTITLE_RULES.size.width,
        height: dynamicHeight,
        offset: {
            x: SUBTITLE_RULES.position.offsetX,
            y: SUBTITLE_RULES.position.offsetY
        }
    });
}

// ==================== 6) 비주얼 클립 생성 (v20.0: 동적 시간!) ====================
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
    const introClip = {
        asset: { type: "video", src: introVideoUrl, volume: 0 },
        start: 0,
        length: INTRO_LEN,
        fit: "cover"
    };
    if (TRANSITION_CONFIG.intro) introClip.transition = TRANSITION_CONFIG.intro;
    visualClips.push(introClip);
} else {
    const introImage = isReverseMode && thumbnailImage ? thumbnailImage : (images[0] || placeholderImage);
    const introClip = {
        asset: { type: "image", src: introImage },
        start: 0,
        length: INTRO_LEN,
        fit: "cover"
    };
    if (TRANSITION_CONFIG.intro) introClip.transition = TRANSITION_CONFIG.intro;
    visualClips.push(introClip);
}

// 본문 슬라이드 (v20.0: 동적 시간!)
for (let i = 0; i < segments.length; i++) {
    const src = images[i] || images[images.length - 1] || placeholderImage;
    const trans = getTransition(i, segments.length, 'slide');

    const slideClip = {
        asset: { type: "image", src },
        start: segmentStartTimes[i],  // v20.0: 동적 시간!
        length: segmentTimes[i],      // v20.0: 동적 시간!
        fit: "cover"
    };
    if (trans) slideClip.transition = trans;
    visualClips.push(slideClip);
}

// 아웃트로
if (outroVideoUrl) {
    const outroClip = {
        asset: { type: "video", src: outroVideoUrl, volume: 0 },
        start: outroStart,
        length: OUTRO_LEN,
        fit: "cover"
    };
    if (TRANSITION_CONFIG.outro) outroClip.transition = TRANSITION_CONFIG.outro;
    visualClips.push(outroClip);
} else {
    const outroClip = {
        asset: { type: "image", src: images[images.length - 1] || placeholderImage },
        start: outroStart,
        length: OUTRO_LEN,
        fit: "cover"
    };
    if (TRANSITION_CONFIG.outro) outroClip.transition = TRANSITION_CONFIG.outro;
    visualClips.push(outroClip);
}

// ==================== 7) TTS 오디오 클립 (v20.0: 안전장치!) ====================
const audioClips = [];
const ttsStart = Math.max(0, INTRO_LEN - TTS_OFFSET);  // 음수 방지!
if (ttsAudioUrl) {
    audioClips.push({
        asset: { type: "audio", src: ttsAudioUrl, volume: 1 },
        start: ttsStart,
        length: BODY_LEN + Math.min(TTS_OFFSET, INTRO_LEN)  // 길이도 안전하게!
    });
}

// ==================== 8) BGM 클립 (v20.0: 감정 연동 + trim!) ====================
const bgmClips = [
    // 인트로 구간 (0 ~ INTRO_LEN)
    {
        asset: { type: "audio", src: bgmUrl, volume: BGM_VOLUME_CONFIG.intro, trim: 0 },
        start: 0,
        length: INTRO_LEN
    },
    // 본문 구간 (INTRO_LEN ~ outroStart - 5)
    {
        asset: { type: "audio", src: bgmUrl, volume: BGM_VOLUME_CONFIG.body, trim: INTRO_LEN },
        start: INTRO_LEN,
        length: Math.max(1, outroStart - INTRO_LEN - 5)  // 최소 1초!
    },
    // 클라이맥스 구간 (outroStart - 5 ~ outroStart)
    {
        asset: { type: "audio", src: bgmUrl, volume: BGM_VOLUME_CONFIG.climax, trim: Math.max(0, outroStart - 5) },
        start: Math.max(INTRO_LEN, outroStart - 5),
        length: Math.min(5, outroStart - INTRO_LEN)  // 안전장치!
    },
    // 아웃트로 구간 (outroStart ~ 끝)
    {
        asset: { type: "audio", src: bgmUrl, volume: BGM_VOLUME_CONFIG.outro, trim: outroStart },
        start: outroStart,
        length: OUTRO_LEN
    }
];

// ==================== 9) 효과음 클립 (옵션) ====================
const sfxClips = [];
if (ENABLE_SFX) {
    // 인트로 임팩트
    sfxClips.push({
        asset: { type: "audio", src: SFX_LIBRARY.impact, volume: 0.5 },
        start: 0,
        length: 1
    });

    // 슬라이드 전환마다 띠링
    for (let i = 1; i < segments.length; i++) {
        sfxClips.push({
            asset: { type: "audio", src: SFX_LIBRARY.ding, volume: 0.3 },
            start: Math.max(0, segmentStartTimes[i] - 0.2),
            length: 0.5
        });
    }

    // CTA 우웅
    sfxClips.push({
        asset: { type: "audio", src: SFX_LIBRARY.whoosh, volume: 0.4 },
        start: Math.max(0, outroStart - 0.5),
        length: 1
    });
}

// ==================== 10) Shotstack JSON 생성 ====================
// ⚠️ v20.0 중요: Shotstack tracks 배열에서 마지막 트랙이 최상위 레이어!
// 순서: BGM(최하위) → 효과음 → TTS → 비주얼 → 자막(최상위)
const shotstackBody = {
    timeline: {
        background: "#000000",
        fonts: [{ src: primaryFont }],
        tracks: [
            { clips: bgmClips },        // 1번째 = 최하위 (BGM)
            ...(sfxClips.length ? [{ clips: sfxClips }] : []),   // 효과음
            ...(audioClips.length ? [{ clips: audioClips }] : []), // TTS
            { clips: visualClips },     // 비주얼
            { clips: subtitleClips }    // 마지막 = 최상위 (자막!)
        ]
    },
    output: { format: "mp4", resolution: "hd", aspectRatio: "9:16", fps: 30 }
};

// ==================== 11) 출력 ====================
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
            version: "20.0-BULLETPROOF",  // 방탄 버전!
            hookType,
            isReverseMode,
            // 🛡️ 모든 참조 상태 (문제 즉시 파악!)
            nodeStatus: {
                gptScript: !!gptData.script,
                introVideo: !!introVideoUrl,
                outroVideo: !!outroVideoUrl,
                ttsAudio: !!ttsAudioUrl,
                images: images.length,
                thumbnail: !!thumbnailImage
            },
            // URL 확인용 (디버깅!)
            urls: {
                bgm: bgmUrl,
                font: primaryFont,
                tts: ttsAudioUrl || "없음",
                intro: introVideoUrl || "없음",
                outro: outroVideoUrl || "없음",
                firstImage: images[0] || "placeholder 사용"
            },
            timing: {
                introLen: INTRO_LEN,
                bodyLen: BODY_LEN,
                outroLen: OUTRO_LEN,
                outroStart: Math.round(outroStart * 100) / 100,
                totalExpected: Math.round((outroStart + OUTRO_LEN) * 100) / 100,
                segmentTimes: segmentTimes.map(t => Math.round(t * 100) / 100),
                segmentStarts: segmentStartTimes.map(t => Math.round(t * 100) / 100)
            },
            bgmVolumes: BGM_VOLUME_CONFIG,
            enableSFX: ENABLE_SFX,
            parseErrors,
            // 🔥 문제 발생 시 확인!
            checksumOK: Boolean(segments.length > 0 && bgmUrl && primaryFont)
        }
    }
}];
