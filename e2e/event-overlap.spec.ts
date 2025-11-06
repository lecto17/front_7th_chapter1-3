import { test, expect } from '@playwright/test';

import { resetDatabase, createEvent } from './test-helpers';

test.describe('일정 겹침 처리 워크플로우', () => {
  test.beforeEach(async ({ page }) => {
    await resetDatabase(page); // 각 테스트 전 데이터베이스 초기화
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('겹치는 일정 생성 - 취소', async ({ page }) => {
    const today = new Date();
    const dateString = today.toISOString().split('T')[0];

    const eventList = page.getByTestId('event-list');

    // 첫 번째 일정 생성 (겹침 다이얼로그 자동 처리)
    await createEvent(page, {
      title: '원본 일정',
      date: dateString,
      startTime: '14:00',
      endTime: '15:00',
    });

    await expect(eventList.getByText('원본 일정')).toBeVisible();

    // 겹치는 일정 생성 시도
    await page.fill('#title', '겹치는 일정');
    await page.fill('#date', dateString);
    await page.fill('#start-time', '14:30');
    await page.fill('#end-time', '15:30');
    await page.click('[data-testid="event-submit-button"]');

    // 다이얼로그 확인
    await expect(page.getByText('일정 겹침 경고')).toBeVisible();

    // 취소 버튼 클릭
    await page.click('button:has-text("취소")');

    // 겹치는 일정이 생성되지 않았는지 확인
    await expect(eventList.getByText('겹치는 일정')).not.toBeVisible();

    // 원본 일정은 여전히 존재
    await expect(eventList.getByText('원본 일정')).toBeVisible();
  });

  test('겹치는 일정 생성 - 계속 진행', async ({ page }) => {
    const today = new Date();
    const dateString = today.toISOString().split('T')[0];

    const eventList = page.getByTestId('event-list');

    // 첫 번째 일정 생성 (겹침 다이얼로그 자동 처리)
    await createEvent(page, {
      title: '기존 일정',
      date: dateString,
      startTime: '09:00',
      endTime: '10:00',
    });

    await expect(eventList.getByText('기존 일정')).toBeVisible();

    // 겹치는 일정 생성
    await page.fill('#title', '새 일정');
    await page.fill('#date', dateString);
    await page.fill('#start-time', '09:30');
    await page.fill('#end-time', '10:30');
    await page.click('[data-testid="event-submit-button"]');

    // 다이얼로그 확인
    await expect(page.getByText('일정 겹침 경고')).toBeVisible();

    // 계속 진행 버튼 클릭
    await page.click('button:has-text("계속 진행")');

    // 두 일정 모두 존재하는지 확인
    await expect(eventList.getByText('기존 일정')).toBeVisible();
    await expect(eventList.getByText('새 일정')).toBeVisible();
  });

  test('한 일정이 다른 일정을 완전히 포함하는 경우', async ({ page }) => {
    const today = new Date();
    const dateString = today.toISOString().split('T')[0];

    const eventList = page.getByTestId('event-list');

    // 짧은 일정: 10:30 - 11:00 (겹침 다이얼로그 자동 처리)
    await createEvent(page, {
      title: '짧은 미팅',
      date: dateString,
      startTime: '10:30',
      endTime: '11:00',
    });

    await expect(eventList.getByText('짧은 미팅')).toBeVisible();

    // 긴 일정: 10:00 - 12:00 (짧은 일정을 완전히 포함)
    await page.fill('#title', '긴 워크샵');
    await page.fill('#date', dateString);
    await page.fill('#start-time', '10:00');
    await page.fill('#end-time', '12:00');
    await page.click('[data-testid="event-submit-button"]');

    // 겹침 경고 확인
    await expect(page.getByText('일정 겹침 경고')).toBeVisible();
  });

  test('겹치지 않는 일정 - 연속된 시간대', async ({ page }) => {
    const today = new Date();
    const dateString = today.toISOString().split('T')[0];

    const eventList = page.getByTestId('event-list');

    // 첫 번째 일정: 09:00 - 10:00 (겹침 다이얼로그 자동 처리)
    await createEvent(page, {
      title: '아침 회의',
      date: dateString,
      startTime: '09:00',
      endTime: '10:00',
    });

    await expect(eventList.getByText('아침 회의')).toBeVisible();

    // 두 번째 일정: 10:00 - 11:00 (첫 번째가 끝나는 시간에 시작)
    await page.fill('#title', '점심 전 회의');
    await page.fill('#date', dateString);
    await page.fill('#start-time', '10:00');
    await page.fill('#end-time', '11:00');
    await page.click('[data-testid="event-submit-button"]');

    // 겹침 경고가 나타나지 않아야 함
    await expect(page.getByText('일정 겹침 경고', { exact: true })).not.toBeVisible();

    // 두 일정 모두 존재
    await expect(eventList.getByText('아침 회의')).toBeVisible();
    await expect(eventList.getByText('점심 전 회의')).toBeVisible();
  });

  test('일정 수정 시 겹침 검사', async ({ page }) => {
    const today = new Date();
    const dateString = today.toISOString().split('T')[0];

    const eventList = page.getByTestId('event-list');

    // 첫 번째 일정 (겹침 다이얼로그 자동 처리)
    await createEvent(page, {
      title: '고정 일정',
      date: dateString,
      startTime: '11:00',
      endTime: '12:00',
    });

    await expect(eventList.getByText('고정 일정')).toBeVisible();

    // 두 번째 일정 (겹치지 않음, 겹침 다이얼로그 자동 처리)
    await createEvent(page, {
      title: '수정할 일정',
      date: dateString,
      startTime: '13:00',
      endTime: '14:00',
    });

    await expect(eventList.getByText('수정할 일정')).toBeVisible();

    // 두 번째 일정 수정 (첫 번째와 겹치도록)
    const editButtons = page.locator('[aria-label="Edit event"]');
    await editButtons.last().click();

    // 시간을 변경하여 첫 번째 일정과 겹치도록
    await page.fill('#start-time', '11:30');
    await page.fill('#end-time', '12:30');
    await page.click('[data-testid="event-submit-button"]');

    // 겹침 경고 확인
    await expect(page.getByText('일정 겹침 경고')).toBeVisible();
  });
});
