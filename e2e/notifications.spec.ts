import { test, expect } from '@playwright/test';

import { resetDatabase } from './test-helpers';

test.describe('알림 시스템 워크플로우', () => {
  test.beforeEach(async ({ page }) => {
    await resetDatabase(page);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  // 알림 시간 설정 테스트 - 파라미터화
  const notificationOptions = [
    { label: '1분 전', time: '15:00' },
    { label: '10분 전', time: '15:00' },
    { label: '1시간 전', time: '14:00' },
    { label: '2시간 전', time: '16:00' },
    { label: '1일 전', time: '09:00', useTomorrow: true },
  ];

  for (const option of notificationOptions) {
    test(`알림 시간 설정 - ${option.label}`, async ({ page }) => {
      const today = new Date();
      let dateString: string;

      if (option.useTomorrow) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        dateString = tomorrow.toISOString().split('T')[0];
      } else {
        dateString = today.toISOString().split('T')[0];
      }

      await page.fill('#title', `${option.label} 알림`);
      await page.fill('#date', dateString);
      await page.fill('#start-time', option.time);

      const [hours, minutes] = option.time.split(':').map(Number);
      const endHour = (hours + 1).toString().padStart(2, '0');
      await page.fill('#end-time', `${endHour}:${minutes.toString().padStart(2, '0')}`);

      // 알림 시간 선택
      await page.click('#notification');
      await page.getByRole('option', { name: option.label }).click(); // ✅ 수정

      await page.click('[data-testid="event-submit-button"]');

      // 일정 생성 확인
      const eventList = page.getByTestId('event-list');
      await expect(eventList.getByText(`${option.label} 알림`)).toBeVisible();

      // 알림 설정 확인
      await expect(page.getByText(`알림: ${option.label}`)).toBeVisible();
    });
  }

  test('알림 발생 - 아이콘 및 스낵바 표시', async ({ page }) => {
    const today = new Date();

    // 현재 시간에서 90초 후 (알림이 바로 발생하도록)
    const soon = new Date(today.getTime() + 90 * 1000);
    const dateString = soon.toISOString().split('T')[0];
    const timeString = soon.toTimeString().slice(0, 5);

    await page.fill('#title', '알림 발생 테스트');
    await page.fill('#date', dateString);
    await page.fill('#start-time', timeString);

    const endTime = new Date(soon.getTime() + 30 * 60 * 1000);
    const endTimeString = endTime.toTimeString().slice(0, 5);
    await page.fill('#end-time', endTimeString);

    // 알림 시간을 1분 전으로 설정
    await page.click('#notification');
    await page.getByRole('option', { name: '1분 전' }).click();

    await page.click('[data-testid="event-submit-button"]');

    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('알림 발생 테스트')).toBeVisible();

    // 알림 아이콘이 표시되는지 확인 (최대 70초 대기)
    const notificationIcon = page.locator('[data-testid="NotificationsIcon"]').first();
    await expect(notificationIcon).toBeVisible({ timeout: 70000 });

    // 알림 스낵바가 표시되는지 확인
    await expect(
      page.getByText('알림 발생 테스트 일정이 시작됩니다', { exact: false })
    ).toBeVisible({
      timeout: 5000,
    });
  });

  test('여러 일정의 알림 동시 처리', async ({ page }) => {
    const today = new Date();
    const soon = new Date(today.getTime() + 90 * 1000);
    const dateString = soon.toISOString().split('T')[0];
    const timeString = soon.toTimeString().slice(0, 5);

    // 첫 번째 일정
    await page.fill('#title', '첫 번째 알림');
    await page.fill('#date', dateString);
    await page.fill('#start-time', timeString);
    const endTime1 = new Date(soon.getTime() + 30 * 60 * 1000);
    await page.fill('#end-time', endTime1.toTimeString().slice(0, 5));
    await page.click('#notification');
    await page.getByRole('option', { name: '1분 전' }).click();
    await page.click('[data-testid="event-submit-button"]');

    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('첫 번째 알림')).toBeVisible();

    // 두 번째 일정 (같은 시간)
    await page.fill('#title', '두 번째 알림');
    await page.fill('#date', dateString);
    await page.fill('#start-time', timeString);
    const endTime2 = new Date(soon.getTime() + 45 * 60 * 1000);
    await page.fill('#end-time', endTime2.toTimeString().slice(0, 5));
    await page.click('#notification');
    await page.getByRole('option', { name: '1분 전' }).click();
    await page.click('[data-testid="event-submit-button"]');

    // ✅ 겹침 다이얼로그 처리 추가
    await page.getByRole('button', { name: '계속 진행' }).click();

    const secondEventList = page.getByTestId('event-list');
    await expect(secondEventList.getByText('두 번째 알림')).toBeVisible();

    // 두 일정 모두 알림 아이콘이 표시되는지 확인
    const notificationIcons = eventList.locator('[data-testid="NotificationsIcon"]');
    await expect(notificationIcons).toHaveCount(2, { timeout: 70000 });
  });

  test('알림 시간 변경 - 일정 수정', async ({ page }) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split('T')[0];

    // 일정 생성 (1분 전 알림)
    await page.fill('#title', '알림 변경 테스트');
    await page.fill('#date', dateString);
    await page.fill('#start-time', '10:00');
    await page.fill('#end-time', '11:00');
    await page.click('#notification');
    await page.getByRole('option', { name: '1분 전' }).click();
    await page.click('[data-testid="event-submit-button"]');

    await expect(page.getByText('알림: 1분 전')).toBeVisible();

    // 수정
    await page.click('[aria-label="Edit event"]');

    // 알림 시간을 1시간 전으로 변경
    await page.click('#notification');
    await page.getByRole('option', { name: '1시간 전' }).click();
    await page.click('[data-testid="event-submit-button"]');

    // 변경된 알림 시간 확인
    await expect(page.getByText('알림: 1시간 전')).toBeVisible();
    await expect(page.getByText('알림: 1분 전')).not.toBeVisible();
  });

  test('반복 일정의 알림 설정', async ({ page }) => {
    const today = new Date();
    const dateString = today.toISOString().split('T')[0];

    await page.fill('#title', '반복 일정 알림');
    await page.fill('#date', dateString);
    await page.fill('#start-time', '09:00');
    await page.fill('#end-time', '10:00');

    // 반복 일정 설정
    await page.check('input[type="checkbox"]');
    await page.click('[aria-label="반복 유형"]');
    await page.click('[aria-label="daily-option"]');
    await page.fill('#repeat-interval', '1');

    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + 3);
    await page.fill('#repeat-end-date', endDate.toISOString().split('T')[0]);

    // 알림 설정
    await page.click('#notification');
    await page.getByRole('option', { name: '10분 전' }).click();

    await page.click('[data-testid="event-submit-button"]');

    // 반복 일정 생성 확인
    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('반복 일정 알림').first()).toBeVisible();
    await expect(eventList.getByText('알림: 10분 전').first()).toBeVisible();
  });

  test('과거 일정은 알림이 발생하지 않음', async ({ page }) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateString = yesterday.toISOString().split('T')[0];

    await page.fill('#title', '과거 일정');
    await page.fill('#date', dateString);
    await page.fill('#start-time', '10:00');
    await page.fill('#end-time', '11:00');

    // 알림 설정
    await page.click('#notification');
    await page.getByRole('option', { name: '1분 전' }).click();

    await page.click('[data-testid="event-submit-button"]');

    // 일정은 생성되지만 알림 아이콘이 표시되지 않음
    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('과거 일정')).toBeVisible();

    // 알림 아이콘이 없는지 확인 (과거 일정이므로)
    const eventListItem = page.locator('text=과거 일정').locator('..');
    const notificationIcon = eventListItem.locator('[data-testid="NotificationsIcon"]');
    await expect(notificationIcon).not.toBeVisible();
  });
});
