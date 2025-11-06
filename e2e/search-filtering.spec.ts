import { test, expect } from '@playwright/test';

import { resetDatabase, createEvent } from './test-helpers';

test.describe('검색 및 필터링 워크플로우', () => {
  test.beforeEach(async ({ page }) => {
    await resetDatabase(page);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('기본 검색 기능 - 제목 검색, 대소문자 무관, 검색어 지우기', async ({ page }) => {
    const today = new Date();
    const dateString = today.toISOString().split('T')[0];

    // 여러 일정 생성
    await createEvent(page, {
      title: '팀 회의',
      date: dateString,
      startTime: '10:00',
      endTime: '11:00',
    });

    await createEvent(page, {
      title: '점심 약속',
      date: dateString,
      startTime: '12:00',
      endTime: '13:00',
    });

    await createEvent(page, {
      title: 'Meeting with Team',
      date: dateString,
      startTime: '14:00',
      endTime: '15:00',
    });

    const eventList = page.getByTestId('event-list');

    // 모든 일정이 표시되는지 확인
    await expect(eventList.getByText('팀 회의')).toBeVisible();
    await expect(eventList.getByText('점심 약속')).toBeVisible();
    await expect(eventList.getByText('Meeting with Team')).toBeVisible();

    // '회의' 검색
    await page.fill('#search', '회의');
    await expect(eventList.getByText('팀 회의')).toBeVisible();
    await expect(eventList.getByText('점심 약속')).not.toBeVisible();
    await expect(eventList.getByText('Meeting with Team')).not.toBeVisible();

    // 대소문자 무관 검색 - 소문자로 검색
    await page.fill('#search', 'meeting');
    await expect(eventList.getByText('Meeting with Team')).toBeVisible();
    await expect(eventList.getByText('팀 회의')).not.toBeVisible();
    await expect(eventList.getByText('점심 약속')).not.toBeVisible();

    // 대소문자 무관 검색 - 대문자로 검색
    await page.fill('#search', 'MEETING');
    await expect(eventList.getByText('Meeting with Team')).toBeVisible();
    await expect(eventList.getByText('팀 회의')).not.toBeVisible();

    // 검색어 지우기
    await page.fill('#search', '');

    // 모든 일정 다시 표시
    await expect(eventList.getByText('팀 회의')).toBeVisible();
    await expect(eventList.getByText('점심 약속')).toBeVisible();
    await expect(eventList.getByText('Meeting with Team')).toBeVisible();
  });

  test('다양한 필드 검색 - 제목, 설명, 위치, 부분 일치', async ({ page }) => {
    const today = new Date();
    const dateString = today.toISOString().split('T')[0];

    // 제목에 키워드가 있는 일정
    await page.fill('#title', '개발팀 회의');
    await page.fill('#date', dateString);
    await page.fill('#start-time', '10:00');
    await page.fill('#end-time', '11:00');
    await page.fill('#description', '일반적인 내용');
    await page.fill('#location', '회의실 A');
    await page.click('#category');
    await page.getByRole('option', { name: '업무' }).click();
    await page.click('[data-testid="event-submit-button"]');
    await expect(page.getByText('일정이 추가되었습니다').last()).toBeVisible({ timeout: 5000 });

    // 설명에 키워드가 있는 일정
    await page.fill('#title', '일정 A');
    await page.fill('#date', dateString);
    await page.fill('#start-time', '13:00');
    await page.fill('#end-time', '14:00');
    await page.fill('#description', '중요한 프로젝트 논의');
    await page.fill('#location', '회의실 B');
    await page.click('#category');
    await page.getByRole('option', { name: '업무' }).click();
    await page.click('[data-testid="event-submit-button"]');
    await expect(page.getByText('일정이 추가되었습니다').last()).toBeVisible({ timeout: 5000 });

    // 위치에 키워드가 있는 일정
    await page.fill('#title', '일정 B');
    await page.fill('#date', dateString);
    await page.fill('#start-time', '15:00');
    await page.fill('#end-time', '16:00');
    await page.fill('#description', '일반 업무');
    await page.fill('#location', '본사 3층');
    await page.click('#category');
    await page.getByRole('option', { name: '업무' }).click();
    await page.click('[data-testid="event-submit-button"]');
    await expect(page.getByText('일정이 추가되었습니다').last()).toBeVisible({ timeout: 5000 });

    const eventList = page.getByTestId('event-list');

    // 설명으로 검색
    await page.fill('#search', '프로젝트');
    await expect(eventList.getByText('일정 A')).toBeVisible();
    await expect(eventList.getByText('개발팀 회의')).not.toBeVisible();
    await expect(eventList.getByText('일정 B')).not.toBeVisible();

    // 위치로 검색
    await page.fill('#search', '본사');
    await expect(eventList.getByText('일정 B')).toBeVisible();
    await expect(eventList.getByText('개발팀 회의')).not.toBeVisible();
    await expect(eventList.getByText('일정 A')).not.toBeVisible();

    // 부분 일치 검색 - '개발' 부분만
    await page.fill('#search', '개발');
    await expect(eventList.getByText('개발팀 회의')).toBeVisible();
    await expect(eventList.getByText('일정 A')).not.toBeVisible();
    await expect(eventList.getByText('일정 B')).not.toBeVisible();

    // 부분 일치 검색 - '팀' 부분만
    await page.fill('#search', '팀');
    await expect(eventList.getByText('개발팀 회의')).toBeVisible();
    await expect(eventList.getByText('일정 A')).not.toBeVisible();
  });

  test('뷰 전환과 필터링 - Week/Month 뷰, 검색과 뷰 전환 조합', async ({ page }) => {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    const nextMonth = new Date(today);
    nextMonth.setMonth(today.getMonth() + 1);

    const todayString = today.toISOString().split('T')[0];
    const nextWeekString = nextWeek.toISOString().split('T')[0];
    const nextMonthString = nextMonth.toISOString().split('T')[0];

    // 이번 주 일정
    await createEvent(page, {
      title: '이번 주 회의',
      date: todayString,
      startTime: '10:00',
      endTime: '11:00',
    });

    // 다음 주 일정
    await createEvent(page, {
      title: '다음 주 회의',
      date: nextWeekString,
      startTime: '10:00',
      endTime: '11:00',
    });

    // 다음 달 일정
    await createEvent(page, {
      title: '다음 달 일정',
      date: nextMonthString,
      startTime: '10:00',
      endTime: '11:00',
    });

    // 검색 결과 확인을 위한 일정 추가
    await createEvent(page, {
      title: '중요 업무',
      date: todayString,
      startTime: '14:00',
      endTime: '15:00',
    });

    // Week 뷰로 명시적으로 설정
    await page.click('[aria-label="뷰 타입 선택"]');
    await page.click('[aria-label="week-option"]');

    const eventList = page.getByTestId('event-list');

    // Week 뷰에서는 이번 주 일정만 표시
    await expect(eventList.getByText('이번 주 회의')).toBeVisible();
    await expect(eventList.getByText('중요 업무')).toBeVisible();
    await expect(eventList.getByText('다음 주 회의')).not.toBeVisible();
    await expect(eventList.getByText('다음 달 일정')).not.toBeVisible();

    // Month 뷰로 전환
    await page.click('[aria-label="뷰 타입 선택"]');
    await page.click('[aria-label="month-option"]');

    // Month 뷰에서는 이번 달 일정만 표시 (이번 주 + 다음 주, 다음 달은 제외)
    await expect(eventList.getByText('이번 주 회의')).toBeVisible();
    await expect(eventList.getByText('다음 주 회의')).toBeVisible();
    await expect(eventList.getByText('중요 업무')).toBeVisible();
    await expect(eventList.getByText('다음 달 일정')).not.toBeVisible();

    // Week 뷰로 다시 전환
    await page.click('[aria-label="뷰 타입 선택"]');
    await page.click('[aria-label="week-option"]');

    // 검색어 입력
    await page.fill('#search', '회의');
    await expect(eventList.getByText('이번 주 회의')).toBeVisible();
    await expect(eventList.getByText('중요 업무')).not.toBeVisible();
    await expect(eventList.getByText('다음 주 회의')).not.toBeVisible();

    // Month 뷰로 전환 후에도 검색 결과 유지
    await page.click('[aria-label="뷰 타입 선택"]');
    await page.click('[aria-label="month-option"]');
    await expect(eventList.getByText('이번 주 회의')).toBeVisible();
    await expect(eventList.getByText('다음 주 회의')).toBeVisible();
    await expect(eventList.getByText('중요 업무')).not.toBeVisible();

    // Week 뷰로 다시 전환해도 검색 결과 유지
    await page.click('[aria-label="뷰 타입 선택"]');
    await page.click('[aria-label="week-option"]');
    await expect(eventList.getByText('이번 주 회의')).toBeVisible();
    await expect(eventList.getByText('중요 업무')).not.toBeVisible();
  });

  test('엣지 케이스 - 검색 결과 없음, 빈 검색어', async ({ page }) => {
    const today = new Date();
    const dateString = today.toISOString().split('T')[0];

    // 일정 생성
    await createEvent(page, {
      title: '회의',
      date: dateString,
      startTime: '10:00',
      endTime: '11:00',
    });

    await createEvent(page, {
      title: '기존 업무',
      date: dateString,
      startTime: '14:00',
      endTime: '15:00',
    });

    const eventList = page.getByTestId('event-list');

    // 매칭되지 않는 검색어 입력
    await page.fill('#search', '존재하지않는검색어xyz');
    // "검색 결과가 없습니다." 메시지 확인
    await expect(page.getByText('검색 결과가 없습니다.')).toBeVisible();

    // 빈 검색어 - 모든 일정 표시
    await page.fill('#search', '');
    await expect(eventList.getByText('기존 업무')).toBeVisible();
    await expect(eventList.getByText('회의')).toBeVisible();

    // 공백만 입력 - 모든 일정 표시
    await page.fill('#search', '   ');
    await expect(page.getByText('검색 결과가 없습니다.')).toBeVisible();
  });
});
