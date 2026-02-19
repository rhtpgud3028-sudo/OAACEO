/**
 * AIASF Phase 2 - 21채널 랜덤 스케줄링 알고리즘
 * 
 * 목적: 21개 채널에 하루 2회(아침/저녁) 영상 업로드를 분단위로 랜덤 분산
 * 패턴 회피: 1~15분 랜덤 오프셋으로 자동화 탐지 우회
 * 
 * 버전: 1.0.0
 * 생성일: 2026-01-20
 */

// ============================================
// 채널 및 계정 구조
// ============================================

const ACCOUNTS = [
    { id: 'account_1', name: '본인 계정 1', channels: ['ch_1', 'ch_2', 'ch_3'] },
    { id: 'account_2', name: '본인 계정 2', channels: ['ch_4', 'ch_5', 'ch_6'] },
    { id: 'account_3', name: '본인 계정 3', channels: ['ch_7', 'ch_8', 'ch_9'] },
    { id: 'account_4', name: '가족A 계정 1', channels: ['ch_10', 'ch_11', 'ch_12'] },
    { id: 'account_5', name: '가족A 계정 2', channels: ['ch_13', 'ch_14', 'ch_15'] },
    { id: 'account_6', name: '가족B 계정 1', channels: ['ch_16', 'ch_17', 'ch_18'] },
    { id: 'account_7', name: '가족B 계정 2', channels: ['ch_19', 'ch_20', 'ch_21'] },
];

// 21개 채널 목록 (플랫)
const ALL_CHANNELS = ACCOUNTS.flatMap(a => a.channels);

// ============================================
// 핫타임존 설정 (5060세대 최적화)
// ============================================

const HOT_TIMEZONES = {
    morning: {
        baseHour: 7,        // 아침 7시
        baseMinute: 0,
        windowMinutes: 60,  // 7:00 ~ 8:00 사이 분산
    },
    evening: {
        baseHour: 19,       // 저녁 7시
        baseMinute: 0,
        windowMinutes: 60,  // 19:00 ~ 20:00 사이 분산
    }
};

// ============================================
// 랜덤 오프셋 생성 (1~15분 범위)
// ============================================

function getRandomOffset(min = 1, max = 15) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ============================================
// 일일 스케줄 생성 함수
// ============================================

function generateDailySchedule(date) {
    const schedule = [];
    const usedSlots = new Set(); // 중복 방지

    ALL_CHANNELS.forEach((channelId, index) => {
        // 아침 타임슬롯
        const morningSlot = generateUniqueSlot(
            HOT_TIMEZONES.morning,
            usedSlots,
            date,
            'morning'
        );

        // 저녁 타임슬롯
        const eveningSlot = generateUniqueSlot(
            HOT_TIMEZONES.evening,
            usedSlots,
            date,
            'evening'
        );

        schedule.push({
            channelId,
            channelIndex: index + 1,
            date: formatDate(date),
            slots: [
                { period: 'morning', time: morningSlot },
                { period: 'evening', time: eveningSlot }
            ]
        });
    });

    return schedule;
}

// ============================================
// 고유 타임슬롯 생성 (중복 방지)
// ============================================

function generateUniqueSlot(timezone, usedSlots, date, period) {
    let attempts = 0;
    const maxAttempts = 100;

    while (attempts < maxAttempts) {
        // 기본 시간 + 윈도우 내 랜덤 분 배치
        const randomMinuteInWindow = Math.floor(Math.random() * timezone.windowMinutes);
        const totalMinutes = timezone.baseHour * 60 + timezone.baseMinute + randomMinuteInWindow;

        // 1~15분 추가 랜덤 오프셋 (패턴 회피)
        const offset = getRandomOffset(-15, 15);
        const finalMinutes = totalMinutes + offset;

        const hour = Math.floor(finalMinutes / 60);
        const minute = finalMinutes % 60;

        const slotKey = `${formatDate(date)}_${period}_${hour}:${String(minute).padStart(2, '0')}`;

        // 같은 분에 중복 업로드 방지
        if (!usedSlots.has(slotKey)) {
            usedSlots.add(slotKey);
            return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        }

        attempts++;
    }

    // 실패 시 기본값
    return `${String(timezone.baseHour).padStart(2, '0')}:${String(timezone.baseMinute).padStart(2, '0')}`;
}

// ============================================
// 유틸리티 함수
// ============================================

function formatDate(date) {
    return date.toISOString().split('T')[0];
}

function formatScheduleForDisplay(schedule) {
    return schedule.map(item => ({
        channel: item.channelId,
        morning: item.slots.find(s => s.period === 'morning').time,
        evening: item.slots.find(s => s.period === 'evening').time
    }));
}

// ============================================
// n8n 통합용 함수 (Code 노드에서 사용)
// ============================================

function getNextUploadSlot(channelId) {
    const now = new Date();
    const schedule = generateDailySchedule(now);
    const channelSchedule = schedule.find(s => s.channelId === channelId);

    if (!channelSchedule) return null;

    // 현재 시간 이후의 다음 슬롯 찾기
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    for (const slot of channelSchedule.slots) {
        if (slot.time > currentTime) {
            return {
                channelId,
                scheduledTime: slot.time,
                period: slot.period,
                date: formatDate(now)
            };
        }
    }

    // 오늘 슬롯 없으면 내일 아침
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowSchedule = generateDailySchedule(tomorrow);
    const tomorrowChannel = tomorrowSchedule.find(s => s.channelId === channelId);

    return {
        channelId,
        scheduledTime: tomorrowChannel.slots[0].time,
        period: 'morning',
        date: formatDate(tomorrow)
    };
}

// ============================================
// 테스트 실행
// ============================================

function testScheduleGeneration() {
    const today = new Date();
    const schedule = generateDailySchedule(today);

    console.log('=== 21채널 일일 스케줄 ===\n');
    console.log(`날짜: ${formatDate(today)}\n`);

    const display = formatScheduleForDisplay(schedule);
    display.forEach((item, idx) => {
        console.log(`채널 ${idx + 1} (${item.channel}): 아침 ${item.morning} | 저녁 ${item.evening}`);
    });

    // 분포 통계
    const morningTimes = display.map(d => d.morning);
    const eveningTimes = display.map(d => d.evening);

    console.log('\n=== 시간 분포 통계 ===');
    console.log(`아침: ${Math.min(...morningTimes.map(t => parseInt(t.split(':')[0]) * 60 + parseInt(t.split(':')[1])))} ~ ${Math.max(...morningTimes.map(t => parseInt(t.split(':')[0]) * 60 + parseInt(t.split(':')[1])))} 분`);
    console.log(`저녁: ${Math.min(...eveningTimes.map(t => parseInt(t.split(':')[0]) * 60 + parseInt(t.split(':')[1])))} ~ ${Math.max(...eveningTimes.map(t => parseInt(t.split(':')[0]) * 60 + parseInt(t.split(':')[1])))} 분`);
}

// 테스트 실행
// testScheduleGeneration();

// n8n에서 사용할 때는 아래 exports 사용
// module.exports = { generateDailySchedule, getNextUploadSlot, ALL_CHANNELS, ACCOUNTS };
