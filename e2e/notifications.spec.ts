import { test, expect } from '@playwright/test';

import { createEvent, resetDatabase } from './test-helpers';
import { formatDate } from '../src/utils/dateUtils';

function formatTimeHHMM(d: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`; // HH:mm
}

test.describe('알림 시스템 워크플로우', () => {
  test.beforeEach(async ({ page }) => {
    await resetDatabase(page);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  // 알림 시간 설정 테스트 - 파라미터화
  const notificationOptions = [
    { label: '1분 전', time: '15:00' },
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
    const now = new Date();

    // 일정 시작 시간: 1분 후
    // 알림 설정: 1분 전이므로, 알림은 거의 즉시 발생합니다
    // 알림 발생 조건: timeDiff <= notificationTime (1분 <= 1분) → true
    const eventTime = new Date(now.getTime() + 1 * 60 * 1000);
    await createEvent(page, {
      title: '알림 발생 테스트',
      date: formatDate(eventTime),
      startTime: formatTimeHHMM(eventTime),
      endTime: formatTimeHHMM(new Date(eventTime.getTime() + 30 * 60 * 1000)),
      category: '업무',
      notificationTime: '1분 전',
    });

    const eventList = page.getByTestId('event-list');
    const eventItem = eventList.getByText('알림 발생 테스트');
    await expect(eventItem).toBeVisible();

    // 알림 아이콘이 표시되는지 확인 (최대 10초 대기)
    // 알림은 거의 즉시 발생하므로 짧은 타임아웃으로 충분
    // 알림 아이콘은 이벤트 제목과 같은 Stack 내에 있는 SVG 아이콘입니다
    // 이벤트 카드 내에서 SVG 아이콘을 찾되, 제목과 같은 행에 있는 것을 찾습니다
    const eventCard = eventItem.locator('..').locator('..'); // 이벤트 카드로 이동
    const notificationIcon = eventCard.locator('svg').first(); // 첫 번째 SVG 아이콘 (알림 아이콘)
    await expect(notificationIcon).toBeVisible({ timeout: 10000 });

    // 알림 스낵바가 표시되는지 확인
    // 알림 메시지 형식: "1분 후 알림 발생 테스트 일정이 시작됩니다."
    await expect(
      page.getByText('알림 발생 테스트 일정이 시작됩니다', { exact: false })
    ).toBeVisible({
      timeout: 10000,
    });
  });

  test('여러 일정의 알림 동시 처리', async ({ page }) => {
    const now = new Date();

    // 첫 번째 일정 (1분 후)
    const eventTime1 = new Date(now.getTime() + 1 * 60 * 1000);
    await createEvent(page, {
      title: '동시 알림 1',
      date: formatDate(eventTime1),
      startTime: formatTimeHHMM(eventTime1),
      endTime: formatTimeHHMM(new Date(eventTime1.getTime() + 60 * 60 * 1000)),
      category: '업무',
      notificationTime: '1분 전',
    });

    // 두 번째 일정 (1분 5초 후 - 거의 동시)
    const eventTime2 = new Date(now.getTime() + 1.08 * 60 * 1000);
    await createEvent(page, {
      title: '동시 알림 2',
      date: formatDate(eventTime2),
      startTime: formatTimeHHMM(eventTime2),
      endTime: formatTimeHHMM(new Date(eventTime2.getTime() + 60 * 60 * 1000)),
      category: '업무',
      notificationTime: '1분 전',
    });

    // 모든 알림이 나타날 때까지 대기
    // 알림 메시지 형식: "1분 후 동시 알림 1 일정이 시작됩니다."
    // 일정 시작 시간: 둘 다 1분 후
    // 알림 설정: 1분 전
    // 알림 발생 조건: timeDiff <= notificationTime (1분 <= 1분) → true
    // 알림 발생 시간: 거의 즉시 (useNotifications가 1초마다 체크하므로 최대 1-2초 지연)
    // 타임아웃을 충분히 설정하여 알림이 확실히 발생할 때까지 대기
    await expect(page.getByText('동시 알림 1 일정이 시작됩니다', { exact: false })).toBeVisible({
      timeout: 10000,
    });

    await expect(page.getByText('동시 알림 2 일정이 시작됩니다', { exact: false })).toBeVisible({
      timeout: 10000,
    });

    // 2개의 알림이 모두 표시되는지 확인
    const alertCount = await page.locator('[role="alert"]').count();
    expect(alertCount).toBeGreaterThanOrEqual(2);
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
