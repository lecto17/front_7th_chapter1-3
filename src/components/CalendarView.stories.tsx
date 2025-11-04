import type { Meta, StoryObj } from '@storybook/react-vite';

import { CalendarView } from './CalendarView';
import { Event } from '../types';

// 샘플 이벤트 데이터
const mockEvents: Event[] = [
  {
    id: '1',
    title: '팀 회의',
    date: '2024-11-05',
    startTime: '10:00',
    endTime: '11:00',
    description: '주간 팀 회의',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '2',
    title: '점심 약속',
    date: '2024-11-05',
    startTime: '12:00',
    endTime: '13:00',
    description: '친구와 점심',
    location: '레스토랑',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '3',
    title: '프로젝트 발표',
    date: '2024-11-06',
    startTime: '14:00',
    endTime: '15:00',
    description: '분기 프로젝트 발표',
    location: '대회의실',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 60,
  },
  {
    id: '4',
    title: '운동',
    date: '2024-11-07',
    startTime: '18:00',
    endTime: '19:00',
    description: '헬스장',
    location: '피트니스센터',
    category: '개인',
    repeat: { type: 'weekly', interval: 1 },
    notificationTime: 30,
  },
  {
    id: '5',
    title: '가족 저녁',
    date: '2024-11-08',
    startTime: '19:00',
    endTime: '21:00',
    description: '가족과 저녁 식사',
    location: '집',
    category: '가족',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 60,
  },
];

// 많은 이벤트가 있는 날
const manyEventsOnSameDay: Event[] = [
  {
    id: '1',
    title: '아침 미팅',
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
    title: '프로젝트 리뷰',
    date: '2024-11-05',
    startTime: '11:00',
    endTime: '12:00',
    description: '',
    location: '',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '3',
    title: '점심 약속',
    date: '2024-11-05',
    startTime: '12:30',
    endTime: '13:30',
    description: '',
    location: '',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '4',
    title: '클라이언트 미팅',
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
    id: '5',
    title: '보고서 작성',
    date: '2024-11-05',
    startTime: '16:00',
    endTime: '17:00',
    description: '',
    location: '',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
];

// 반복 일정이 많은 경우
const recurringEvents: Event[] = [
  {
    id: '1',
    title: '일일 스탠드업',
    date: '2024-11-04',
    startTime: '09:00',
    endTime: '09:30',
    description: '매일 아침 스탠드업',
    location: '온라인',
    category: '업무',
    repeat: { type: 'daily', interval: 1, endDate: '2024-12-31' },
    notificationTime: 10,
  },
  {
    id: '2',
    title: '주간 회의',
    date: '2024-11-04',
    startTime: '14:00',
    endTime: '15:00',
    description: '매주 월요일 정기 회의',
    location: '회의실 B',
    category: '업무',
    repeat: { type: 'weekly', interval: 1, endDate: '2024-12-31' },
    notificationTime: 30,
  },
  {
    id: '3',
    title: '월간 보고',
    date: '2024-11-01',
    startTime: '10:00',
    endTime: '11:00',
    description: '매월 초 보고',
    location: '대회의실',
    category: '업무',
    repeat: { type: 'monthly', interval: 1, endDate: '2024-12-31' },
    notificationTime: 1440,
  },
];

// 샘플 휴일 데이터
const mockHolidays = {
  '2024-11-03': '문화의 날',
  '2024-11-11': '빼빼로데이',
};

const meta = {
  title: 'Calendar/CalendarView',
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
    currentDate: {
      control: 'date',
      description: '현재 표시할 날짜',
    },
  },
} satisfies Meta<typeof CalendarView>;

export default meta;
type Story = StoryObj<typeof meta>;

// 기본 주간 뷰
export const WeekView: Story = {
  args: {
    view: 'week',
    currentDate: new Date('2024-11-04'),
    filteredEvents: mockEvents,
    holidays: mockHolidays,
    notifiedEvents: [],
    onDateClick: (dateString: string) => console.log('Date clicked:', dateString),
    onDragStart: (event: Event) => () => console.log('Drag start:', event.title),
    onDragEnd: () => console.log('Drag end'),
    onDragOver: (dateString: string) => (e: React.DragEvent) => {
      e.preventDefault();
      console.log('Drag over:', dateString);
    },
    onDrop: (dateString: string) => () => console.log('Drop on:', dateString),
    getDragStyles: () => ({}),
    getDropZoneStyles: () => ({}),
  },
};

// 기본 월간 뷰
export const MonthView: Story = {
  args: {
    view: 'month',
    currentDate: new Date('2024-11-04'),
    filteredEvents: mockEvents,
    holidays: mockHolidays,
    notifiedEvents: [],
    onDateClick: (dateString: string) => console.log('Date clicked:', dateString),
    onDragStart: (event: Event) => () => console.log('Drag start:', event.title),
    onDragEnd: () => console.log('Drag end'),
    onDragOver: (dateString: string) => (e: React.DragEvent) => {
      e.preventDefault();
      console.log('Drag over:', dateString);
    },
    onDrop: (dateString: string) => () => console.log('Drop on:', dateString),
    getDragStyles: () => ({}),
    getDropZoneStyles: () => ({}),
  },
};

// 빈 주간 뷰 (이벤트 없음)
export const EmptyWeekView: Story = {
  args: {
    ...WeekView.args,
    filteredEvents: [],
  },
};

// 빈 월간 뷰 (이벤트 없음)
export const EmptyMonthView: Story = {
  args: {
    ...MonthView.args,
    filteredEvents: [],
  },
};

// 많은 이벤트가 있는 주간 뷰
export const WeekViewWithManyEvents: Story = {
  args: {
    ...WeekView.args,
    filteredEvents: manyEventsOnSameDay,
  },
};

// 많은 이벤트가 있는 월간 뷰
export const MonthViewWithManyEvents: Story = {
  args: {
    ...MonthView.args,
    filteredEvents: manyEventsOnSameDay,
  },
};

// 알림이 활성화된 주간 뷰
export const WeekViewWithNotifications: Story = {
  args: {
    ...WeekView.args,
    notifiedEvents: ['1', '3'], // 팀 회의와 프로젝트 발표에 알림
  },
};

// 알림이 활성화된 월간 뷰
export const MonthViewWithNotifications: Story = {
  args: {
    ...MonthView.args,
    notifiedEvents: ['1', '3'], // 팀 회의와 프로젝트 발표에 알림
  },
};

// 반복 일정이 있는 주간 뷰
export const WeekViewWithRecurringEvents: Story = {
  args: {
    ...WeekView.args,
    filteredEvents: recurringEvents,
  },
};

// 반복 일정이 있는 월간 뷰
export const MonthViewWithRecurringEvents: Story = {
  args: {
    ...MonthView.args,
    filteredEvents: recurringEvents,
  },
};

// 휴일이 있는 월간 뷰 (휴일 강조)
export const MonthViewWithHolidays: Story = {
  args: {
    ...MonthView.args,
    holidays: {
      '2024-11-03': '문화의 날',
      '2024-11-11': '빼빼로데이',
      '2024-11-15': '현대의 날',
    },
  },
};

// 드래그 앤 드롭 스타일이 적용된 월간 뷰
export const MonthViewWithDragStyles: Story = {
  args: {
    ...MonthView.args,
    getDragStyles: (eventId: string) => ({
      opacity: eventId === '1' ? 0.5 : 1,
      cursor: 'move',
    }),
    getDropZoneStyles: (dateString: string) => ({
      backgroundColor: dateString === '2024-11-10' ? '#e3f2fd' : 'transparent',
    }),
  },
};
