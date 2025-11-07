import { test, expect, Page } from '@playwright/test';

import { createEvent, resetDatabase } from './test-helpers';
import { formatDate } from '../src/utils/dateUtils';

// 헬퍼 함수: 반복 일정 생성
async function createRecurringEvent(
  page: Page,
  eventData: {
    title?: string;
    date?: string;
    startTime?: string;
    endTime?: string;
    repeatType: 'daily' | 'weekly' | 'monthly' | 'yearly';
    repeatInterval?: string;
    repeatEndDate?: string;
  }
) {
  const {
    title = '반복 일정',
    date = formatDate(new Date()),
    startTime = '10:00',
    endTime = '11:00',
    repeatType = 'weekly',
    repeatInterval = '1',
    repeatEndDate,
  } = eventData;

  await page.fill('#title', title);
  await page.fill('#date', date);
  await page.fill('#start-time', startTime);
  await page.fill('#end-time', endTime);

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

  // 성공 알림 대기
  await expect(page.getByText('일정이 추가되었습니다').last()).toBeVisible({ timeout: 5000 });
}

// 헬퍼 함수: N일 후 날짜 문자열 반환
function getDateAfterDays(days: number, baseDate = new Date()): string {
  const date = new Date(baseDate);
  date.setDate(date.getDate() + days);
  return formatDate(date);
}

test.describe('드래그 앤 드롭 기능', () => {
  test.beforeEach(async ({ page }) => {
    await resetDatabase(page);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('일반 일정 드래그 앤 드롭 - 다른 날짜로 이동', async ({ page }) => {
    const today = new Date();
    const todayString = formatDate(today);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowString = formatDate(tomorrow);

    const eventTitle = `드래그 테스트 일정 ${Date.now()}`;

    // 일정 생성
    await createEvent(page, {
      title: eventTitle,
      date: todayString,
      startTime: '14:00',
      endTime: '15:00',
    });

    // 일정이 리스트에 나타날 때까지 대기
    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText(eventTitle)).toBeVisible();

    // Month 뷰 확인
    await expect(page.getByTestId('month-view')).toBeVisible();

    // 캘린더에서 일정 요소 찾기 (제목 텍스트로)
    const monthView = page.getByTestId('month-view');
    const eventElement = monthView.getByText(eventTitle);

    // 내일 날짜 셀 찾기 - 날짜 숫자가 정확히 일치하는 paragraph의 부모 td 선택
    const tomorrowDay = tomorrow.getDate();
    const tomorrowDateParagraph = monthView
      .getByText(tomorrowDay.toString(), { exact: true })
      .first();
    const tomorrowCell = tomorrowDateParagraph.locator('xpath=ancestor::td');

    // 드래그 앤 드롭 실행
    await eventElement.dragTo(tomorrowCell);

    // 일정이 새로운 날짜로 이동했는지 확인
    // event-list에서 날짜 확인
    const eventCard = eventList.locator('div').filter({ hasText: eventTitle }).first();
    await expect(eventCard.getByText(tomorrowString)).toBeVisible();
  });

  test('반복 일정 드래그 앤 드롭 - 단일 일정만 이동', async ({ page }) => {
    const today = new Date();
    const todayString = formatDate(today);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const endDate = getDateAfterDays(5, today);

    const eventTitle = `반복 드래그 테스트 ${Date.now()}`;

    // 반복 일정 생성
    await createRecurringEvent(page, {
      title: eventTitle,
      date: todayString,
      startTime: '09:00',
      endTime: '10:00',
      repeatType: 'daily',
      repeatInterval: '1',
      repeatEndDate: endDate,
    });

    // 일정이 리스트에 나타날 때까지 대기
    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText(eventTitle).first()).toBeVisible({ timeout: 5000 });

    // Month 뷰 확인
    await expect(page.getByTestId('month-view')).toBeVisible();

    // 캘린더에서 첫 번째 반복 일정 요소 찾기
    const monthView = page.getByTestId('month-view');
    const eventElements = monthView.getByText(eventTitle);
    const firstEventElement = eventElements.first();

    // 내일 날짜 셀 찾기 - 날짜 숫자가 정확히 일치하는 paragraph의 부모 td 선택
    const tomorrowDay = tomorrow.getDate();
    const tomorrowDateParagraph = monthView
      .getByText(tomorrowDay.toString(), { exact: true })
      .first();
    const tomorrowCell = tomorrowDateParagraph.locator('xpath=ancestor::td');

    // 타겟 셀이 보이는지 확인
    await expect(tomorrowCell).toBeVisible();

    // 드래그 앤 드롭 실행
    await firstEventElement.dragTo(tomorrowCell);

    // 반복 일정 수정 다이얼로그 확인
    await expect(page.getByRole('heading', { name: '반복 일정 수정' })).toBeVisible();

    // "예"(단일 수정) 선택
    await page.click('button:has-text("예")');

    // 단일 일정만 이동했는지 확인
    // 새로운 날짜에 이동한 일정이 있는지 확인
    const tomorrowEvents = tomorrowCell.getByText(eventTitle);
    await expect(tomorrowEvents.first()).toBeVisible();

    // 반복 일정 시리즈가 여전히 존재하는지 확인 (event-list에서 확인)
    // 단일 수정 후에도 다른 반복 일정들이 남아있어야 함
    const remainingRecurringEvents = eventList.getByText(eventTitle);
    const recurringEventCount = await remainingRecurringEvents.count();
    // 최소 2개 이상이어야 함 (이동한 일정 + 남은 반복 일정들)
    expect(recurringEventCount).toBeGreaterThanOrEqual(2);
  });
});
