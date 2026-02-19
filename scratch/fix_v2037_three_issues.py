"""
v20.37 - 3가지 이슈 수정
1. 인트로 영상-주제 싱크 100% (GPT 프롬프트 intro_video_prompt 강화)
2. 65초 이후 TTS 없는 문제 (audio clip length: BODY_LEN -> TARGET_TOTAL)
3. 스크립트-이미지 100% 싱크 (GPT 이미지 프롬프트 강화)
"""

import json, subprocess

DB_PATH = "/root/.n8n/.n8n/database.sqlite"
WF_ID = "mhPPIHjYTH4sFUDK"

result = subprocess.run(
    ["sqlite3", DB_PATH, f"SELECT nodes FROM workflow_entity WHERE id='{WF_ID}';"],
    capture_output=True, text=True, timeout=10
)
nodes = json.loads(result.stdout.strip())

changes = []
errors = []

# ========================================================
# ISSUE 1: 인트로 영상-주제 싱크 (GPT 프롬프트 + Shotstack)
# ========================================================

# 1a. GPT 스크립트 노드 [3] - intro_video_prompt 정의 강화
try:
    msgs = nodes[3]["parameters"]["messages"]["values"]
    sys_content = msgs[0]["content"]

    # 기존의 모호한 intro_video_prompt 정의를 구체적으로 교체
    old_intro_prompt_def = '"intro_video_prompt": "주제 관련 인트로 영상",'
    new_intro_prompt_def = '''"intro_video_prompt": "Kling AI 영상 생성용 영어 프롬프트 (필수 규칙: 1) 반드시 영어로 작성 2) 주제의 핵심 액션을 직접 표현 (예: 무릎통증 → 무릎을 만지는 장면, 재테크 → 통장/차트 보는 장면) 3) 한국인 50-60대 모델 명시 4) 감정과 상황 구체적 묘사 5) 카메라 앵글과 조명 지정 6) 5초 분량의 단일 동작에 집중 7) 형식: 'A [age] Korean [man/woman] [specific action related to topic], [setting], [lighting], cinematic, 9:16 vertical, 5 seconds')",''',

    if old_intro_prompt_def in sys_content:
        sys_content = sys_content.replace(old_intro_prompt_def, new_intro_prompt_def)
        msgs[0]["content"] = sys_content
        changes.append("1a. GPT intro_video_prompt 정의 강화")
    else:
        # 다른 패턴 시도
        for pattern in [
            '"intro_video_prompt": "주제 관련 인트로 영상"',
            '"intro_video_prompt":',
        ]:
            if pattern in sys_content:
                # Find the full line and replace
                idx = sys_content.index(pattern)
                line_end = sys_content.index("\n", idx)
                old_line = sys_content[idx:line_end]
                new_line = '"intro_video_prompt": "Kling AI 영상 생성용 영어 프롬프트. 필수: 1) 영어 2) 주제 핵심 액션 직접 표현 3) 한국인 50-60대 4) 5초 단일 동작 5) 형식: A [age] Korean [man/woman] [specific action related to topic], [setting], cinematic, 9:16",'
                sys_content = sys_content.replace(old_line, new_line)
                msgs[0]["content"] = sys_content
                changes.append("1a. GPT intro_video_prompt 정의 강화 (alt)")
                break
        else:
            errors.append("1a. intro_video_prompt 패턴 못찾음")
except Exception as e:
    errors.append(f"1a. Error: {e}")

# 1b. Kling 생성 노드 [20] - 프롬프트에 주제 컨텍스트 보강
try:
    kling_body = nodes[20]["parameters"]["body"]

    # 기존 폴백 프롬프트가 너무 일반적 - 주제 맥락 추가
    old_fallback = '"A cheerful 58-year-old Korean woman smiling in modern Seoul apartment, soft morning sunlight, iPhone photography"'
    new_fallback = '"A 58-year-old Korean person in a meaningful moment related to daily health, modern Korean home, warm natural lighting, cinematic, emotional, 9:16 vertical"'

    kling_body = kling_body.replace(old_fallback, new_fallback)

    # 2번 폴백도 동일하게
    nodes[20]["parameters"]["body"] = kling_body
    changes.append("1b. Kling 폴백 프롬프트 개선")
except Exception as e:
    errors.append(f"1b. Error: {e}")

# ========================================================
# ISSUE 2: 65초 이후 TTS 없는 문제
# ========================================================
try:
    code = nodes[25]["parameters"]["jsCode"]

    # TTS audio clip length를 BODY_LEN -> TARGET_TOTAL로 변경
    # 현재: length: BODY_LEN  // 🔴 v20.35: 본문 길이만큼만
    # 수정: length: TARGET_TOTAL - INTRO_LEN + 5  (여유분 5초 추가, Shotstack이 자동 자름)

    old_audio = """    audioClips.push({
        asset: { type: "audio", src: ttsAudioUrl },
        start: INTRO_LEN,  // 🔴 v20.35: 인트로 끝나고 바로 시작
        length: BODY_LEN  // 🔴 v20.35: 본문 길이만큼만
    });"""

    new_audio = """    audioClips.push({
        asset: { type: "audio", src: ttsAudioUrl },
        start: INTRO_LEN,  // v20.37: 인트로 끝나고 바로 시작
        length: TARGET_TOTAL  // v20.37: TTS 전체 재생 (65초) - 영상 끝까지!
    });"""

    if old_audio in code:
        code = code.replace(old_audio, new_audio)
        changes.append("2. TTS audio length: BODY_LEN -> TARGET_TOTAL")
    else:
        # 패턴 유연하게 시도
        if "length: BODY_LEN  // " in code and "본문 길이" in code:
            code = code.replace(
                "length: BODY_LEN  //",
                "length: TARGET_TOTAL  // v20.37: TTS 전체"
            )
            changes.append("2. TTS audio length: BODY_LEN -> TARGET_TOTAL (alt)")
        else:
            errors.append("2. TTS length 패턴 못찾음")

    # 버전 업데이트
    code = code.replace('version: "20.36"', 'version: "20.37"')
    code = code.replace('verificationDate: "2026-02-10"', 'verificationDate: "2026-02-10-v37"')

    nodes[25]["parameters"]["jsCode"] = code
    changes.append("2. 버전 20.37")
except Exception as e:
    errors.append(f"2. Error: {e}")

# ========================================================
# ISSUE 3: 스크립트-이미지 100% 싱크 (GPT 이미지 프롬프트 노드 [12] 강화)
# ========================================================
try:
    img_msgs = nodes[12]["parameters"]["responses"]["values"]

    # System prompt 강화
    old_sys = img_msgs[0]["content"]

    new_sys = """당신은 YouTube Shorts 전문 이미지 프롬프트 생성 AI입니다.

📌 핵심 목표: 각 문장의 핵심 행동/동작/개념을 100% 정확히 시각화!

🔴🔴🔴 최우선 규칙: 문장-이미지 1:1 정확 매칭! 🔴🔴🔴

⚠️ "무릎 안쪽 통증" → 무릎 안쪽 부위를 빨갛게 표시한 다리 이미지
⚠️ "중둔근 운동" → 엉덩이 옆 근육 운동 자세 이미지 (가슴/배 X!)
⚠️ "혈당 낮추는 음식" → 해당 음식들의 클로즈업 이미지

🔍 분석 3단계 (반드시 순서대로!):
1단계. 문장에서 핵심 명사 + 핵심 동사 추출 (예: "중둔근" + "운동")
2단계. 추출한 핵심어가 정확히 표현되는 시각적 장면 결정
3단계. 관련없는 요소가 섞이지 않았는지 최종 검증

⛔ 절대 금지 실수:
- "무릎 통증" 문장에 가슴/배 잡는 이미지 → ❌ 실패!
- "중둔근 운동" 문장에 상체 운동 이미지 → ❌ 실패!
- "혈압 관리" 문장에 음식 이미지 → ❌ 실패!
- 핵심어와 무관한 신체 부위 표현 → ❌ 실패!

📐 레이아웃 패턴:
- 비교: 화면 이등분 (위/아래 또는 좌/우) + VS 표시
- 금지: 대상 + 큰 빨간 X 표시
- 추천: 대상 + 초록 체크마크 또는 빛나는 효과
- 순서: 화살표로 연결 (A → B)
- 신체부위: 해당 부위만 클로즈업 + 색상 하이라이트

🎨 스타일 규칙:
- 한국 현대적 감성 (밝고 깔끔한 배경)
- 세로 9:16 비율
- 선명한 색상 대비
- 아이콘/심볼 적극 활용
- 신체부위 설명 시 해부학적 정확성 필수

⚠️ 절대 금지:
- 텍스트, 글자, 한글, 영어 포함 금지
- 중국풍, 일본풍 금지
- 복잡한 배경 금지
- 사람 얼굴 금지 (손/팔/다리만 OK)
- 문장 핵심어와 무관한 이미지 생성 금지"""

    img_msgs[0]["content"] = new_sys

    # User prompt도 강화
    old_user = img_msgs[1]["content"]

    new_user = """=다음 스크립트의 각 문장을 분석하고 직관적 이미지 프롬프트를 생성하세요:

스크립트:
{{ $json.message.content }}

🔴 각 문장마다 반드시 이 프로세스를 따르세요:

1단계. 핵심어 추출:
   - 핵심 명사: (예: 무릎, 중둔근, 혈당, 연금)
   - 핵심 동사/형용사: (예: 통증, 운동, 낮추다, 늘리다)

2단계. 시각화 결정:
   - 추출한 핵심어를 100% 정확히 표현하는 장면 설계
   - 핵심어: "중둔근 운동" → 엉덩이 옆쪽 근육을 사용하는 운동 자세
   - 핵심어: "무릎 안쪽 통증" → 무릎 안쪽이 빨갛게 표시된 다리 클로즈업

3단계. 검증 질문:
   - "이 이미지가 문장의 핵심 내용을 정확히 전달하는가?"
   - "문장과 관련없는 신체부위/사물이 포함되지 않았는가?"

DALL-E 3 프롬프트 규칙:
- 반드시 영어로 작성
- "ABSOLUTELY NO TEXT, NO LETTERS, NO WORDS" 필수 포함
- 9:16 vertical format 명시
- 핵심어가 직접적으로 표현되어야 함

JSON 형식으로 출력:
{
  "image_prompts": ["prompt1", "prompt2", ...]
}

예시:
문장: "무릎 안쪽 통증을 잡는 중둔근 운동을 알려드릴게요"
분석: 핵심어 = "무릎 안쪽 통증", "중둔근 운동"
프롬프트: "vertical 9:16, close-up of a person's hip and leg area performing gluteus medius exercise (side-lying leg raise), anatomical highlight on hip muscle area in glowing orange, clean gym mat background, ABSOLUTELY NO TEXT, NO LETTERS, NO WORDS, modern Korean fitness aesthetic"

문장: "혈당 수치를 자연스럽게 낮추는 5가지 음식이 있어요"
분석: 핵심어 = "혈당", "낮추는 음식"
프롬프트: "vertical 9:16, top-down flat lay of 5 blood sugar lowering foods (cinnamon, leafy greens, berries, nuts, whole grain), arranged on modern Korean ceramic plates, small glucose meter in corner showing downward arrow, warm natural lighting, ABSOLUTELY NO TEXT, NO LETTERS, NO WORDS" """

    img_msgs[1]["content"] = new_user

    nodes[12]["parameters"]["responses"]["values"] = img_msgs
    changes.append("3. 이미지 프롬프트: System + User 강화")
except Exception as e:
    errors.append(f"3. Error: {e}")

# ========================================================
# SAVE
# ========================================================
nodesJson = json.dumps(nodes)
escapedJson = nodesJson.replace("'", "''")
sql = f"UPDATE workflow_entity SET nodes = '{escapedJson}', updatedAt = datetime('now') WHERE id = '{WF_ID}';"
with open("/tmp/update_v2037.sql", "w") as f:
    f.write(sql)

result = subprocess.run(
    ["sqlite3", DB_PATH],
    input=open("/tmp/update_v2037.sql").read(),
    capture_output=True, text=True, timeout=30
)

if result.returncode != 0:
    print("DB ERROR:", result.stderr)

# ========================================================
# VERIFY
# ========================================================
result2 = subprocess.run(
    ["sqlite3", DB_PATH, f"SELECT nodes FROM workflow_entity WHERE id='{WF_ID}';"],
    capture_output=True, text=True, timeout=10
)
v_nodes = json.loads(result2.stdout.strip())
v_code = v_nodes[25]["parameters"]["jsCode"]
v_gpt_sys = v_nodes[3]["parameters"]["messages"]["values"][0]["content"]
v_img_sys = v_nodes[12]["parameters"]["responses"]["values"][0]["content"]

print("=== Changes ===")
for c in changes:
    print("  + %s" % c)

if errors:
    print()
    print("=== ERRORS ===")
    for e in errors:
        print("  ! %s" % e)

print()
print("=== Verify ===")

checks = {
    "v20.37": "20.37" in v_code,
    "TTS length=TARGET_TOTAL": "length: TARGET_TOTAL" in v_code,
    "GPT intro_video_prompt enhanced": ("핵심 액션" in v_gpt_sys or "specific action" in v_gpt_sys),
    "Image prompt enhanced": "핵심어 추출" in v_img_sys or "핵심 명사" in v_img_sys,
    "Image prompt: 절대 금지 실수": "절대 금지 실수" in v_img_sys,
    "Kling fallback improved": "meaningful moment" in v_nodes[20]["parameters"]["body"],
}

all_pass = True
for k, v in checks.items():
    status = "YES" if v else "NO <<<< FAIL"
    if not v:
        all_pass = False
    print("  %s: %s" % (k, status))

print("  Code length: %d chars" % len(v_code))
print()
if all_pass:
    print("ALL CHECKS PASSED - v20.37 READY!")
else:
    print("SOME CHECKS FAILED!")
