import { Page } from '@playwright/test';

/**
 * E2E 테스트용 데이터베이스 초기화
 * /api/reset 엔드포인트를 호출하여 e2e.json을 빈 배열로 초기화합니다.
 */
export async function resetDatabase(page: Page) {
  const response = await page.request.post('/api/reset');

  if (!response.ok) {
    throw new Error(`Failed to reset database: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();
  return result;
}

/**
 * 일정 생성 헬퍼 함수 (겹침 다이얼로그 자동 처리)
 * 일정을 생성하고, 겹침 다이얼로그가 나타나면 자동으로 "계속 진행"을 클릭합니다.
 */
export async function createEvent(
  page: Page,
  eventData: {
    title: string;
    date: string;
    startTime: string;
    endTime: string;
  }
) {
  await page.fill('#title', eventData.title);
  await page.fill('#date', eventData.date);
  await page.fill('#start-time', eventData.startTime);
  await page.fill('#end-time', eventData.endTime);
  await page.click('[data-testid="event-submit-button"]');

  // 겹침 다이얼로그가 나타나면 자동으로 "계속 진행" 클릭
  const continueButton = page.getByRole('button', { name: '계속 진행' });
  if (await continueButton.isVisible({ timeout: 1000 }).catch(() => false)) {
    await continueButton.click();
  }
}
