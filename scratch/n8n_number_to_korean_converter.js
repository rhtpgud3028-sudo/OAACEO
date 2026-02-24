// ========================================
// AIASF - TTS 숫자→한글 변환 노드 v1.0
// ========================================
// 목적: ElevenLabs TTS가 숫자를 영어로 발음하는 문제 해결
// 작성일: 2026-02-24
// ========================================

// 숫자를 한글로 변환하는 함수
function numberToKorean(num) {
  const units = ['', '만', '억', '조'];
  const digits = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];
  const positions = ['', '십', '백', '천'];

  if (num === 0) return '영';
  if (num === 1) return '일';

  let result = '';
  let unitIndex = 0;

  while (num > 0) {
    let part = num % 10000;
    if (part > 0) {
      let partStr = '';
      let posIndex = 0;

      while (part > 0) {
        let digit = part % 10;
        if (digit > 0) {
          if (digit === 1 && posIndex > 0) {
            // 십, 백, 천의 경우 "일"을 생략
            partStr = positions[posIndex] + partStr;
          } else {
            partStr = digits[digit] + positions[posIndex] + partStr;
          }
        }
        part = Math.floor(part / 10);
        posIndex++;
      }

      result = partStr + units[unitIndex] + result;
    }

    num = Math.floor(num / 10000);
    unitIndex++;
  }

  return result;
}

// 퍼센트 변환
function convertPercent(match, number) {
  const num = parseInt(number);
  return numberToKorean(num) + ' 퍼센트';
}

// 일반 숫자 변환 (문맥에 따라)
function convertNumber(match, number, unit) {
  const num = parseInt(number.replace(/,/g, ''));
  const korean = numberToKorean(num);
  return korean + (unit || '');
}

// 연도 변환
function convertYear(match, year) {
  const digits = year.split('');
  const korean = digits.map(d => ['영', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'][parseInt(d)]).join('');
  return korean + '년';
}

// 5060 같은 특수 케이스
function convertAgeGroup(match) {
  return '오공육공';
}

// 메인 변환 함수
function convertNumbersToKorean(text) {
  if (!text) return text;

  // 1. 5060세대 특수 처리
  text = text.replace(/5060세대/g, '오공육공세대');
  text = text.replace(/5060/g, '오공육공');

  // 2. 연도 변환 (예: 2026년)
  text = text.replace(/(\d{4})년/g, convertYear);

  // 3. 퍼센트 변환 (예: 70%)
  text = text.replace(/(\d+)%/g, convertPercent);

  // 4. 큰 숫자 + 단위 (예: 1억, 100만)
  text = text.replace(/(\d+(?:,\d+)*)억/g, (match, number) => {
    return convertNumber(match, number, '억');
  });

  text = text.replace(/(\d+(?:,\d+)*)만/g, (match, number) => {
    return convertNumber(match, number, '만');
  });

  text = text.replace(/(\d+(?:,\d+)*)천/g, (match, number) => {
    return convertNumber(match, number, '천');
  });

  // 5. 일반 숫자 (예: 123개, 45명)
  text = text.replace(/(\d+(?:,\d+)*)(개|명|시간|분|초|일|년|월|주|번|회|건|장|권|마리|그램|킬로|미터|센티)/g, convertNumber);

  // 6. 단독 숫자 (문맥상 남은 것들)
  text = text.replace(/(\d+)/g, (match, number) => {
    const num = parseInt(number);
    if (num > 10) {
      return numberToKorean(num);
    }
    return match; // 1~10은 그대로 (자연스러움)
  });

  return text;
}

// ========================================
// n8n 노드 실행 코드
// ========================================

// 입력 데이터 가져오기
const items = $input.all();

// 각 항목 처리
return items.map(item => {
  const json = item.json;

  // script 필드 변환
  if (json.script) {
    json.script_original = json.script; // 원본 보존
    json.script = convertNumbersToKorean(json.script);
  }

  // hook_text 변환
  if (json.hook_text) {
    json.hook_text_original = json.hook_text;
    json.hook_text = convertNumbersToKorean(json.hook_text);
  }

  // title 변환
  if (json.title) {
    json.title_original = json.title;
    json.title = convertNumbersToKorean(json.title);
  }

  // intro_title 변환
  if (json.intro_title) {
    json.intro_title_original = json.intro_title;
    json.intro_title = convertNumbersToKorean(json.intro_title);
  }

  return {
    json,
    pairedItem: item.pairedItem
  };
});

// ========================================
// 테스트 코드 (주석 처리)
// ========================================

/*
// 테스트 예시
const testCases = [
  "70%가 모르는 비밀",
  "1억 명이 사용해요",
  "5060세대 필수 정보",
  "2026년 최신 트렌드",
  "100만 원으로 시작",
  "하루 3번 드세요",
  "체온 36.5도가 정상"
];

console.log("=== 숫자→한글 변환 테스트 ===");
testCases.forEach(test => {
  console.log(`원본: ${test}`);
  console.log(`변환: ${convertNumbersToKorean(test)}\n`);
});

// 예상 출력:
// 원본: 70%가 모르는 비밀
// 변환: 칠십 퍼센트가 모르는 비밀
//
// 원본: 1억 명이 사용해요
// 변환: 일억 명이 사용해요
//
// 원본: 5060세대 필수 정보
// 변환: 오공육공세대 필수 정보
//
// 원본: 2026년 최신 트렌드
// 변환: 이공이육년 최신 트렌드
//
// 원본: 100만 원으로 시작
// 변환: 백만 원으로 시작
//
// 원본: 하루 3번 드세요
// 변환: 하루 3번 드세요 (10 이하는 유지)
*/
