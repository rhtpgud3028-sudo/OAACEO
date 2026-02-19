// ============================================================
// AIASF n8n Code Node - Shotstack JSON Builder
// v20.17 PHASE2-DAY2-FIX (2026-01-26)
// ============================================================
// 🔥 v20.17 핵심 변경:
// 1. 자막 width: 720→800 (좌측 잘림 해결!)
// 2. MAX_CHARS_PER_LINE: 11→13 (줄바꿈 최적화)
// 3. TTS length 동적 적용 (65초 전체 재생 보장!)
// 4. 기존 v20.16 모든 기능 유지
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

const HOOK_LEN = 3;
const INTRO_LEN = 5;
const OUTRO_LEN = 0;
const TARGET_TOTAL = 65;
const BODY_START = 5;
const BODY_LEN = TARGET_TOTAL - INTRO_LEN - OUTRO_LEN;
const MIN_SEGMENTS = 10;
const MAX_SEGMENTS = 12;
const TARGET_SEGMENTS = 10;  // 🆕 v20.15: 10개로 변경!

const TTS_VOLUME = 1.0;
const BGM_VOLUME = 0.15;  // 🆕 v20.16: 0.1 → 0.15 (딥검증 결과)

// 🆕 v20.16: Phase 2 동적 브랜딩 설정 가져오기
let brandingConfig = null;
try {
    const brandingNode = $('Branding Router').first();
    if (brandingNode?.json) {
        brandingConfig = brandingNode.json;
    }
} catch (e) {
    // Branding Router 노드가 없으면 기본값 사용 (Phase 1 호환)
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
        category = gptData.category || "default";
        hookType = gptData.hook_type || "";
        hookText = gptData.hook_text || "";
        introVideoPrompt = gptData.intro_video_prompt || gptData.intro_prompt || "";
        outroVideoPrompt = gptData.outro_video_prompt || gptData.outro_prompt || "";
        introTitle = gptData.intro_title || videoTitle.substring(0, 15) || "건강 비법!";
        tags = gptData.tags || [category, "shorts", "5060", "시니어", "건강정보"];
    } else if (gptData.segments && Array.isArray(gptData.segments)) {
        segments = gptData.segments;
        videoTitle = gptData.youtube_title || gptData.title || "AI 숏츠";
        category = gptData.category || "default";
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
            category = parsed.category || "default";
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

const placeholderImage = "https://images.pexels.com/photos/1563356/pexels-photo-1563356.jpeg?auto=compress&cs=tinysrgb&w=1080";
const primaryFont = "https://autoshort.site/fonts/static/NotoSansKR-Bold.ttf";

// 🆕 v20.16.3: Phase 1 검증된 설정 유지 + 색상만 동적 적용
const getSubtitleRules = () => {
    // 채널별 브랜딩 색상만 가져오기 (나머지는 Phase 1 검증된 값 유지!)
    const brandColor = brandingConfig?.branding?.primaryColor || "#000000";

    return {
        // ✅ Phase 1 검증된 폰트 설정 그대로!
        font: {
            family: "Noto Sans KR",
            size: 60,  // Phase 1 검증값
            color: "#FFFFFF",
            opacity: 1,
            weight: "700"
        },
        style: {
            lineHeight: 1.8,
            letterSpacing: 2
        },
        background: {
            color: brandColor,  // ✅ 채널별 색상만 동적!
            opacity: 0.85
        },
        // ✅ v20.17: 자막 width 확대 (좌측 잘림 해결!)
        size: {
            width: 800,  // v20.17: 720→800 (자막 좌측 잘림 해결!)
            height: 400
        },
        position: {
            offsetX: 0,
            offsetY: -0.25
        },
        maxLines: 3
    };
};

const SUBTITLE_ABSOLUTE_RULES = getSubtitleRules();

let introVideoUrl = "";
try { introVideoUrl = $('Kling Polling Intro').first()?.json?.data?.output?.video_url || ""; } catch (e) { }

let outroVideoUrl = "";
if (OUTRO_LEN > 0) {
    try { outroVideoUrl = $('Kling Polling Outro').first()?.json?.data?.output?.video_url || ""; } catch (e) { }
}

// ============================================================
// 🆕 v20.15: Hook TTS → Boost Hook Audio 노드에서 가져오기!
// ============================================================
let hookTtsUrl = "";
try {
    // 1차: Boost Hook Audio에서 가져오기 (볼륨 증폭된 버전)
    const boostHookResponse = $('Boost Hook Audio').first()?.json;
    if (boostHookResponse?.url) {
        hookTtsUrl = boostHookResponse.url;
        parseErrors.push("✅ Hook TTS: Using boosted audio!");
    }

    // 2차: 폴백 - Convert Hook Audio
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

// ============================================================
// 🆕 v20.15: Body TTS → Boost Body Audio 노드에서 가져오기!
// ============================================================
let ttsAudioUrl = "";
let ttsAlignment = null;

try {
    const elevenLabsNode = $('6. ElevenLabs TTS').first();
    if (elevenLabsNode?.json?.alignment) {
        ttsAlignment = elevenLabsNode.json.alignment;
        USE_DYNAMIC_SYNC = true;
        parseErrors.push("✅ Dynamic sync enabled with alignment data!");
    }

    // 1차: Boost Body Audio에서 가져오기 (볼륨 증폭된 버전)
    const boostBodyResponse = $('Boost Body Audio').first()?.json;
    if (boostBodyResponse?.url) {
        ttsAudioUrl = boostBodyResponse.url;
        parseErrors.push("✅ Body TTS: Using boosted audio!");
    }
} catch (e) {
    parseErrors.push("ElevenLabs alignment parse failed: " + e.message);
}

// 폴백: 기존 방식
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

// ============================================================
// 🆕 v20.15: 이미지 병합 로직 개선 - 모든 이미지 사용!
// ============================================================
let images = [];
try {
    const mergeData = $('Merge Images').first();

    // 방법 1: images 배열
    if (mergeData?.json?.images) {
        const imageArray = mergeData.json.images;
        images = imageArray.map(item => {
            if (typeof item === 'string') return item;
            return item?.url || item?.src || "";
        }).filter(Boolean);
    }

    // 방법 2: 직접 배열
    if (images.length === 0 && Array.isArray(mergeData?.json)) {
        images = mergeData.json.map(item => item?.url || item?.src || "").filter(Boolean);
    }

    // 방법 3: all() 사용
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

const SLIDE_DURATION = 6.0;  // 🆕 v20.15: 10개 슬라이드 = 60초 / 10 = 6초
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

        // v20.16.5: 음수 length 방지! 최소 0.5초 보장
        if (i === segments.length - 1) {
            const remainingTime = TARGET_TOTAL - startTime;
            segmentTimes.push(Math.max(0.5, remainingTime));
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
        const remaining = TARGET_TOTAL - lastStart;
        segmentTimes[lastIndex] = Math.min(remaining, 8);
    }
}

function formatSubtitle(text) {
    if (!text) return "";
    const cleanText = String(text).trim();
    const MAX_CHARS_PER_LINE = 13;  // v20.17: 11→13 (width 800 대응!)
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

// ==================== 자막 클립 ====================
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
                size: 52,
                color: "#ffffff",
                opacity: 1,
                weight: "900"
            },
            style: {
                lineHeight: 1.6,
                letterSpacing: 2
            },
            background: {
                color: "#000000",
                opacity: 0.75
            },
            align: { horizontal: "center", vertical: "middle" }
        },
        start: 0,
        length: HOOK_LEN,
        position: "center",
        width: 900,
        height: hookHeight,
        offset: {
            x: 0,
            y: -0.20
        }
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
            style: {
                lineHeight: 1.3
            },
            background: {
                color: "#000000",
                opacity: 0.6
            },
            align: { horizontal: "center", vertical: "middle" }
        },
        start: HOOK_LEN,
        length: INTRO_LEN - HOOK_LEN,
        position: "center",
        width: 900,
        height: 150,
        offset: {
            x: 0,
            y: 0.15
        }
    });
}

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
        start: subtitleStartTimes[i],
        length: segmentTimes[i],
        position: "center",
        width: SUBTITLE_ABSOLUTE_RULES.size.width,
        height: dynamicHeight,
        offset: {
            x: SUBTITLE_ABSOLUTE_RULES.position.offsetX,
            y: SUBTITLE_ABSOLUTE_RULES.position.offsetY
        }
    });
}

// ==================== 비주얼 클립 ====================
const visualClips = [];

if (introVideoUrl) {
    const introClip = {
        asset: { type: "video", src: introVideoUrl, volume: 0 },
        start: 0,
        length: INTRO_LEN,
        fit: "cover"
    };
    visualClips.push(introClip);
} else {
    const introImage = isReverseMode && thumbnailImage ? thumbnailImage : (images[0] || placeholderImage);
    const introClip = {
        asset: { type: "image", src: introImage },
        start: 0,
        length: INTRO_LEN,
        fit: "cover"
    };
    visualClips.push(introClip);
}

// 🆕 v20.15: 이미지 순환 로직 개선 - 모든 이미지 균등 사용!
for (let i = 0; i < segments.length; i++) {
    // 이미지가 충분하면 순서대로, 부족하면 순환
    const imageIndex = images.length > 0 ? (i % images.length) : 0;
    const src = images[imageIndex] || images[0] || placeholderImage;

    // v20.16.5: 음수 length 방지! 최소 0.5초 보장
    const slideLength = Math.max(0.5, (segmentTimes[i] || 0) + 0.5);

    const slideClip = {
        asset: { type: "image", src },
        start: imageStartTimes[i],
        length: slideLength,
        fit: "cover"
    };
    visualClips.push(slideClip);
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

// 🆕 v20.17: TTS 실제 길이 동적 적용 (65초 전체 재생 보장!)
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
        length: Math.max(ttsActualLength, BODY_LEN)  // v20.17: 실제 TTS 길이와 BODY_LEN 중 큰 값!
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
            version: "20.17-PHASE2-DAY2-FIX",
            phase2Enabled: !!brandingConfig,
            ttsActualLength: ttsActualLength?.toFixed(2) || "N/A",
            channelId: brandingConfig?.channelId || "none (Phase 1 mode)",
            brandingTopic: brandingConfig?.topic || "default",
            targetTotal: TARGET_TOTAL,
            targetSegments: TARGET_SEGMENTS,
            bodyLength: BODY_LEN,
            slideDuration: SLIDE_DURATION,
            useDynamicSync: USE_DYNAMIC_SYNC,
            hasAlignment: !!ttsAlignment,
            syncOffset: USE_DYNAMIC_SYNC ? "dynamic" : SYNC_OFFSET,
            ttsVolume: TTS_VOLUME,
            bgmVolume: BGM_VOLUME,
            hookType,
            hookText: hookText ? "있음" : "없음",
            hookTtsUrl: hookTtsUrl || "없음",
            hasHookTts: !!hookTtsUrl,
            hasBodyTts: !!ttsAudioUrl,
            bodyTtsUrl: ttsAudioUrl || "없음",
            isReverseMode,
            hasThumbnail: !!thumbnailImage,
            segmentCount: segments.length,
            imagesFound: images.length,
            hasIntroVideo: !!introVideoUrl,
            hasOutroVideo: !!outroVideoUrl,
            hasIntroTitle: !!introTitle,
            transitionsDisabled: DISABLE_TRANSITIONS,
            segmentTimes: segmentTimes.map(t => t.toFixed(2)),
            subtitleStartTimes: subtitleStartTimes.map(t => t.toFixed(2)),
            imageStartTimes: imageStartTimes.map(t => t.toFixed(2)),
            parseErrors
        }
    }
}];
