// ============================================================
// AIASF 품질 자동 체크 노드
// v20.0 (2026-01-08)
// ============================================================
// 📍 위치: Shotstack Polling 노드 다음
// 📍 노드 이름: 품질 체크
// ============================================================

const renderResult = $input.first().json;

// Shotstack 응답 구조 확인 (여러 형식 지원)
const response = renderResult.response || renderResult;
const status = response.status || response.data?.status || "unknown";
const videoUrl = response.url || response.data?.url || "";

// 품질 체크 결과
const qualityCheck = {
    status: status,
    isSuccess: status === "done",
    isProcessing: status === "preprocessing" || status === "rendering" || status === "queued",
    hasVideo: !!videoUrl,
    videoUrl: videoUrl,
    timestamp: new Date().toISOString()
};

// 진행 중이면 통과 (아직 완료 안됨)
if (qualityCheck.isProcessing) {
    return [{
        json: {
            ...renderResult,
            qualityCheck: qualityCheck,
            message: `⏳ 렌더링 진행 중: ${status}`,
            finalVideoUrl: ""
        }
    }];
}

// 실패 시 에러 발생
if (!qualityCheck.isSuccess && !qualityCheck.isProcessing) {
    throw new Error(`🔴 렌더링 실패! 상태: ${status}`);
}

if (qualityCheck.isSuccess && !qualityCheck.hasVideo) {
    throw new Error(`🔴 비디오 URL 없음! 렌더링 확인 필요`);
}

// 성공 시 다음 노드로 전달
return [{
    json: {
        ...renderResult,
        qualityCheck: qualityCheck,
        finalVideoUrl: videoUrl
    }
}];
