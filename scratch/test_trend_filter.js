// Trend Filter 검증 테스트
// 2026-01-28

// 시뮬레이션 데이터
const testCases = [
    {
        name: "tech 채널 테스트",
        topic: "tech",
        items: [
            { snippet: { title: "당뇨에 좋은 음식 TOP 5", description: "혈당 관리" } },
            { snippet: { title: "아이폰 16 숨겨진 설정 10가지", description: "스마트폰 꿀팁" } },
            { snippet: { title: "피부가 10살 어려보이는 비결", description: "동안 비법" } },
            { snippet: { title: "AI가 바꿀 노후 생활", description: "인공지능 활용법" } },
            { snippet: { title: "연금저축 vs IRP 비교", description: "세금 절약" } },
            { snippet: { title: "유튜브 알고리즘 완벽 분석", description: "조회수 올리기" } }
        ],
        expectedCount: 3  // 아이폰, AI, 유튜브
    },
    {
        name: "health 채널 테스트",
        topic: "health",
        items: [
            { snippet: { title: "당뇨에 좋은 음식 TOP 5", description: "혈당 관리" } },
            { snippet: { title: "아이폰 16 숨겨진 설정", description: "스마트폰" } },
            { snippet: { title: "피부가 10살 어려보이는 비결", description: "동안" } },
            { snippet: { title: "혈압 낮추는 운동법", description: "건강 관리" } },
            { snippet: { title: "연금저축 비교", description: "세금" } }
        ],
        expectedCount: 2  // 당뇨/혈당, 혈압/운동/건강
    },
    {
        name: "finance 채널 테스트",
        topic: "finance",
        items: [
            { snippet: { title: "당뇨에 좋은 음식", description: "건강" } },
            { snippet: { title: "ETF 투자 전략 2026", description: "재테크" } },
            { snippet: { title: "부동산 폭락 시작?", description: "부동산 시장" } },
            { snippet: { title: "피부 관리법", description: "뷰티" } }
        ],
        expectedCount: 2  // ETF/투자/재테크, 부동산
    }
];

// 채널별 키워드 (Trend Filter 코드와 동일)
const CHANNEL_KEYWORDS = {
    "health": ["건강", "혈당", "당뇨", "혈압", "운동", "식단", "노화", "면역", "혈관", "다이어트", "몸", "병원", "의사"],
    "finance": ["재테크", "연금", "투자", "ETF", "금", "부동산", "세금", "상속", "은퇴", "돈", "주식", "적금", "저축"],
    "rural": ["귀농", "귀촌", "시골", "농촌", "자연인", "전원", "토지", "농사", "촌", "밭"],
    "wisdom": ["인생", "자녀", "부부", "노후", "처세", "가족", "관계", "결혼", "배우자", "부모"],
    "sidejob": ["부업", "창업", "소자본", "온라인수익", "중년창업", "알바", "수익", "사업"],
    "beauty": ["피부", "동안", "미용", "자세", "패션", "주름", "화장", "뷰티", "성형", "스킨케어"],
    "tech": ["스마트폰", "AI", "앱", "디지털", "IT", "유튜브", "아이폰", "갤럭시", "인공지능", "컴퓨터", "인터넷", "설정", "기능"]
};

// 필터 함수 (Trend Filter 코드와 동일)
function filterTrends(topic, items) {
    const keywords = CHANNEL_KEYWORDS[topic] || [];

    const filteredItems = items.filter(item => {
        const title = (item.snippet?.title || "").toLowerCase();
        const desc = (item.snippet?.description || "").toLowerCase();
        const text = title + " " + desc;
        return keywords.some(kw => text.toLowerCase().includes(kw.toLowerCase()));
    });

    return filteredItems.length > 0 ? filteredItems : items;
}

// 테스트 실행
console.log("=== Trend Filter 검증 테스트 ===\n");

let allPassed = true;

testCases.forEach((tc, i) => {
    const result = filterTrends(tc.topic, tc.items);
    const passed = result.length === tc.expectedCount;

    console.log(`[${i + 1}] ${tc.name}`);
    console.log(`    채널: ${tc.topic}`);
    console.log(`    입력: ${tc.items.length}개`);
    console.log(`    필터 결과: ${result.length}개`);
    console.log(`    기대값: ${tc.expectedCount}개`);
    console.log(`    결과: ${passed ? "✅ PASS" : "❌ FAIL"}`);

    if (!passed) {
        allPassed = false;
        console.log(`    필터된 항목:`);
        result.forEach(r => console.log(`      - ${r.snippet.title}`));
    }
    console.log("");
});

console.log("=== 최종 결과 ===");
console.log(allPassed ? "✅ 모든 테스트 통과!" : "❌ 일부 테스트 실패!");

// 엣지 케이스 테스트
console.log("\n=== 엣지 케이스 테스트 ===\n");

// 케이스 1: 매칭되는 트렌드가 없을 때
const emptyMatchResult = filterTrends("tech", [
    { snippet: { title: "당뇨에 좋은 음식", description: "건강" } },
    { snippet: { title: "피부 관리법", description: "뷰티" } }
]);
console.log(`[엣지1] 매칭 없을 때 fallback 작동:`);
console.log(`    결과: ${emptyMatchResult.length}개 (원본 반환)`);
console.log(`    ${emptyMatchResult.length === 2 ? "✅ PASS" : "❌ FAIL"}`);

// 케이스 2: 빈 배열
const emptyArrayResult = filterTrends("tech", []);
console.log(`\n[엣지2] 빈 배열:`);
console.log(`    결과: ${emptyArrayResult.length}개`);
console.log(`    ${emptyArrayResult.length === 0 ? "✅ PASS" : "❌ FAIL"}`);

// 케이스 3: 알 수 없는 채널
const unknownChannelResult = filterTrends("unknown", [
    { snippet: { title: "테스트", description: "" } }
]);
console.log(`\n[엣지3] 알 수 없는 채널 (fallback):`);
console.log(`    결과: ${unknownChannelResult.length}개 (원본 반환)`);
console.log(`    ${unknownChannelResult.length === 1 ? "✅ PASS" : "❌ FAIL"}`);
