"""
v20.36 통합 수정 (최종 - 정확한 패턴 매칭)
1. ElevenLabs alignment 기반 동적 싱크
2. Kling 인트로 works[0].video.resource 경로 수정
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
original_len = len(code)

changes = []
errors = []

# ========================================================
# 1. Kling 인트로 - works[0].video.resource 경로 수정
# ========================================================
try:
    intro_start = code.index("let introVideoUrl")
    intro_end = code.index("} catch (e) { }", intro_start) + len("} catch (e) { }")
    old_intro = code[intro_start:intro_end]

    new_intro = 'let introVideoUrl = "";\ntry {\n    // v20.36: PiAPI Kling = data.output.works[0].video.resource\n    const klingJson = $(\'Kling Polling Intro\').first()?.json;\n    const works = klingJson?.data?.output?.works;\n    if (works && works.length > 0) {\n        introVideoUrl = works[0]?.video?.resource || works[0]?.resource?.resource || "";\n    }\n    if (!introVideoUrl) {\n        introVideoUrl = klingJson?.data?.output?.video_url || klingJson?.video_url || "";\n    }\n} catch (e) { }'

    code = code.replace(old_intro, new_intro)
    changes.append("1. Kling: works[0].video.resource")
except Exception as e:
    errors.append(f"Kling fix error: {e}")

# ========================================================
# 2. 동적 싱크 - alignment 기반 자막/이미지 타이밍
# ========================================================

# 2a. alignment 코드 삽입 (let images = []; 앞)
try:
    tts_block_end = code.index("let images = [];")

    alignment_code = """
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

        const searchChars = cleanText.replace(/[\\s,.!?]/g, '').substring(0, 6);
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
            const lastChars = cleanText.replace(/[\\s,.!?]/g, '').slice(-3);
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

"""

    code = code[:tts_block_end] + alignment_code + code[tts_block_end:]
    changes.append("2a. alignment + getSentenceTimings 삽입")
except Exception as e:
    errors.append(f"Alignment insert error: {e}")

# 2b. 시간 배분 섹션 교체
try:
    old_time_start = "// ==================== 6) 시간 배분"
    old_time_end_marker = "const perSegmentTime = BODY_LEN / segmentCount;"

    idx_start = code.index(old_time_start)
    idx_end = code.index(old_time_end_marker, idx_start) + len(old_time_end_marker)
    old_time_block = code[idx_start:idx_end]

    new_time_block = """// ==================== 6) 시간 배분 (v20.36 동적 싱크!) ====================
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

const perSegmentTime = BODY_LEN / segmentCount;"""

    code = code.replace(old_time_block, new_time_block)
    changes.append("2b. 시간배분 -> 동적 싱크")
except Exception as e:
    errors.append(f"Time section error: {e}")

# 2c. 자막 클립 타이밍 수정 (섹션 8에서만!)
try:
    # 자막 섹션 범위 찾기
    sub_start = code.index("// ==================== 8)")
    sub_end = code.index("// ==================== 9)")
    sub_section = code[sub_start:sub_end]

    # 자막 start 폴백 제거
    sub_section = sub_section.replace(
        "start: segmentStartTimes[i] || (SUBTITLE_START + i * perSegmentTime),",
        "start: segmentStartTimes[i],"
    )

    # 자막 length -> segmentDurations
    sub_section = sub_section.replace(
        "length: normalizedTimes[i] || perSegmentTime,",
        "length: segmentDurations[i],"
    )

    code = code[:sub_start] + sub_section + code[sub_end:]
    changes.append("2c. 자막: segmentDurations[i]")
except Exception as e:
    errors.append(f"Subtitle fix error: {e}")

# 2d. 비주얼 슬라이드 타이밍 수정 (섹션 9에서만!)
try:
    vis_start = code.index("// ==================== 9)")
    # 섹션 10 또는 다음 ========== 찾기
    try:
        vis_end = code.index("// ==========", vis_start + 100)
    except ValueError:
        vis_end = len(code)
    vis_section = code[vis_start:vis_end]

    # 슬라이드 start 폴백 제거
    vis_section = vis_section.replace(
        "start: segmentStartTimes[i] || (INTRO_LEN + i * perSegmentTime),",
        "start: segmentStartTimes[i],"
    )

    # 슬라이드 length -> segmentDurations
    vis_section = vis_section.replace(
        "length: normalizedTimes[i] || perSegmentTime,",
        "length: segmentDurations[i],"
    )

    code = code[:vis_start] + vis_section + code[vis_end:]
    changes.append("2d. 슬라이드: segmentDurations[i]")
except Exception as e:
    errors.append(f"Visual fix error: {e}")

# 2e. 버전 업데이트
code = code.replace('version: "20.35"', 'version: "20.36"')
code = code.replace('verificationDate: "2026-02-09-v35"', 'verificationDate: "2026-02-10"')
code = code.replace('verificationDate: "2026-02-09"', 'verificationDate: "2026-02-10"')
changes.append("2e. 버전 20.36")

# 2f. debug에 동적 싱크 정보 추가
if "hasIntroVideo:" in code:
    code = code.replace(
        "hasIntroVideo:",
        "hasDynamicSync: !!(sentenceTimings && sentenceTimings.length > 0),\n            alignmentSegments: sentenceTimings ? sentenceTimings.length : 0,\n            hasIntroVideo:"
    )
    changes.append("2f. debug: hasDynamicSync")

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

if errors:
    print()
    print("=== ERRORS ===")
    for e in errors:
        print(f"  ! {e}")

print()
print("=== Verify ===")
checks = {
    "v20.36": "20.36" in v_code,
    "works[0].video.resource": "video?.resource" in v_code,
    "getSentenceTimings": "getSentenceTimings" in v_code,
    "Decode Audio alignment": "Decode Audio" in v_code,
    "segmentDurations": "segmentDurations" in v_code,
    "hasDynamicSync": "hasDynamicSync" in v_code,
    "old normalizedTimes removed from sub": "normalizedTimes[i] || perSegmentTime" not in v_code,
    "old INTRO_LEN+i*perSegmentTime removed": "(INTRO_LEN + i * perSegmentTime)" not in v_code,
    "old SUBTITLE_START+i*perSegmentTime removed": "(SUBTITLE_START + i * perSegmentTime)" not in v_code,
}

all_pass = True
for k, v in checks.items():
    status = "YES" if v else "NO <<<< FAIL"
    if not v:
        all_pass = False
    print(f"  {k}: {status}")

print(f"  Code: {original_len} -> {len(v_code)} chars")
print()
if all_pass:
    print("ALL CHECKS PASSED - v20.36 READY!")
else:
    print("SOME CHECKS FAILED - REVIEW NEEDED!")
