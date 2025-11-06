import type { Meta, StoryObj } from '@storybook/react-vite';

import type { DragEvent } from 'react';

import type { Event } from '../types';
import { CalendarView } from './CalendarView';

/**
 * 각 셀 텍스트 길이에 따른 처리 시각적 회귀 테스트
 *
 * 이 스토리북은 CalendarView 컴포넌트에서 다양한 길이의 텍스트가
 * 어떻게 렌더링되는지 테스트합니다:
 * - 이벤트 제목 길이 (짧음/중간/긴/매우 긴)
 * - 아이콘과 함께 있는 긴 텍스트
 * - 한 셀에 여러 긴 이벤트
 * - 휴일 텍스트 길이
 * - 극단적으로 긴 텍스트
 */

// ============================================================================
// Mock Data - 다양한 텍스트 길이별 이벤트
// ============================================================================

// 1. 기본 텍스트 길이 변화 (짧음 → 중간 → 긴 → 매우 긴)
const textLengthVariationEvents: Event[] = [
  {
    id: '1',
    title: '회의',
    date: '2024-11-04',
    startTime: '10:00',
    endTime: '11:00',
    description: '',
    location: '',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '2',
    title: '프로젝트 리뷰 미팅',
    date: '2024-11-05',
    startTime: '14:00',
    endTime: '15:00',
    description: '',
    location: '',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '3',
    title: '2024년 4분기 실적 검토 및 계획 수립 회의',
    date: '2024-11-06',
    startTime: '15:00',
    endTime: '16:00',
    description: '',
    location: '',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '4',
    title: '전사 통합 디지털 트랜스포메이션 TF 킥오프 미팅 및 향후 로드맵 논의',
    date: '2024-11-07',
    startTime: '09:00',
    endTime: '12:00',
    description: '',
    location: '',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
];

// 2. 아이콘과 함께 있는 긴 텍스트
const textWithIconsEvents: Event[] = [
  {
    id: '1',
    title: '2024년 4분기 실적 검토 및 계획 수립 회의',
    date: '2024-11-04',
    startTime: '10:00',
    endTime: '11:00',
    description: '',
    location: '',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '2',
    title: '주간 정기 업무 보고 및 다음 주 계획 수립',
    date: '2024-11-05',
    startTime: '14:00',
    endTime: '15:00',
    description: '',
    location: '',
    category: '업무',
    repeat: { type: 'weekly', interval: 1 },
    notificationTime: 0,
  },
  {
    id: '3',
    title: '월간 전체 회의 및 분기 목표 달성률 점검',
    date: '2024-11-06',
    startTime: '15:00',
    endTime: '16:00',
    description: '',
    location: '',
    category: '업무',
    repeat: { type: 'monthly', interval: 1 },
    notificationTime: 60,
  },
  {
    id: '4',
    title: '전사 통합 디지털 트랜스포메이션 TF 킥오프 미팅 및 향후 로드맵 논의',
    date: '2024-11-07',
    startTime: '09:00',
    endTime: '12:00',
    description: '',
    location: '',
    category: '업무',
    repeat: { type: 'daily', interval: 1, endDate: '2024-12-31' },
    notificationTime: 30,
  },
];

// 3. 한 셀에 여러 긴 이벤트
const multipleEventsInCellEvents: Event[] = [
  // 화요일에 5개의 긴 제목 이벤트 집중
  {
    id: '1',
    title: '2024년 상반기 인사평가 결과 공유 및 피드백 세션',
    date: '2024-11-05',
    startTime: '09:00',
    endTime: '10:00',
    description: '',
    location: '',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '2',
    title: '신규 프로젝트 기획안 검토 및 예산 승인 요청',
    date: '2024-11-05',
    startTime: '10:30',
    endTime: '11:30',
    description: '',
    location: '',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '3',
    title: '마케팅 팀과 영업 팀 간 협업 체계 구축 논의',
    date: '2024-11-05',
    startTime: '13:00',
    endTime: '14:00',
    description: '',
    location: '',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '4',
    title: '고객 만족도 조사 결과 분석 및 개선 방안 도출',
    date: '2024-11-05',
    startTime: '14:30',
    endTime: '15:30',
    description: '',
    location: '',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '5',
    title: '차세대 시스템 구축 프로젝트 킥오프 미팅',
    date: '2024-11-05',
    startTime: '16:00',
    endTime: '17:00',
    description: '',
    location: '',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '6',
    title: '정보보안 정책 업데이트 및 전직원 교육 계획',
    date: '2024-11-05',
    startTime: '17:30',
    endTime: '18:30',
    description: '',
    location: '',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  // 수요일에 짧은/긴 제목 혼합
  {
    id: '7',
    title: '회의',
    date: '2024-11-06',
    startTime: '09:00',
    endTime: '10:00',
    description: '',
    location: '',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '8',
    title: '글로벌 마케팅 전략 수립 및 지역별 실행 계획 논의',
    date: '2024-11-06',
    startTime: '11:00',
    endTime: '12:00',
    description: '',
    location: '',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '9',
    title: '점심',
    date: '2024-11-06',
    startTime: '12:00',
    endTime: '13:00',
    description: '',
    location: '',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 0,
  },
  {
    id: '10',
    title: '연구개발팀 기술 세미나 및 최신 기술 동향 공유',
    date: '2024-11-06',
    startTime: '14:00',
    endTime: '15:00',
    description: '',
    location: '',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
];

// 4. 휴일 텍스트 길이 (월간 뷰 전용)
const holidayTextLengthEvents: Event[] = [
  {
    id: '1',
    title: '전사 통합 디지털 트랜스포메이션 TF 킥오프 미팅',
    date: '2024-11-03',
    startTime: '10:00',
    endTime: '11:00',
    description: '',
    location: '',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '2',
    title: '2024년 4분기 실적 검토 및 계획 수립 회의',
    date: '2024-11-05',
    startTime: '14:00',
    endTime: '15:00',
    description: '',
    location: '',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '3',
    title: '글로벌 마케팅 전략 수립 및 지역별 실행 계획',
    date: '2024-11-15',
    startTime: '09:00',
    endTime: '11:00',
    description: '',
    location: '',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
];

const longHolidays = {
  '2024-11-03': '삼일절',
  '2024-11-05': '어린이날',
  '2024-11-15': '스승의 날 및 교육자 감사의 날',
};

// 5. 극단적으로 긴 텍스트 (모든 아이콘 + 매우 긴 제목들)
const extremeLongTextEvents: Event[] = [
  {
    id: '1',
    title: '전사 통합 디지털 트랜스포메이션 TF 킥오프 미팅 및 향후 5개년 로드맵 논의',
    date: '2024-11-05',
    startTime: '09:00',
    endTime: '10:00',
    description: '',
    location: '',
    category: '업무',
    repeat: { type: 'daily', interval: 1, endDate: '2024-12-31' },
    notificationTime: 30,
  },
  {
    id: '2',
    title: '글로벌 시장 진출 전략 수립 및 각 지역별 맞춤형 실행 계획 상세 검토',
    date: '2024-11-05',
    startTime: '10:30',
    endTime: '11:30',
    description: '',
    location: '',
    category: '업무',
    repeat: { type: 'weekly', interval: 2 },
    notificationTime: 60,
  },
  {
    id: '3',
    title: '차세대 클라우드 기반 통합 시스템 구축 프로젝트 1단계 킥오프 및 일정 조율',
    date: '2024-11-05',
    startTime: '13:00',
    endTime: '14:00',
    description: '',
    location: '',
    category: '업무',
    repeat: { type: 'monthly', interval: 1, endDate: '2025-06-30' },
    notificationTime: 120,
  },
  {
    id: '4',
    title: 'AI 기반 고객 경험 혁신 및 데이터 분석 플랫폼 고도화 방안 논의',
    date: '2024-11-05',
    startTime: '14:30',
    endTime: '15:30',
    description: '',
    location: '',
    category: '업무',
    repeat: { type: 'weekly', interval: 1 },
    notificationTime: 45,
  },
  {
    id: '5',
    title: '조직문화 혁신 및 구성원 몰입도 향상을 위한 중장기 전략 워크숍',
    date: '2024-11-05',
    startTime: '16:00',
    endTime: '17:00',
    description: '',
    location: '',
    category: '업무',
    repeat: { type: 'monthly', interval: 1 },
    notificationTime: 90,
  },
  {
    id: '6',
    title: '친환경 경영 실천 및 ESG 경영 강화를 위한 전사 실행 계획 수립',
    date: '2024-11-05',
    startTime: '17:30',
    endTime: '18:30',
    description: '',
    location: '',
    category: '업무',
    repeat: { type: 'daily', interval: 1 },
    notificationTime: 15,
  },
];

const extremeLongTextHolidays = {
  '2024-11-05': '대한민국 임시정부 수립 기념일 및 순국선열의 날',
};

// 6. 모든 시나리오 통합 (월간 뷰)
const allScenariosEvents: Event[] = [
  // 1일: 짧은 제목
  {
    id: '1',
    title: '회의',
    date: '2024-11-01',
    startTime: '10:00',
    endTime: '11:00',
    description: '',
    location: '',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 0,
  },

  // 3일: 중간 제목
  {
    id: '2',
    title: '프로젝트 리뷰 미팅',
    date: '2024-11-03',
    startTime: '14:00',
    endTime: '15:00',
    description: '',
    location: '',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 0,
  },

  // 5일: 긴 제목
  {
    id: '3',
    title: '2024년 4분기 실적 검토 및 계획 수립 회의',
    date: '2024-11-05',
    startTime: '09:00',
    endTime: '10:00',
    description: '',
    location: '',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 0,
  },

  // 7일: 매우 긴 제목
  {
    id: '4',
    title: '전사 통합 디지털 트랜스포메이션 TF 킥오프 미팅 및 향후 로드맵 논의',
    date: '2024-11-07',
    startTime: '10:00',
    endTime: '11:00',
    description: '',
    location: '',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 0,
  },

  // 10일: 긴 제목 + 알림 아이콘
  {
    id: '5',
    title: '글로벌 마케팅 전략 수립 및 지역별 실행 계획',
    date: '2024-11-10',
    startTime: '14:00',
    endTime: '15:00',
    description: '',
    location: '',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 30,
  },

  // 12일: 긴 제목 + 반복 아이콘
  {
    id: '6',
    title: '주간 정기 업무 보고 및 다음 주 계획 수립',
    date: '2024-11-12',
    startTime: '10:00',
    endTime: '11:00',
    description: '',
    location: '',
    category: '업무',
    repeat: { type: 'weekly', interval: 1 },
    notificationTime: 0,
  },

  // 15일: 긴 제목 + 알림+반복 아이콘
  {
    id: '7',
    title: '월간 전체 회의 및 분기 목표 달성률 점검',
    date: '2024-11-15',
    startTime: '09:00',
    endTime: '10:00',
    description: '',
    location: '',
    category: '업무',
    repeat: { type: 'monthly', interval: 1 },
    notificationTime: 60,
  },

  // 20일: 여러 긴 이벤트
  {
    id: '8',
    title: '2024년 상반기 인사평가 결과 공유 및 피드백',
    date: '2024-11-20',
    startTime: '09:00',
    endTime: '10:00',
    description: '',
    location: '',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 0,
  },
  {
    id: '9',
    title: '신규 프로젝트 기획안 검토 및 예산 승인',
    date: '2024-11-20',
    startTime: '11:00',
    endTime: '12:00',
    description: '',
    location: '',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 0,
  },
  {
    id: '10',
    title: '마케팅 팀과 영업 팀 간 협업 체계 구축',
    date: '2024-11-20',
    startTime: '14:00',
    endTime: '15:00',
    description: '',
    location: '',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 0,
  },

  // 25일: 극한 테스트 (매우 긴 + 아이콘들)
  {
    id: '11',
    title: '전사 통합 디지털 트랜스포메이션 TF 킥오프 미팅 및 향후 5개년 로드맵 논의',
    date: '2024-11-25',
    startTime: '10:00',
    endTime: '11:00',
    description: '',
    location: '',
    category: '업무',
    repeat: { type: 'daily', interval: 1 },
    notificationTime: 30,
  },
  {
    id: '12',
    title: '글로벌 시장 진출 전략 수립 및 각 지역별 맞춤형 실행 계획 상세 검토',
    date: '2024-11-25',
    startTime: '14:00',
    endTime: '15:00',
    description: '',
    location: '',
    category: '업무',
    repeat: { type: 'weekly', interval: 1 },
    notificationTime: 60,
  },
];

const allScenariosHolidays = {
  '2024-11-03': '문화의 날',
  '2024-11-15': '스승의 날 및 교육자 감사의 날',
};

// ============================================================================
// Storybook Meta
// ============================================================================

const meta = {
  title: 'Calendar/CalendarView/TextLength',
  component: CalendarView,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    view: {
      control: 'radio',
      options: ['week', 'month'],
      description: '캘린더 뷰 타입 (주간/월간)',
    },
  },
} satisfies Meta<typeof CalendarView>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================================================
// Stories
// ============================================================================

// 1. 기본 텍스트 길이 변화 - 주간 뷰
export const TextLengthVariations_WeekView: Story = {
  args: {
    view: 'week',
    currentDate: new Date('2024-11-04'),
    filteredEvents: textLengthVariationEvents,
    holidays: {},
    notifiedEvents: [],
    onDateClick: (dateString: string) => console.log('Date clicked:', dateString),
    onDragStart: (event: Event) => () => console.log('Drag start:', event.title),
    onDragEnd: () => console.log('Drag end'),
    onDragOver: () => (e: DragEvent) => {
      e.preventDefault();
    },
    onDrop: (dateString: string) => () => console.log('Drop on:', dateString),
    getDragStyles: () => ({}),
    getDropZoneStyles: () => ({}),
  },
};

// 2. 기본 텍스트 길이 변화 - 월간 뷰
export const TextLengthVariations_MonthView: Story = {
  args: {
    ...TextLengthVariations_WeekView.args,
    view: 'month',
  },
};

// 3. 아이콘과 함께 있는 긴 텍스트 - 주간 뷰
export const TextWithIcons_WeekView: Story = {
  args: {
    ...TextLengthVariations_WeekView.args,
    filteredEvents: textWithIconsEvents,
    notifiedEvents: ['1', '3', '4'], // 알림 아이콘 추가
  },
};

// 4. 아이콘과 함께 있는 긴 텍스트 - 월간 뷰
export const TextWithIcons_MonthView: Story = {
  args: {
    ...TextWithIcons_WeekView.args,
    view: 'month',
  },
};

// 5. 한 셀에 여러 긴 이벤트 - 주간 뷰
export const MultipleEventsPerCell_WeekView: Story = {
  args: {
    ...TextLengthVariations_WeekView.args,
    filteredEvents: multipleEventsInCellEvents,
  },
};

// 6. 한 셀에 여러 긴 이벤트 - 월간 뷰
export const MultipleEventsPerCell_MonthView: Story = {
  args: {
    ...MultipleEventsPerCell_WeekView.args,
    view: 'month',
  },
};

// 7. 휴일 텍스트 길이 - 월간 뷰
export const HolidayTextLength_MonthView: Story = {
  args: {
    ...TextLengthVariations_WeekView.args,
    view: 'month',
    filteredEvents: holidayTextLengthEvents,
    holidays: longHolidays,
  },
};

// 8. 극단적으로 긴 텍스트 - 주간 뷰
export const ExtremeLongText_WeekView: Story = {
  args: {
    ...TextLengthVariations_WeekView.args,
    filteredEvents: extremeLongTextEvents,
    holidays: extremeLongTextHolidays,
    notifiedEvents: ['1', '2', '3', '4', '5', '6'],
  },
};

// 9. 극단적으로 긴 텍스트 - 월간 뷰
export const ExtremeLongText_MonthView: Story = {
  args: {
    ...ExtremeLongText_WeekView.args,
    view: 'month',
  },
};

// 10. 모든 시나리오 통합 - 월간 뷰
export const AllScenariosCombined_MonthView: Story = {
  args: {
    ...TextLengthVariations_WeekView.args,
    view: 'month',
    filteredEvents: allScenariosEvents,
    holidays: allScenariosHolidays,
    notifiedEvents: ['5', '7', '11', '12'],
  },
};
