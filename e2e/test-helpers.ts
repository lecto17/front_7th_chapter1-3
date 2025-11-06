import { expect, Page } from '@playwright/test';

/**
 * E2E 테스트용 데이터베이스 초기화
 * /api/reset 엔드포인트를 호출하여 e2e.json을 빈 배열로 초기화합니다.
 */
export async function resetDatabase(page: Page) {
  const response = await page.request.post('/api/reset');

  if (!response.ok) {
    throw new Error(`Failed to reset database: ${response.status} ${response.statusText}`);
  }

  // 빈 응답이나 JSON이 아닌 경우 처리
  const text = await response.text();
  if (!text || text.trim() === '') {
    return { message: 'Database reset successfully', events: [] };
  }

  try {
    const result = await JSON.parse(text);
    return result;
  } catch (error) {
    // JSON 파싱 실패 시 기본값 반환
    return { message: 'Database reset successfully', events: [] };
  }
}

// 헬퍼 함수: 일정 생성
export async function createEvent(
  page: Page,
  eventData: {
    title?: string;
    date?: string;
    startTime?: string;
    endTime?: string;
    description?: string;
    location?: string;
    category?: '업무' | '개인';
    notificationTime?: string; // 알림 시간 (예: '1분 전', '10분 전')
  }
) {
  const {
    title = 'E2E 테스트 일정',
    date = '2025-11-06',
    startTime = '10:00',
    endTime = '11:00',
    description = '테스트 설명입니다',
    location = '테스트 장소',
    category = '업무',
    notificationTime,
  } = eventData;

  await page.fill('#title', title);
  await page.fill('#date', date);
  await page.fill('#start-time', startTime);
  await page.fill('#end-time', endTime);
  await page.fill('#description', description);
  await page.fill('#location', location);
  await page.click('#category');
  await page.getByRole('option', { name: category }).click();

  // 알림 설정 (있는 경우에만)
  if (notificationTime) {
    await page.click('#notification');
    await page.getByRole('option', { name: notificationTime }).click();
  }

  await page.click('[data-testid="event-submit-button"]');

  // 일정 겹침 다이얼로그 자동 처리
  const continueButton = page.getByRole('button', { name: '계속 진행' });

  if (await continueButton.isVisible({ timeout: 1000 }).catch(() => false)) {
    await continueButton.click();
  }

  // 성공 알림 대기 (일정이 실제로 저장되었는지 확인)
  await expect(page.getByText('일정이 추가되었습니다').last()).toBeVisible({ timeout: 5000 });
}
