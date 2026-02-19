// ============================================================
// AIASF n8n Code Node - Shotstack JSON Builder
// v19.9 DYNAMIC-SYNC (2026-01-07)
// ============================================================
// 🔥 v19.5 자막 최종 규칙 (버그 수정!):
// 1. Font: Noto Sans KR, 48px, Bold, lineHeight 1.8
// 2. letterSpacing: 2px (이모지 겹침 방지)
// 3. Background: black, opacity 0.7
// 4. Width: 900px (1080-90*2), Height: 동적
// 5. offsetY: -0.25, 줄 수 제한 없음
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
const OUTRO_LEN = 5;
const TARGET_TOTAL = 50;
const BODY_LEN = TARGET_TOTAL - INTRO_LEN - OUTRO_LEN;
const MIN_SEGMENTS = 6;
const MAX_SEGMENTS = 10;
const TARGET_SEGMENTS = 6;

// ==================== v18.2 줌 트랜지션 설정 (API 검증 완료) ====================
// ⚠️ Shotstack 공식 트랜지션: fade, zoom, reveal, wipeLeft/Right, slideLeft/Right/Up/Down, carousel*, shuffle*
// ⚠️ 주의: zoomFast는 무효! zoom만 존재 (기본이 fast zoom)
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
        // v19.5: intro_video_prompt 우선 체크!
        introVideoPrompt = gptData.intro_video_prompt || gptData.intro_prompt || "";
        outroVideoPrompt = gptData.outro_video_prompt || gptData.outro_prompt || "";
        // v19.5: 인트로 타이틀 추가!
        introTitle = gptData.intro_title || "";
        // v19.5: 자동 태그!
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

const bgmUrl = BGM_LIBRARY[category] || BGM_LIBRARY["default"];

// ==================== 2) 상수 ====================
const placeholderImage = "https://shotstack-assets.s3.ap-southeast-2.amazonaws.com/footage/beach-overhead.jpg";
const primaryFont = "https://autoshort.site/fonts/static/NotoSansKR-Bold.ttf";

// ==================== v19.5 자막 절대적 규칙 (버그 수정!) ====================
// ⚠️ v19.5 수정사항:
// - 폰트 60→48px (이모지 겹침 방지)
// - 폭 1000→900px (좌우 여백 확보)
// - letterSpacing 추가 (자간 개선)
const SUBTITLE_ABSOLUTE_RULES = {
    font: {
        family: "Noto Sans KR",      // 폰트: Noto Sans KR
        size: 48,                     // v19.5: 60→48px (이모지 겹침 방지!)
        color: "#ffffff",             // 색상: 흰색
        opacity: 1,                   // 투명도: 1
        weight: "700"                 // Bold로 변경 (가독성)
        // ⚠️ stroke: 제거! (중요!!!)
    },
    style: {
        lineHeight: 1.8,              // v19.5: 1.6→1.8 (줄간격 증가)
        letterSpacing: 2              // v19.5: 자간 추가 (이모지 겹침 방지!)
    },
    background: {
        color: "#000000",             // 배경: 검정
        opacity: 0.7                  // v19.5: 0.6→0.7 (더 진하게)
    },
    size: {
        width: 850,                   // v19.7: 900→850 (이모지 짤림 방지!)
        height: 400                   // 높이: 400
    },
    position: {
        offsetX: 0,                   // X 오프셋: 0
        offsetY: -0.25                // v19.5: -0.23→-0.25 (더 위로)
    },
    maxLines: 3                       // 한 화면 최대 3줄
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

// v18.1: 역발상 모드 - 썸네일 이미지 우선 처리
let thumbnailImage = "";
try {
    thumbnailImage = $('DALL-E Thumbnail').first()?.json?.data?.[0]?.url || "";
} catch (e) { }

// ==================== 4) 시간 배분 (v19.9 동적 글자수 기반!) ====================
const SUBTITLE_START = INTRO_LEN;
const segmentCount = segments.length || 1;

// v19.9: 글자 수 기반 동적 시간 배분 - 물흐르듯 자연스러운 싱크!
// 총 글자수 계산 → 각 문장 비율로 시간 배분
const totalChars = segments.reduce((sum, s) => sum + (s.text?.length || 0), 0);
const segmentTimes = segments.map((s, i) => {
    const charCount = s.text?.length || 10;
    const ratio = charCount / totalChars;
    return Math.max(3, ratio * BODY_LEN);  // 최소 3초, 비율에 따른 시간
});

// 시작 시간 누적 계산
const segmentStartTimes = [];
let accumulatedTime = SUBTITLE_START;
for (let i = 0; i < segmentTimes.length; i++) {
    segmentStartTimes.push(accumulatedTime);
    accumulatedTime += segmentTimes[i];
}

const perSegmentTime = BODY_LEN / segmentCount;  // 폴백용

// ==================== 5) 줄바꿈 함수 (v19.4 줄 수 무제한!) ====================
// ⚠️ 자막 절대 규칙: 자동 줄바꿈, 단어 짤림 금지, 줄 수 제한 없음!
function formatSubtitle(text) {
    if (!text) return "";
    const cleanText = String(text).trim();

    // v19.4: 한 줄 최대 14자 (좌우 짤림 완전 방지!)
    // ⚠️ 줄 수 제한 없음! (height 동적 조절로 4줄 이상도 OK)
    const MAX_CHARS_PER_LINE = 14;

    const lines = [];
    let remaining = cleanText;

    while (remaining.length > 0) {
        if (remaining.length <= MAX_CHARS_PER_LINE) {
            lines.push(remaining);
            remaining = '';
        } else {
            // 최대 글자수에서 자르되, 단어 중간에서 자르지 않음!
            let cutPoint = MAX_CHARS_PER_LINE;

            // 공백 위치 찾기 - 단어가 짤리지 않도록!
            const searchRange = remaining.substring(0, cutPoint + 5);
            const lastSpace = searchRange.lastIndexOf(' ');

            // 공백이 적절한 위치에 있으면 거기서 자름
            if (lastSpace >= cutPoint - 6 && lastSpace > 0) {
                cutPoint = lastSpace;
            }
            // 공백이 없거나 너무 앞에 있으면 그냥 MAX에서 자름

            lines.push(remaining.substring(0, cutPoint).trim());
            remaining = remaining.substring(cutPoint).trim();
        }
    }

    return lines.join('\n');
}

// ==================== 6) 자막 클립 (v19.5 인트로 타이틀 + 동적 높이!) ====================
// ⚠️ rich-text asset에는 width/height 불가! clip 레벨로 이동!
// ⚠️ v19.4: height는 줄 수에 따라 동적 계산! (줄 수 제한 없음!)
const subtitleClips = [];

// v19.5: 인트로 타이틀 클립 (인트로 5초 동안 표시!)
if (introTitle) {
    subtitleClips.push({
        asset: {
            type: "rich-text",
            text: introTitle,
            font: {
                family: "Noto Sans KR",
                size: 72,              // 인트로 타이틀은 크게!
                color: "#ffffff",
                opacity: 1,
                weight: "900"          // Extra Bold
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
            y: 0.15  // 화면 위쪽 30%에 표시
        }
    });
}

// 본문 자막 클립
for (let i = 0; i < segments.length; i++) {
    const rawText = String(segments[i]?.text || "").trim();
    if (!rawText) continue;

    const formattedText = formatSubtitle(rawText);
    const lineCount = (formattedText.match(/\n/g) || []).length + 1;

    // v19.4: 동적 높이 계산 (줄당 100px + 여유 공간)
    const dynamicHeight = Math.max(200, lineCount * 100 + 50);

    subtitleClips.push({
        asset: {
            type: "rich-text",
            text: formattedText,
            font: SUBTITLE_ABSOLUTE_RULES.font,
            style: SUBTITLE_ABSOLUTE_RULES.style,
            background: SUBTITLE_ABSOLUTE_RULES.background,
            align: { horizontal: "center", vertical: "middle" }
            // ⚠️ width/height는 clip 레벨로 이동!
        },
        // v19.9: 동적 시간 사용! (물흐르듯 자연스러운 싱크)
        start: segmentStartTimes[i] || (SUBTITLE_START + i * perSegmentTime),
        length: segmentTimes[i] || perSegmentTime,
        position: "center",
        width: SUBTITLE_ABSOLUTE_RULES.size.width,    // v19.5: 900px!
        height: dynamicHeight,  // v19.4: 동적 높이!
        offset: {
            x: SUBTITLE_ABSOLUTE_RULES.position.offsetX,
            y: SUBTITLE_ABSOLUTE_RULES.position.offsetY
        }
    });
}

// ==================== 7) 비주얼 클립 (v18.1 줌 트랜지션!) ====================
const visualClips = [];

// v18.1: 트랜지션 결정 함수
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
        transition: TRANSITION_CONFIG.intro  // v18.1: 줌 트랜지션!
    });
} else {
    // v18.1: 역발상 모드면 썸네일 이미지 사용
    const introImage = isReverseMode && thumbnailImage ? thumbnailImage : (images[0] || placeholderImage);
    visualClips.push({
        asset: { type: "image", src: introImage },
        start: 0,
        length: INTRO_LEN,
        fit: "cover",
        transition: TRANSITION_CONFIG.intro  // v18.1: 줌 트랜지션!
    });
}

// 본문 슬라이드 (v18.1: 줌 트랜지션 적용!)
for (let i = 0; i < segments.length; i++) {
    const src = images[i] || images[images.length - 1] || placeholderImage;
    const trans = getTransition(i, segments.length, 'slide');

    visualClips.push({
        asset: { type: "image", src },
        start: INTRO_LEN + (i * perSegmentTime),
        length: perSegmentTime,
        fit: "cover",
        transition: trans  // v18.1: 동적 트랜지션!
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

// v19.8: TTS를 4초 앞당겨서 자막과 싱크!
const TTS_OFFSET = 4;  // 자막보다 4초 먼저 시작 (2초→4초)
const audioClips = [];
if (ttsAudioUrl) audioClips.push({ asset: { type: "audio", src: ttsAudioUrl }, start: INTRO_LEN - TTS_OFFSET, length: BODY_LEN + TTS_OFFSET });

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
        category,  // v19.5: YouTube 업로드용!
        introTitle,  // v19.5: 인트로 타이틀!
        tags,  // v19.5: 자동 태그!
        script: gptData.script || "",  // v19.6: YouTube 설명용!
        intro_prompt: introVideoPrompt,
        outro_prompt: outroVideoPrompt,
        image_prompts: segments.map(s => s.image_prompt || ""),
        thumbnailImage: thumbnailImage || (images[0] || ""),  // v18.1: 썸네일
        debug: {
            version: "19.9-DYNAMIC-SYNC",
            hookType,
            isReverseMode,          // v18.1: 역발상 모드 여부
            hasThumbnail: !!thumbnailImage,
            segmentCount: segments.length,
            imagesFound: images.length,
            hasIntroVideo: !!introVideoUrl,
            hasOutroVideo: !!outroVideoUrl,
            fontSizePx: SUBTITLE_ABSOLUTE_RULES.font.size,
            transitionConfig: TRANSITION_CONFIG,
            parseErrors
        }
    }
}];
