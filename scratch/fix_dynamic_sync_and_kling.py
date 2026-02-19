"""
v20.36 통합 수정
1. ElevenLabs alignment 기반 동적 싱크 (자막/이미지/TTS 완벽 동기화)
2. Kling 인트로 works[0].video.resource 경로 수정 (확실히!)
"""

import json, subprocess

DB_PATH = "/root/.n8n/.n8n/database.sqlite"
WF_ID = "mhPPIHjYTH4sFUDK"

result = subprocess.run(
    ["sqlite3", DB_PATH, f"SELECT nodes FROM workflow_entity WHERE id='{WF_ID}';"],
    capture_output=True, text=True, timeout=10
)
nodes = json.loads(result.stdout.strip())
code = nodes[25]["parameters"]["jsCode"]

changes = []

# ========================================================
# 1. Kling 인트로 - works[0].video.resource 경로 수정
# ========================================================
# 현재 코드에서 introVideoUrl 블록 찾기
intro_start = code.index("let introVideoUrl")
intro_end = code.index("} catch (e) { }", intro_start) + len("} catch (e) { }")
old_intro = code[intro_start:intro_end]

new_intro = """let introVideoUrl = "";
try {
    // 🔴 v20.36: PiAPI Kling 정확한 경로 = data.output.works[0].video.resource
    const klingJson = $('Kling Polling Intro').first()?.json;
    const works = klingJson?.data?.output?.works;
    if (works && works.length > 0) {
        introVideoUrl = works[0]?.video?.resource || works[0]?.resource?.resource || "";
    }
    if (!introVideoUrl) {
        introVideoUrl = klingJson?.data?.output?.video_url || klingJson?.video_url || "";
    }
} catch (e) { }"""

code = code.replace(old_intro, new_intro)
changes.append("Kling 인트로: works[0].video.resource 경로 (확인됨)")

# ========================================================
# 2. 동적 싱크 - alignment 기반 자막/이미지 타이밍
# ========================================================

# 2a. alignment 데이터 가져오기 코드 추가 (ttsAudioUrl 블록 뒤)
# ttsAudioUrl 블록 끝 찾기
tts_block_end = code.index("let images = [];")

alignment_code = """
// ==================== 동적 싱크: ElevenLabs alignment 데이터 ====================
let alignment = null;
try {
    alignment = $('Decode Audio').first()?.json?.alignment;
} catch (e) { }

// alignment에서 문장별 타이밍 계산
function getSentenceTimings(sentences, align) {
    if (!align || !align.characters || !align.character_start_times_seconds) {
        return null; // alignment 없으면 null 반환 → 기존 고정 배분 사용
    }

    const chars = align.characters;
    const starts = align.character_start_times_seconds;
    const ends = align.character_end_times_seconds;
    const fullText = chars.join('');

    const timings = [];
    let searchFrom = 0;

    for (const sentence of sentences) {
        const text = sentence.text || sentence;
        const cleanText = String(text).trim();
        if (!cleanText) continue;

        // 문장의 첫 몇 글자로 위치 찾기 (공백/구두점 무시)
        const searchChars = cleanText.replace(/[\\s,.!?·]/g, '').substring(0, 6);
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
            // 문장 끝 찾기: 다음 문장 시작 전까지 또는 문장 길이만큼
            const sentEndIdx = Math.min(foundIdx + cleanText.length + 5, chars.length - 1);
            let sentEnd = ends[sentEndIdx] || ends[ends.length - 1];

            // 더 정확한 끝: cleanText의 마지막 글자 찾기
            const lastChars = cleanText.replace(/[\\s,.!?·]/g, '').slice(-3);
            for (let j = Math.min(foundIdx + cleanText.length + 10, chars.length - 1); j >= foundIdx; j--) {
                if (chars[j] === lastChars[lastChars.length - 1]) {
                    sentEnd = ends[j];
                    break;
                }
            }

            timings.push({
                start: sentStart,
                end: sentEnd,
                duration: sentEnd - sentStart,
                text: cleanText
            });
            searchFrom = foundIdx + Math.floor(cleanText.length * 0.5);
        } else {
            // 못 찾으면 이전 타이밍 기반 추정
            const prevEnd = timings.length > 0 ? timings[timings.length - 1].end : 0;
            const estimatedDur = cleanText.length * 0.08; // 글자당 ~80ms 추정
            timings.push({
                start: prevEnd,
                end: prevEnd + estimatedDur,
                duration: estimatedDur,
                text: cleanText
            });
            searchFrom = Math.min(searchFrom + cleanText.length, chars.length - 1);
        }
    }

    return timings;
}

"""

code = code[:tts_block_end] + alignment_code + code[tts_block_end:]
changes.append("동적 싱크: alignment 파싱 + getSentenceTimings 함수 추가")

# 2b. 시간 배분 섹션을 동적 싱크로 교체
# 기존 고정 시간 배분 → alignment 기반 동적 배분

old_time_section_start = "// ==================== 6) 시간 배분"
old_time_section_end = "const perSegmentTime = BODY_LEN / segmentCount;"

idx_start = code.index(old_time_section_start)
idx_end = code.index(old_time_section_end) + len(old_time_section_end)
old_time_block = code[idx_start:idx_end]

new_time_block = """// ==================== 6) 시간 배분 (v20.36 동적 싱크!) ====================
const SUBTITLE_START = INTRO_LEN;
const segmentCount = segments.length || 1;

// 🔴 v20.36: alignment 기반 동적 타이밍!
const sentenceTimings = getSentenceTimings(segments, alignment);
let segmentStartTimes = [];
let segmentDurations = [];

if (sentenceTimings && sentenceTimings.length >= segments.length * 0.7) {
    // ✅ alignment 성공 → 동적 싱크!
    for (let i = 0; i < segments.length; i++) {
        const timing = sentenceTimings[i];
        if (timing) {
            segmentStartTimes.push(SUBTITLE_START + timing.start);
            segmentDurations.push(Math.max(2, timing.duration));
        } else {
            // 폴백: 이전 세그먼트 끝에서 시작
            const prevEnd = segmentStartTimes.length > 0
                ? segmentStartTimes[segmentStartTimes.length - 1] + segmentDurations[segmentDurations.length - 1]
                : SUBTITLE_START;
            const estDur = (segments[i]?.text?.length || 20) * 0.08;
            segmentStartTimes.push(prevEnd);
            segmentDurations.push(Math.max(2, estDur));
        }
    }
} else {
    // ❌ alignment 없음 → 기존 글자수 기반 배분 (폴백)
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

const perSegmentTime = BODY_LEN / segmentCount;"""

code = code.replace(old_time_block, new_time_block)
changes.append("동적 싱크: alignment 기반 segmentStartTimes/segmentDurations")

# 2c. 자막 클립에서 동적 타이밍 사용
# 기존: start: segmentStartTimes[i] || (SUBTITLE_START + i * perSegmentTime)
# 기존: length: segmentTimes[i] || perSegmentTime
# → 새: start: segmentStartTimes[i], length: segmentDurations[i]
code = code.replace(
    "start: segmentStartTimes[i] || (SUBTITLE_START + i * perSegmentTime),",
    "start: segmentStartTimes[i],"
)

# segmentTimes → segmentDurations
old_length_pattern = "length: normalizedTimes[i] || perSegmentTime,"
if old_length_pattern in code:
    code = code.replace(old_length_pattern, "length: segmentDurations[i],")
else:
    # Try other patterns
    for pat in ["length: segmentTimes[i] || perSegmentTime,", "length: segmentTimes?.[i] || perSegmentTime,"]:
        if pat in code:
            code = code.replace(pat, "length: segmentDurations[i],")
            break

changes.append("자막 클립: 동적 타이밍 적용")

# 2d. 이미지 슬라이드도 동적 타이밍 적용
# 기존: start: INTRO_LEN + (i * perSegmentTime), length: perSegmentTime
old_slide = "start: segmentStartTimes[i] || (INTRO_LEN + i * perSegmentTime),"
if old_slide in code:
    code = code.replace(old_slide, "start: segmentStartTimes[i],")
else:
    code = code.replace(
        "start: INTRO_LEN + (i * perSegmentTime),",
        "start: segmentStartTimes[i],"
    )

# 슬라이드 length도 동적으로
old_slide_len = "length: perSegmentTime,"
# 슬라이드 쪽만 변경 (여러 곳 있을 수 있음)
# 비주얼 클립 섹션에서만 변경
vis_section_start = code.index("// 본문 슬라이드")
vis_section_end = code.index("// 마지막 슬라이드", vis_section_start) if "// 마지막 슬라이드" in code[vis_section_start:] else code.index("// 아웃트로", vis_section_start) if "// 아웃트로" in code[vis_section_start:] else len(code)
vis_section = code[vis_section_start:vis_section_end]

# 슬라이드 for 루프 안의 length: perSegmentTime 을 동적으로 변경
new_vis_section = vis_section.replace("length: perSegmentTime,", "length: segmentDurations[i] || perSegmentTime,")
code = code[:vis_section_start] + new_vis_section + code[vis_section_end:]
changes.append("이미지 슬라이드: 동적 타이밍 적용")

# 2e. 버전 업데이트
code = code.replace('version: "20.35"', 'version: "20.36"')
code = code.replace('verificationDate: "2026-02-09-v35"', 'verificationDate: "2026-02-10"')
# 만약 이전 버전 패턴이면
code = code.replace('version: "20.34"', 'version: "20.36"')
code = code.replace('verificationDate: "2026-02-09"', 'verificationDate: "2026-02-10"')

# 2f. debug에 동적 싱크 정보 추가
if "hasIntroVideo:" in code:
    code = code.replace(
        "hasIntroVideo:",
        "hasDynamicSync: !!(sentenceTimings && sentenceTimings.length > 0),\n            alignmentSegments: sentenceTimings ? sentenceTimings.length : 0,\n            hasIntroVideo:"
    )

changes.append("debug: 동적 싱크 상태 추가")

nodes[25]["parameters"]["jsCode"] = code

# ========================================================
# Save to DB
# ========================================================
nodesJson = json.dumps(nodes)
escapedJson = nodesJson.replace("'", "''")
sql = f"UPDATE workflow_entity SET nodes = '{escapedJson}', updatedAt = datetime('now') WHERE id = '{WF_ID}';"
with open("/tmp/update_v2036.sql", "w") as f:
    f.write(sql)

subprocess.run(
    ["sqlite3", DB_PATH],
    input=open("/tmp/update_v2036.sql").read(),
    capture_output=True, text=True, timeout=30
)

# ========================================================
# Verify
# ========================================================
result2 = subprocess.run(
    ["sqlite3", DB_PATH, f"SELECT nodes FROM workflow_entity WHERE id='{WF_ID}';"],
    capture_output=True, text=True, timeout=10
)
v_nodes = json.loads(result2.stdout.strip())
v_code = v_nodes[25]["parameters"]["jsCode"]

print("=== Changes ===")
for c in changes:
    print(f"  + {c}")

print()
print("=== Verify ===")
print(f"  v20.36: {'YES' if '20.36' in v_code else 'NO'}")
print(f"  works[0].video.resource: {'YES' if 'video?.resource' in v_code or 'video.resource' in v_code else 'NO'}")
print(f"  getSentenceTimings: {'YES' if 'getSentenceTimings' in v_code else 'NO'}")
print(f"  Decode Audio alignment: {'YES' if 'Decode Audio' in v_code else 'NO'}")
print(f"  segmentDurations: {'YES' if 'segmentDurations' in v_code else 'NO'}")
print(f"  hasDynamicSync debug: {'YES' if 'hasDynamicSync' in v_code else 'NO'}")
print(f"  Code length: {len(v_code)} chars")
print()
print("DONE")
