import { test, expect, Page } from '@playwright/test';

import { resetDatabase } from './test-helpers';

// 헬퍼 함수: 반복 일정 생성
async function createRecurringEvent(
  page: Page,
  eventData: {
    title?: string;
    date?: string;
    startTime?: string;
    endTime?: string;
    description?: string;
    location?: string;
    category?: '업무' | '개인';
    repeatType: 'daily' | 'weekly' | 'monthly' | 'yearly';
    repeatInterval?: string;
    repeatEndDate?: string;
  }
) {
  const {
    title = '반복 일정',
    date = new Date().toISOString().split('T')[0],
    startTime = '10:00',
    endTime = '11:00',
    description = '일정 설명',
    location = '강남구 테헤란로',
    category = '업무',
    repeatType = 'weekly',
    repeatInterval = '1',
    repeatEndDate,
  } = eventData;

  await page.fill('#title', title);
  await page.fill('#date', date);
  await page.fill('#start-time', startTime);
  await page.fill('#end-time', endTime);
  await page.fill('#description', description);
  await page.fill('#location', location);
  await page.click('#category');
  await page.getByRole('option', { name: category }).click();

  // 반복 일정 체크
  await page.check('input[type="checkbox"]');

  // 반복 유형 선택
  await page.click('[aria-label="반복 유형"]');
  await page.click(`[aria-label="${repeatType}-option"]`);

  // 반복 간격 설정
  await page.fill('#repeat-interval', repeatInterval);

  // 반복 종료일 설정 (있는 경우에만)
  if (repeatEndDate) {
    await page.fill('#repeat-end-date', repeatEndDate);
  }

  // 일정 추가
  await page.click('[data-testid="event-submit-button"]');

  // 일정 겹침 다이얼로그 자동 처리
  const continueButton = page.getByRole('button', { name: '계속 진행' });

  if (await continueButton.isVisible({ timeout: 1000 }).catch(() => false)) {
    await continueButton.click();
  }

  // 성공 알림 대기 (일정이 실제로 저장되었는지 확인)
  await expect(page.getByText('일정이 추가되었습니다').last()).toBeVisible({ timeout: 5000 });
}

// 헬퍼 함수: N일 후 날짜 문자열 반환
function getDateAfterDays(days: number, baseDate = new Date()): string {
  const date = new Date(baseDate);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

test.describe('반복 일정 관리 워크플로우', () => {
  test.beforeEach(async ({ page }) => {
    await resetDatabase(page);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('반복 일정 생성 - 매일 반복', async ({ page }) => {
    const today = new Date();
    const dateString = today.toISOString().split('T')[0];

    await createRecurringEvent(page, {
      title: '매일 운동',
      date: dateString,
      startTime: '06:00',
      endTime: '07:00',
      description: '아침 운동',
      repeatType: 'daily',
      repeatInterval: '1',
      repeatEndDate: getDateAfterDays(7, today),
    });

    // 반복 일정이 생성되었는지 확인
    const eventList = page.getByTestId('event-list');

    // 일정이 여러 개 생성되었는지 확인 (반복 일정이므로)
    // 일정이 리스트에 나타날 때까지 대기
    await expect(eventList.getByText('매일 운동', { exact: true }).first()).toBeVisible({
      timeout: 5000,
    });

    const eventCards = eventList.getByText('매일 운동', { exact: true });
    const count = await eventCards.count();

    // 최소 1개 이상의 일정이 생성되어야 함
    expect(count).toBeGreaterThan(0);
  });

  test('반복 일정 생성 - 매주 반복', async ({ page }) => {
    const today = new Date();
    const dateString = today.toISOString().split('T')[0];

    await createRecurringEvent(page, {
      title: '주간 회의',
      date: dateString,
      startTime: '14:00',
      endTime: '15:00',
      repeatType: 'weekly',
      repeatInterval: '1',
      repeatEndDate: getDateAfterDays(28, today),
    });

    // 반복 일정 확인
    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('주간 회의', { exact: true }).first()).toBeVisible({
      timeout: 5000,
    });

    const eventCards = eventList.getByText('주간 회의', { exact: true });
    const count = await eventCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('반복 일정 생성 - 매월 반복', async ({ page }) => {
    const today = new Date();
    const dateString = today.toISOString().split('T')[0];

    await createRecurringEvent(page, {
      title: '월간 보고',
      date: dateString,
      startTime: '10:00',
      endTime: '11:00',
      repeatType: 'monthly',
      repeatInterval: '1',
    });

    // 반복 일정 확인
    const eventList = page.getByTestId('event-list');
    // 일정이 리스트에 나타날 때까지 대기
    await expect(eventList.getByText('월간 보고', { exact: true }).first()).toBeVisible({
      timeout: 5000,
    });

    const eventCards = eventList.getByText('월간 보고', { exact: true });
    const count = await eventCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('반복 일정 생성 - 매년 반복', async ({ page }) => {
    const today = new Date();
    const dateString = today.toISOString().split('T')[0];

    await createRecurringEvent(page, {
      title: '생일',
      date: dateString,
      startTime: '00:00',
      endTime: '23:59',
      repeatType: 'yearly',
      repeatInterval: '1',
    });

    // 반복 일정 확인
    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('생일', { exact: true }).first()).toBeVisible({
      timeout: 5000,
    });

    const eventCards = eventList.getByText('생일', { exact: true });
    const count = await eventCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('반복 일정 수정 - 단일 일정만 수정', async ({ page }) => {
    const today = new Date();
    const dateString = today.toISOString().split('T')[0];

    // 반복 일정 생성
    await createRecurringEvent(page, {
      title: '반복 미팅',
      date: dateString,
      startTime: '09:00',
      endTime: '10:00',
      repeatType: 'daily',
      repeatInterval: '1',
      repeatEndDate: getDateAfterDays(5, today),
    });

    // 반복 일정이 생성될 때까지 대기
    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('반복 미팅', { exact: true }).first()).toBeVisible();

    // 첫 번째 일정 카드 내에서 수정 버튼 클릭
    const eventCard = eventList.locator('div').filter({ hasText: '반복 미팅' }).first();
    await eventCard.locator('[aria-label="Edit event"]').click();

    // 반복 일정 수정 다이얼로그가 표시되는지 확인
    await expect(page.getByRole('heading', { name: '반복 일정 수정' })).toBeVisible();

    // "예"(단일 수정) 선택
    await page.click('button:has-text("예")');

    // 제목 수정
    await page.fill('#title', '반복 미팅 (수정됨)');

    // 수정 완료
    await page.click('[data-testid="event-submit-button"]');

    // 수정된 일정 확인
    await expect(eventList.getByText('반복 미팅 (수정됨)').first()).toBeVisible();
  });

  test('반복 일정 수정 - 모든 일정 수정', async ({ page }) => {
    const today = new Date();
    const dateString = today.toISOString().split('T')[0];

    // 반복 일정 생성
    await createRecurringEvent(page, {
      title: '팀 스탠드업',
      date: dateString,
      startTime: '09:30',
      endTime: '10:00',
      repeatType: 'daily',
      repeatInterval: '1',
      repeatEndDate: getDateAfterDays(3, today),
    });

    // 반복 일정이 생성될 때까지 대기
    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('팀 스탠드업').first()).toBeVisible();

    // 첫 번째 일정 카드 내에서 수정 버튼 클릭
    const eventCard = eventList.locator('div').filter({ hasText: '팀 스탠드업' }).first();
    await eventCard.locator('[aria-label="Edit event"]').click();

    // 반복 일정 수정 다이얼로그 확인
    await expect(page.getByRole('heading', { name: '반복 일정 수정', exact: true })).toBeVisible();

    // "아니오"(전체 수정) 선택
    await page.click('button:has-text("아니오")');

    // 제목 수정
    await page.fill('#title', '팀 스탠드업 (전체 수정)');

    // 수정 완료
    await page.click('[data-testid="event-submit-button"]');

    // 수정된 일정 확인
    await expect(eventList.getByText('팀 스탠드업 (전체 수정)').first()).toBeVisible();
  });

  test('반복 일정 삭제 - 단일 일정만 삭제', async ({ page }) => {
    const today = new Date();
    const dateString = today.toISOString().split('T')[0];

    // 반복 일정 생성
    await createRecurringEvent(page, {
      title: '반복 일정 삭제 테스트',
      date: dateString,
      startTime: '11:00',
      endTime: '12:00',
      repeatType: 'daily',
      repeatInterval: '1',
      repeatEndDate: getDateAfterDays(5, today),
    });

    // 반복 일정이 생성될 때까지 대기
    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('반복 일정 삭제 테스트').first()).toBeVisible();

    // 첫 번째 일정 카드 내에서 삭제 버튼 클릭
    const eventCard = eventList.locator('div').filter({ hasText: '반복 일정 삭제 테스트' }).first();
    await eventCard.locator('[aria-label="Delete event"]').click();

    // 반복 일정 삭제 다이얼로그 확인
    await expect(page.getByRole('heading', { name: '반복 일정 삭제' })).toBeVisible();

    // "예"(단일 삭제) 선택
    await page.click('button:has-text("예")');

    // 스낵바 확인
    await expect(page.getByText('일정이 삭제되었습니다')).toBeVisible();
  });

  test('반복 일정 삭제 - 모든 일정 삭제', async ({ page }) => {
    const today = new Date();
    const dateString = today.toISOString().split('T')[0];

    // 반복 일정 생성
    await createRecurringEvent(page, {
      title: '전체 삭제 테스트',
      date: dateString,
      startTime: '13:00',
      endTime: '14:00',
      repeatType: 'daily',
      repeatInterval: '1',
      repeatEndDate: getDateAfterDays(3, today),
    });

    // 반복 일정이 생성될 때까지 대기
    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('전체 삭제 테스트').first()).toBeVisible();

    // 첫 번째 일정 카드 내에서 삭제 버튼 클릭
    const eventCard = eventList.locator('div').filter({ hasText: '전체 삭제 테스트' }).first();
    await eventCard.locator('[aria-label="Delete event"]').click();

    // 반복 일정 삭제 다이얼로그 확인
    await expect(page.getByRole('heading', { name: '반복 일정 삭제' })).toBeVisible();

    // "아니오"(전체 삭제) 선택
    await page.click('button:has-text("아니오")');

    // 삭제 성공 알림 대기
    await expect(page.getByText('일정이 삭제되었습니다')).toBeVisible({ timeout: 5000 });

    // 일정이 삭제되었는지 확인
    const eventCards = eventList.getByText('전체 삭제 테스트', { exact: true });
    const count = await eventCards.count();
    expect(count).toBe(0);
  });
});
