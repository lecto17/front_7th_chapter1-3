import { test, expect } from '@playwright/test';

import { resetDatabase } from './test-helpers';

// 헬퍼 함수: N일 후 날짜 문자열 반환
function getDateAfterDays(days: number, baseDate = new Date()): string {
  const date = new Date(baseDate);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

test.describe('날짜 클릭 기능', () => {
  test.beforeEach(async ({ page }) => {
    await resetDatabase(page);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('날짜 클릭 시 폼 자동 채우기 및 포커스 이동', async ({ page }) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowString = tomorrow.toISOString().split('T')[0];
    const tomorrowDay = tomorrow.getDate();

    // Month 뷰 확인
    await expect(page.getByTestId('month-view')).toBeVisible();

    // 내일 날짜 셀 찾기 (비어있는 셀)
    const monthView = page.getByTestId('month-view');
    const tomorrowCell = monthView
      .locator('td')
      .filter({ hasText: new RegExp(`^${tomorrowDay}$`) })
      .first();

    // 날짜 셀 클릭
    await tomorrowCell.click();

    // 날짜 필드에 자동으로 채워졌는지 확인
    const dateInput = page.locator('#date');
    await expect(dateInput).toHaveValue(tomorrowString);

    // 제목 필드에 포커스가 이동했는지 확인
    const titleInput = page.locator('#title');
    await expect(titleInput).toBeFocused();
  });
});

