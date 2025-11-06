import { test, expect } from '@playwright/test';

import { createEvent, resetDatabase } from './test-helpers';

test.describe('일정 관리 CRUD 워크플로우', () => {
  test.beforeEach(async ({ page }) => {
    await resetDatabase(page);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('일정 생성(Create) - 기본 일정 추가', async ({ page }) => {
    // 일정 생성 전 개수 확인
    const uniqueTitle = `E2E 테스트 일정 ${Date.now()}`;

    // 일정 생성
    await createEvent(page, { title: uniqueTitle });

    // 성공 알림 확인
    await expect(page.getByText('일정이 추가되었습니다')).toBeVisible();

    // 일정이 리스트에 추가될 때까지 대기
    const eventList = page.getByTestId('event-list');
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

    // 성공 알림 확인
    await expect(page.getByText('일정이 추가되었습니다')).toBeVisible();

    // 검증: 일정이 표시되는지 확인
    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText(uniqueTitle)).toBeVisible();
  });

  test('일정 수정(Update) - 기존 일정 편집', async ({ page }) => {
    const originalTitle = `수정 전 제목`;
    const updatedTitle = `수정 후 제목`;

    // 일정 생성
    await createEvent(page, { title: originalTitle });

    // 성공 알림 확인
    await expect(page.getByText('일정이 추가되었습니다')).toBeVisible();

    // 일정이 리스트에 나타날 때까지 대기
    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText(originalTitle)).toBeVisible({ timeout: 3000 });

    // 수정 버튼 클릭 - 특정 일정의 수정 버튼 클릭
    const eventCard = eventList.locator('div').filter({ hasText: originalTitle }).first();
    await eventCard.locator('[aria-label="Edit event"]').click();

    // 제목 수정
    await page.fill('#title', updatedTitle);
    await page.click('[data-testid="event-submit-button"]');

    // 겹침 다이얼로그 처리
    const continueButton = page.getByRole('button', { name: '계속 진행' });
    if (await continueButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await continueButton.click();
    }

    // 성공 알림 확인
    await expect(page.getByText('일정이 수정되었습니다')).toBeVisible({ timeout: 5000 });

    // 검증: 수정된 제목이 표시되고 이전 제목은 사라짐
    await expect(eventList.getByText(updatedTitle)).toBeVisible();
    await expect(eventList.getByText(originalTitle)).not.toBeVisible({ timeout: 10000 });
  });

  test('일정 삭제(Delete) - 일정 제거', async ({ page }) => {
    const uniqueTitle = `삭제될 일정 ${Date.now()}`;

    // 일정 생성
    await createEvent(page, {
      title: uniqueTitle,
      startTime: '16:00',
      endTime: '17:00',
    });

    // 성공 알림 확인
    await expect(page.getByText('일정이 추가되었습니다')).toBeVisible();

    // 일정이 생성될 때까지 대기
    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText(uniqueTitle)).toBeVisible();

    const initialCount = await eventList.locator('> div').count();

    // 삭제 버튼 클릭
    const eventCard = eventList.locator('div').filter({ hasText: uniqueTitle }).first();
    await eventCard.locator('[aria-label="Delete event"]').click();

    // 검증: 일정 개수가 감소했는지 확인
    await expect(page.getByText('일정이 삭제되었습니다')).toBeVisible();
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

    // 성공 알림 확인
    await expect(page.getByText('일정이 추가되었습니다')).toBeVisible();

    // 2. Read - 생성된 일정 확인
    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('통합 테스트 일정')).toBeVisible();
    await expect(eventList.getByText('통합 테스트', { exact: true })).toBeVisible();
    await expect(eventList.getByText('회의실 A')).toBeVisible();
    await expect(eventList.getByText('13:00 - 14:00')).toBeVisible();
    await expect(eventList.getByText('카테고리: 개인')).toBeVisible();

    // 3. Update - 일정 수정
    const eventCard = eventList.locator('div').filter({ hasText: '통합 테스트 일정' }).first();
    await eventCard.locator('[aria-label="Edit event"]').click();
    await page.fill('#title', '통합 테스트 일정 (수정됨)');
    await page.fill('#start-time', '15:00');
    await page.fill('#end-time', '16:00');
    await page.click('[data-testid="event-submit-button"]');

    // 겹침 다이얼로그 처리
    const continueButton = page.getByRole('button', { name: '계속 진행' });
    if (await continueButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await continueButton.click();
    }

    // 성공 알림 확인
    await expect(page.getByText('일정이 수정되었습니다')).toBeVisible();

    // 수정된 내용 확인 (event-list 내에서 확인)
    await expect(eventList.getByText('통합 테스트 일정 (수정됨)')).toBeVisible();
    await expect(eventList.getByText('15:00 - 16:00')).toBeVisible();

    // 4. Delete - 일정 삭제
    const updatedEventCard = eventList
      .locator('div')
      .filter({ hasText: '통합 테스트 일정 (수정됨)' })
      .first();
    await updatedEventCard.locator('[aria-label="Delete event"]').click();

    // 성공 알림 확인
    await expect(page.getByText('일정이 삭제되었습니다')).toBeVisible();

    // 삭제 확인
    await expect(eventList.getByText('통합 테스트 일정 (수정됨)')).not.toBeVisible();
    await expect(eventList.getByText('통합 테스트', { exact: true })).not.toBeVisible();
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

    // 성공 알림 확인
    await expect(page.getByText('일정이 추가되었습니다')).toBeVisible();

    await page.fill('#title', '점심 약속');
    await page.fill('#date', dateString);
    await page.fill('#start-time', '12:00');
    await page.fill('#end-time', '13:00');
    await page.click('[data-testid="event-submit-button"]');

    // 성공 알림 확인
    await expect(page.getByText('일정이 추가되었습니다')).toBeVisible();

    // 두 일정 모두 보이는지 확인
    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('회의 일정')).toBeVisible();
    await expect(eventList.getByText('점심 약속')).toBeVisible();

    // 검색어 입력
    await page.fill('#search', '회의');

    // 검색 결과 확인 - '회의'만 보이고 '점심'은 안 보임
    await expect(eventList.getByText('회의 일정', { exact: true })).toBeVisible();
    await expect(eventList.getByText('점심 약속')).not.toBeVisible();

    // 검색어 지우기
    await page.fill('#search', '');

    // 다시 모든 일정이 보이는지 확인
    await expect(eventList.getByText('회의 일정')).toBeVisible();
    await expect(eventList.getByText('점심 약속')).toBeVisible();
  });

  test('캘린더 뷰 전환 - Week/Month 토글', async ({ page }) => {
    // 기본적으로 Month 뷰인지 확인
    await expect(page.getByTestId('month-view')).toBeVisible();
    await expect(page.getByTestId('week-view')).not.toBeVisible();

    // Week 뷰로 전환
    await page.click('[aria-label="뷰 타입 선택"]');
    await page.click('[aria-label="week-option"]');

    // Week 뷰가 표시되는지 확인
    await expect(page.getByTestId('week-view')).toBeVisible();
    await expect(page.getByTestId('month-view')).not.toBeVisible();

    // Month 뷰로 다시 전환
    await page.click('[aria-label="뷰 타입 선택"]');
    await page.click('[aria-label="month-option"]');

    // Month 뷰가 다시 표시되는지 확인
    await expect(page.getByTestId('month-view')).toBeVisible();
    await expect(page.getByTestId('week-view')).not.toBeVisible();
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
