import { test, expect, Page } from '@playwright/test';

// 헬퍼 함수: 일정 생성
async function createEvent(
  page: Page,
  eventData: {
    title?: string;
    date?: string;
    startTime?: string;
    endTime?: string;
    description?: string;
    location?: string;
    category?: '업무' | '개인';
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
  } = eventData;

  await page.fill('#title', title);
  await page.fill('#date', date);
  await page.fill('#start-time', startTime);
  await page.fill('#end-time', endTime);
  await page.fill('#description', description);
  await page.fill('#location', location);
  await page.click('#category');
  await page.click(`[aria-label="${category}-option"]`);
  await page.click('[data-testid="event-submit-button"]');

  // 일정 겹침 다이얼로그 자동 처리
  const continueButton = page.getByRole('button', { name: '계속 진행' });

  if (await continueButton.isVisible({ timeout: 1000 }).catch(() => false)) {
    await continueButton.click();
  }
}

test.describe('일정 관리 CRUD 워크플로우', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('일정 생성(Create) - 기본 일정 추가', async ({ page }) => {
    const today = new Date();
    const dateString = today.toISOString().split('T')[0];

    // 일정 생성 전 개수 확인
    const eventList = page.getByTestId('event-list');
    const initialCount = await eventList.locator('> div').count();

    const uniqueTitle = `E2E 테스트 일정 ${Date.now()}`;

    // 일정 생성
    await createEvent(page, { title: uniqueTitle });

    // 검증: 일정이 추가되었는지만 확인
    const finalCount = await eventList.locator('> div').count();
    expect(finalCount).toBe(initialCount + 1);
    await expect(eventList.getByText(uniqueTitle)).toBeVisible();
  });

  test('일정 조회(Read) - 생성된 일정 확인', async ({ page }) => {
    const uniqueTitle = `조회 테스트 일정 ${Date.now()}`;

    // 일정 생성
    await createEvent(page, {
      title: uniqueTitle,
      startTime: '14:00',
      endTime: '15:00',
    });

    // 검증: 일정이 표시되는지 확인
    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText(uniqueTitle)).toBeVisible();
  });

  test('일정 수정(Update) - 기존 일정 편집', async ({ page }) => {
    const originalTitle = `수정 전 제목 ${Date.now()}`;
    const updatedTitle = `수정 후 제목 ${Date.now()}`;

    // 일정 생성
    await createEvent(page, {
      title: originalTitle,
      startTime: '09:00',
      endTime: '10:00',
    });

    // 일정이 생성될 때까지 대기
    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText(originalTitle)).toBeVisible();

    // 수정 버튼 클릭
    await page.click('[aria-label="Edit event"]');

    // 제목 수정
    await page.fill('#title', updatedTitle);
    await page.click('[data-testid="event-submit-button"]');

    // 검증: 수정된 제목이 표시되고 이전 제목은 사라짐
    const finalEventList = page.getByTestId('event-list');
    await expect(finalEventList.getByText(updatedTitle)).toBeVisible();
    await expect(finalEventList.getByText(originalTitle)).not.toBeVisible();
  });

  test('일정 삭제(Delete) - 일정 제거', async ({ page }) => {
    const uniqueTitle = `삭제될 일정 ${Date.now()}`;

    // 일정 생성
    await createEvent(page, {
      title: uniqueTitle,
      startTime: '16:00',
      endTime: '17:00',
    });

    // 일정이 생성될 때까지 대기
    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText(uniqueTitle)).toBeVisible();

    const initialCount = await eventList.locator('> div').count();

    // 삭제 버튼 클릭
    const eventCard = eventList.locator('div').filter({ hasText: uniqueTitle }).first();
    await eventCard.locator('[aria-label="Delete event"]').click();

    // 검증: 일정 개수가 감소했는지 확인
    const finalCount = await eventList.locator('> div').count();
    expect(finalCount).toBe(initialCount - 1);
    await expect(eventList.getByText(uniqueTitle)).not.toBeVisible();
  });

  test('전체 CRUD 워크플로우 - 생성, 조회, 수정, 삭제 순차 실행', async ({ page }) => {
    const today = new Date();
    const dateString = today.toISOString().split('T')[0];

    // 1. Create - 일정 생성
    await page.fill('#title', '통합 테스트 일정');
    await page.fill('#date', dateString);
    await page.fill('#start-time', '13:00');
    await page.fill('#end-time', '14:00');
    await page.fill('#description', '통합 테스트');
    await page.fill('#location', '회의실 A');
    await page.click('#category');
    await page.click('[aria-label="개인-option"]');
    await page.click('[data-testid="event-submit-button"]');

    // 2. Read - 생성된 일정 확인
    await expect(page.getByText('통합 테스트 일정')).toBeVisible();
    await expect(page.getByText('통합 테스트')).toBeVisible();
    await expect(page.getByText('회의실 A')).toBeVisible();
    await expect(page.getByText('13:00 - 14:00')).toBeVisible();
    await expect(page.getByText('카테고리: 개인')).toBeVisible();

    // 3. Update - 일정 수정
    await page.click('[aria-label="Edit event"]');
    await page.fill('#title', '통합 테스트 일정 (수정됨)');
    await page.fill('#start-time', '15:00');
    await page.fill('#end-time', '16:00');
    await page.click('[data-testid="event-submit-button"]');

    // 수정된 내용 확인
    await expect(page.getByText('통합 테스트 일정 (수정됨)')).toBeVisible();
    await expect(page.getByText('15:00 - 16:00')).toBeVisible();

    // 4. Delete - 일정 삭제
    await page.click('[aria-label="Delete event"]');

    // 삭제 확인
    await expect(page.getByText('통합 테스트 일정 (수정됨)')).not.toBeVisible();
    await expect(page.getByText('통합 테스트')).not.toBeVisible();
  });

  test('검색 기능 - 일정 검색', async ({ page }) => {
    const today = new Date();
    const dateString = today.toISOString().split('T')[0];

    // 여러 일정 생성
    await page.fill('#title', '회의 일정');
    await page.fill('#date', dateString);
    await page.fill('#start-time', '10:00');
    await page.fill('#end-time', '11:00');
    await page.click('[data-testid="event-submit-button"]');

    await page.fill('#title', '점심 약속');
    await page.fill('#date', dateString);
    await page.fill('#start-time', '12:00');
    await page.fill('#end-time', '13:00');
    await page.click('[data-testid="event-submit-button"]');

    // 두 일정 모두 보이는지 확인
    await expect(page.getByText('회의 일정')).toBeVisible();
    await expect(page.getByText('점심 약속')).toBeVisible();

    // 검색어 입력
    await page.fill('#search', '회의');

    // 검색 결과 확인 - '회의'만 보이고 '점심'은 안 보임
    await expect(page.getByText('회의 일정')).toBeVisible();
    await expect(page.getByText('점심 약속')).not.toBeVisible();

    // 검색어 지우기
    await page.fill('#search', '');

    // 다시 모든 일정이 보이는지 확인
    await expect(page.getByText('회의 일정')).toBeVisible();
    await expect(page.getByText('점심 약속')).toBeVisible();
  });

  test('캘린더 뷰 전환 - Week/Month 토글', async ({ page }) => {
    // 기본적으로 Week 뷰인지 확인
    await expect(page.getByTestId('week-view')).toBeVisible();

    // Month 뷰로 전환
    await page.click('[aria-label="뷰 타입 선택"]');
    await page.click('[aria-label="month-option"]');

    // Month 뷰가 표시되는지 확인
    await expect(page.getByTestId('month-view')).toBeVisible();
    await expect(page.getByTestId('week-view')).not.toBeVisible();

    // Week 뷰로 다시 전환
    await page.click('[aria-label="뷰 타입 선택"]');
    await page.click('[aria-label="week-option"]');

    // Week 뷰가 다시 표시되는지 확인
    await expect(page.getByTestId('week-view')).toBeVisible();
    await expect(page.getByTestId('month-view')).not.toBeVisible();
  });

  test('시간 유효성 검사 - 종료 시간이 시작 시간보다 빠른 경우', async ({ page }) => {
    const today = new Date();
    const dateString = today.toISOString().split('T')[0];

    await page.fill('#title', '시간 검증 테스트');
    await page.fill('#date', dateString);
    await page.fill('#start-time', '15:00');
    await page.fill('#end-time', '14:00'); // 종료 시간이 시작 시간보다 빠름

    // 에러 상태 확인 (Tooltip이 표시되어야 함)
    const endTimeInput = page.locator('#end-time');
    await expect(endTimeInput).toHaveAttribute('aria-invalid', 'true');
  });

  test('필수 입력 필드 검증 - 빈 값으로 제출 시도', async ({ page }) => {
    // 아무것도 입력하지 않고 제출 버튼 클릭
    await page.click('[data-testid="event-submit-button"]');

    // 스낵바 알림이 표시되는지 확인
    await expect(page.getByText('필수 정보를 모두 입력해주세요.')).toBeVisible();
  });
});
