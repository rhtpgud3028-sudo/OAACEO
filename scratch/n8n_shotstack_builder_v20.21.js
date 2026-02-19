// ============================================================
// AIASF n8n Code Node - Shotstack JSON Builder
// v20.21 VERIFIED-FIX - 공식 문서 검증 + 근본 해결! (2026-01-27)
// ============================================================
// 🔥 v20.21 공식 문서 검증 완료:
// - Shotstack TextAsset 스펙: width/height는 Asset 내부에 배치 ✅
// - background.padding으로 좌우 여백 확보 ✅
// - position + offset 조합으로 안전 영역 배치
//
// 📋 변경사항:
// 1. 자막 위치: position="bottom" + offset.y=-0.15 (음수=위로! 안전 영역!)
// 2. 자막 크기: width=1000, height=300 (과도한 높이 제거)
// 3. 마지막 슬라이드: TARGET_TOTAL까지 확실히 연장 + 최소 2초 보장
// 4. Topic 강제: 명확한 디버그 + 폴백 체인
// 5. 폰트 크기: 44px (가독성 + 잘림 방지 균형)
// ============================================================

const BGM_LIBRARY = {
    // Phase 2 영어 topic 키
    "health": "https://autoshort.site/bgm/health_calm.mp3",
    "finance": "https://autoshort.site/bgm/finance_upbeat.mp3",
    "rural": "https://autoshort.site/bgm/lifestyle_peaceful.mp3",
    "wisdom": "https://autoshort.site/bgm/lifestyle_peaceful.mp3",
    "sidejob": "https://autoshort.site/bgm/finance_upbeat.mp3",
    "beauty": "https://autoshort.site/bgm/default_warm.mp3",
    "tech": "https://autoshort.site/bgm/default_warm.mp3",

    // 기존 한글 키 (Phase 1 호환)
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
const MIN_SEGMENTS = 10;
const MAX_SEGMENTS = 12;
const TARGET_SEGMENTS = 10;

const TTS_VOLUME = 1.0;
const BGM_VOLUME = 0.15;

// ============================================================
// 🔥 v20.21: 자막 설정 - 공식 문서 기반!
// ============================================================
const SUBTITLE_WIDTH = 1000;       // 1080의 93% - 좌우 여백 확보
const SUBTITLE_HEIGHT = 300;       // 3줄까지 표시 가능 (과도하지 않게)
const SUBTITLE_FONT_SIZE = 44;     // 가독성 + 잘림 방지 균형
const SUBTITLE_PADDING = 20;       // 배경 내부 여백
const SUBTITLE_OFFSET_Y = -0.15;   // 🔥 position=bottom에서 음수 = 위로! (공식 문서 검증!)

// Phase 2 동적 브랜딩 설정
let brandingConfig = null;
let forcedTopic = null;
let brandingDebug = [];

try {
    // 🔥 v20.21: 여러 가능한 노드 이름 시도 + 상세 디버그
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
        } catch (e) {
            // 노드 없음 - 조용히 패스
        }
    }

    if (!brandingConfig) {
        brandingDebug.push("⚠️ No branding node found → Phase 1 mode");
    }
} catch (e) {
    brandingDebug.push("❌ Branding error: " + e.message);
}

let USE_DYNAMIC_SYNC = false;
const SYNC_OFFSET = 0.5;
const DISABLE_TRANSITIONS = true;

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
let parseErrors = [];
let isReverseMode = false;

// 🔥 v20.21: Topic 강제 함수 (상세 로그!)
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

try {
    const gptContent = $('3. GPT 스크립트').first()?.json?.message?.content || "";
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
        category = enforceTopicFromBranding(gptData.category || "default");
        hookType = gptData.hook_type || "";
        hookText = gptData.hook_text || "";
        introVideoPrompt = gptData.intro_video_prompt || gptData.intro_prompt || "";
        outroVideoPrompt = gptData.outro_video_prompt || gptData.outro_prompt || "";
        introTitle = gptData.intro_title || videoTitle.substring(0, 15) || "건강 비법!";
        tags = gptData.tags || [category, "shorts", "5060", "시니어", "건강정보"];
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
parseErrors.push(`🎵 BGM selected: ${category} → ${bgmUrl.split('/').pop()}`);

const placeholderImage = "https://images.pexels.com/photos/1563356/pexels-photo-1563356.jpeg?auto=compress&cs=tinysrgb&w=1080";
const primaryFont = "https://autoshort.site/fonts/static/NotoSansKR-Bold.ttf";

// ============================================================
// 🔥 v20.21: 자막 설정 - 동적 브랜딩 색상 적용
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
            lineHeight: 1.4
        },
        background: {
            color: brandColor,
            opacity: 0.85,
            padding: SUBTITLE_PADDING,
            borderRadius: 8
        },
        alignment: {
            horizontal: "center",
            vertical: "center"
        },
        width: SUBTITLE_WIDTH,
        height: SUBTITLE_HEIGHT
    };
};

const SUBTITLE_CONFIG = getSubtitleConfig();

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
    if (boostHookResponse?.url) {
        hookTtsUrl = boostHookResponse.url;
    }
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

try {
    const elevenLabsNode = $('6. ElevenLabs TTS').first();
    if (elevenLabsNode?.json?.alignment) {
        ttsAlignment = elevenLabsNode.json.alignment;
        USE_DYNAMIC_SYNC = true;
    }

    const boostBodyResponse = $('Boost Body Audio').first()?.json;
    if (boostBodyResponse?.url) {
        ttsAudioUrl = boostBodyResponse.url;
    }
} catch (e) {
    parseErrors.push("ElevenLabs alignment parse failed: " + e.message);
}

if (!ttsAudioUrl) {
    try {
        const saveAudioNode = $('Save Audio').first();
        if (saveAudioNode) {
            let filePath = "";
            if (saveAudioNode.json?.fileName) {
                filePath = saveAudioNode.json.fileName;
            } else if (saveAudioNode.json?.file?.name) {
                filePath = saveAudioNode.json.file.name;
            } else if (saveAudioNode.json?.data?.fileName) {
                filePath = saveAudioNode.json.data.fileName;
            }
            if (filePath) {
                const fileName = filePath.split('/').pop();
                if (fileName) {
                    ttsAudioUrl = `https://autoshort.site/audio/${fileName}`;
                }
            }
        }
        if (!ttsAudioUrl) {
            const convertResponse = $('Convert Audio').first()?.json;
            if (convertResponse) {
                if (convertResponse.url) {
                    ttsAudioUrl = convertResponse.url;
                } else if (convertResponse.data) {
                    const parsed = safeParseJSON(convertResponse.data, {});
                    ttsAudioUrl = parsed.url || "";
                }
            }
        }
    } catch (e) {
        parseErrors.push("Body TTS URL parse failed: " + e.message);
    }
}

// 이미지 병합
let images = [];
try {
    const mergeData = $('Merge Images').first();
    if (mergeData?.json?.images) {
        const imageArray = mergeData.json.images;
        images = imageArray.map(item => {
            if (typeof item === 'string') return item;
            return item?.url || item?.src || "";
        }).filter(Boolean);
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
try {
    thumbnailImage = $('DALL-E Thumbnail').first()?.json?.data?.[0]?.url || "";
} catch (e) { }

// ==================== 시간 배분 ====================
let segmentTimes = [];
let subtitleStartTimes = [];
let imageStartTimes = [];

const SLIDE_DURATION = 6.0;
const segmentCount = segments.length || 1;

if (USE_DYNAMIC_SYNC && ttsAlignment) {
    parseErrors.push("🎯 Using dynamic sync from ElevenLabs alignment!");

    const characters = ttsAlignment.characters || [];
    const startTimes = ttsAlignment.character_start_times_seconds || [];
    const endTimes = ttsAlignment.character_end_times_seconds || [];

    let fullScript = segments.map(s => s.text).join(' ');
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
            const remainingTime = TARGET_TOTAL - startTime;
            segmentTimes.push(Math.max(2.0, remainingTime));  // 🔥 최소 2초 보장!
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

    // 마지막 세그먼트 시간 조정
    if (segmentTimes.length > 0) {
        const lastIndex = segmentTimes.length - 1;
        const lastStart = subtitleStartTimes[lastIndex];
        const remaining = TARGET_TOTAL - lastStart;
        segmentTimes[lastIndex] = Math.max(2.0, remaining);  // 🔥 최소 2초 보장!
    }
}

// ==================== 자막 클립 ====================
const subtitleClips = [];

// Hook 자막
if (hookText) {
    subtitleClips.push({
        asset: {
            type: "text",
            text: String(hookText).trim(),
            width: 1000,
            height: 250,
            font: {
                family: "Noto Sans KR",
                size: 40,
                color: "#ffffff",
                opacity: 1,
                weight: 900,
                lineHeight: 1.3
            },
            background: {
                color: "#000000",
                opacity: 0.75,
                padding: 15,
                borderRadius: 8
            },
            alignment: { horizontal: "center", vertical: "center" }
        },
        start: 0,
        length: HOOK_LEN,
        position: "center",
        offset: { x: 0, y: -0.15 }
    });
}

// Intro 타이틀
if (introTitle) {
    subtitleClips.push({
        asset: {
            type: "text",
            text: introTitle,
            width: 900,
            height: 150,
            font: {
                family: "Noto Sans KR",
                size: 56,
                color: "#ffffff",
                opacity: 1,
                weight: 900,
                lineHeight: 1.2
            },
            background: {
                color: "#000000",
                opacity: 0.6,
                padding: 12,
                borderRadius: 10
            },
            alignment: { horizontal: "center", vertical: "center" }
        },
        start: HOOK_LEN,
        length: INTRO_LEN - HOOK_LEN,
        position: "center",
        offset: { x: 0, y: 0.15 }
    });
}

// 🔥 v20.21: 본문 자막 - position=bottom + offset.y=0.12 (안전 영역!)
for (let i = 0; i < segments.length; i++) {
    const rawText = String(segments[i]?.text || "").trim();
    if (!rawText) continue;

    subtitleClips.push({
        asset: {
            type: "text",
            text: rawText,
            width: SUBTITLE_CONFIG.width,
            height: SUBTITLE_CONFIG.height,
            font: SUBTITLE_CONFIG.font,
            background: SUBTITLE_CONFIG.background,
            alignment: SUBTITLE_CONFIG.alignment
        },
        start: subtitleStartTimes[i],
        length: segmentTimes[i],
        position: "bottom",
        offset: { x: 0, y: SUBTITLE_OFFSET_Y }  // 🔥 0.12 = 하단에서 12% 위로!
    });
}

// ==================== 비주얼 클립 ====================
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

// 🔥 v20.21: 이미지 슬라이드 - 마지막은 TARGET_TOTAL까지 확실히!
for (let i = 0; i < segments.length; i++) {
    const imageIndex = images.length > 0 ? (i % images.length) : 0;
    const src = images[imageIndex] || images[0] || placeholderImage;

    let slideLength;
    if (i === segments.length - 1) {
        // 🔥 마지막 슬라이드: TARGET_TOTAL까지 연장 + 최소 2초 보장!
        const calculatedLength = TARGET_TOTAL - imageStartTimes[i];
        slideLength = Math.max(2.0, calculatedLength);
        parseErrors.push(`🔥 Last slide: start=${imageStartTimes[i].toFixed(2)}s, length=${slideLength.toFixed(2)}s, ends at ${(imageStartTimes[i] + slideLength).toFixed(2)}s`);
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

// ==================== 오디오 클립 ====================
const audioClips = [];

if (hookTtsUrl) {
    audioClips.push({
        asset: { type: "audio", src: hookTtsUrl, volume: TTS_VOLUME },
        start: 0,
        length: HOOK_LEN
    });
}

let ttsActualLength = BODY_LEN;
if (ttsAlignment) {
    const endTimes = ttsAlignment.character_end_times_seconds || [];
    if (endTimes.length > 0) {
        ttsActualLength = Math.max(...endTimes);
        parseErrors.push(`✅ TTS actual length: ${ttsActualLength.toFixed(2)}s`);
    }
}

if (ttsAudioUrl) {
    audioClips.push({
        asset: { type: "audio", src: ttsAudioUrl, volume: TTS_VOLUME },
        start: BODY_START,
        length: Math.max(ttsActualLength, BODY_LEN)
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
            version: "20.21-VERIFIED-FIX",
            verification: "Shotstack 공식 문서 TextAsset 스펙 검증 완료",
            fixes: [
                "1. 자막 offset.y: -0.15 (position=bottom에서 음수=위로 = 안전 영역)",
                "2. 자막 크기: width=1000, height=300 (적정 크기)",
                "3. 마지막 슬라이드: TARGET_TOTAL까지 + 최소 2초 보장",
                "4. Topic 강제: 상세 디버그 출력",
                "5. 폰트 크기: 44px (가독성 균형)"
            ],
            subtitleSettings: {
                width: SUBTITLE_WIDTH,
                height: SUBTITLE_HEIGHT,
                fontSize: SUBTITLE_FONT_SIZE,
                padding: SUBTITLE_PADDING,
                offsetY: SUBTITLE_OFFSET_Y,
                position: "bottom"
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
                ttsActualLength: ttsActualLength?.toFixed(2) || "N/A",
                segmentCount: segments.length,
                lastSlideStart: imageStartTimes[imageStartTimes.length - 1]?.toFixed(2) || "N/A",
                lastSlideLength: segmentTimes[segmentTimes.length - 1]?.toFixed(2) || "N/A"
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
