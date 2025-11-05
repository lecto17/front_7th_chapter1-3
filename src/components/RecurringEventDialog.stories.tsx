import type { Meta, StoryObj } from '@storybook/react-vite';

import RecurringEventDialog from './RecurringEventDialog';
import { Event } from '../types';

// 샘플 반복 일정 이벤트
const mockRecurringEvent: Event = {
  id: '1',
  title: '주간 팀 회의',
  date: '2024-11-05',
  startTime: '10:00',
  endTime: '11:00',
  description: '매주 화요일 정기 회의',
  location: '회의실 A',
  category: '업무',
  repeat: { type: 'weekly', interval: 1, endDate: '2024-12-31' },
  notificationTime: 10,
};

const meta: Meta<typeof RecurringEventDialog> = {
  title: 'Components/RecurringEventDialog',
  component: RecurringEventDialog,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '반복 일정 수정/삭제 시 사용자에게 단일 일정 또는 전체 시리즈 중 선택할 수 있는 다이얼로그',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    mode: {
      control: 'radio',
      options: ['edit', 'delete'],
      description: '다이얼로그 모드 (편집/삭제)',
      table: {
        type: { summary: "'edit' | 'delete'" },
        defaultValue: { summary: 'edit' },
      },
    },
    open: {
      control: 'boolean',
      description: '다이얼로그 열림 상태',
      table: {
        type: { summary: 'boolean' },
      },
    },
    event: {
      description: '반복 일정 이벤트 객체',
      table: {
        type: { summary: 'Event | null' },
      },
    },
    onClose: {
      description: '다이얼로그 닫기 콜백',
      table: {
        type: { summary: '() => void' },
      },
    },
    onConfirm: {
      description: '사용자 선택 확인 콜백 (true: 단일 일정만, false: 전체 시리즈)',
      table: {
        type: { summary: '(editSingleOnly: boolean) => void' },
      },
    },
  },
} satisfies Meta<typeof RecurringEventDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 편집 모드 - 기본 상태
 * 반복 일정을 수정할 때 표시되는 다이얼로그
 */
export const EditMode: Story = {
  args: {
    open: true,
    mode: 'edit',
    event: mockRecurringEvent,
    onClose: () => console.log('Close clicked'),
    onConfirm: (editSingleOnly) => console.log('Confirmed - Single only:', editSingleOnly),
  },
};

/**
 * 삭제 모드
 * 반복 일정을 삭제할 때 표시되는 다이얼로그
 */
export const DeleteMode: Story = {
  args: {
    open: true,
    mode: 'delete',
    event: mockRecurringEvent,
    onClose: () => console.log('Close clicked'),
    onConfirm: (editSingleOnly) => console.log('Confirmed - Single only:', editSingleOnly),
  },
};

/**
 * 닫힌 상태
 * open=false일 때는 아무것도 렌더링되지 않음
 */
export const Closed: Story = {
  args: {
    open: false,
    mode: 'edit',
    event: mockRecurringEvent,
    onClose: () => console.log('Close clicked'),
    onConfirm: (editSingleOnly) => console.log('Confirmed - Single only:', editSingleOnly),
  },
  parameters: {
    docs: {
      description: {
        story: 'open=false일 때는 다이얼로그가 렌더링되지 않습니다.',
      },
    },
  },
};

/**
 * 매일 반복 일정 편집
 */
export const DailyRecurringEdit: Story = {
  args: {
    open: true,
    mode: 'edit',
    event: {
      ...mockRecurringEvent,
      id: '2',
      title: '데일리 스탠드업',
      repeat: { type: 'daily', interval: 1, endDate: '2024-12-31' },
    },
    onClose: () => console.log('Close clicked'),
    onConfirm: (editSingleOnly) => console.log('Confirmed - Single only:', editSingleOnly),
  },
};

/**
 * 매월 반복 일정 삭제
 */
export const MonthlyRecurringDelete: Story = {
  args: {
    open: true,
    mode: 'delete',
    event: {
      ...mockRecurringEvent,
      id: '3',
      title: '월간 보고',
      repeat: { type: 'monthly', interval: 1, endDate: '2024-12-31' },
    },
    onClose: () => console.log('Close clicked'),
    onConfirm: (editSingleOnly) => console.log('Confirmed - Single only:', editSingleOnly),
  },
};

/**
 * 매년 반복 일정 편집
 */
export const YearlyRecurringEdit: Story = {
  args: {
    open: true,
    mode: 'edit',
    event: {
      ...mockRecurringEvent,
      id: '4',
      title: '연례 행사',
      repeat: { type: 'yearly', interval: 1, endDate: '2029-12-31' },
    },
    onClose: () => console.log('Close clicked'),
    onConfirm: (editSingleOnly) => console.log('Confirmed - Single only:', editSingleOnly),
  },
};

/**
 * 사용자 정의 간격 (2주마다)
 */
export const CustomIntervalEdit: Story = {
  args: {
    open: true,
    mode: 'edit',
    event: {
      ...mockRecurringEvent,
      id: '5',
      title: '격주 회의',
      repeat: { type: 'weekly', interval: 2, endDate: '2024-12-31' },
    },
    onClose: () => console.log('Close clicked'),
    onConfirm: (editSingleOnly) => console.log('Confirmed - Single only:', editSingleOnly),
  },
};

/**
 * 종료일 없는 반복 일정
 */
export const NoEndDateEdit: Story = {
  args: {
    open: true,
    mode: 'edit',
    event: {
      ...mockRecurringEvent,
      id: '6',
      title: '무기한 반복 일정',
      repeat: { type: 'weekly', interval: 1 },
    },
    onClose: () => console.log('Close clicked'),
    onConfirm: (editSingleOnly) => console.log('Confirmed - Single only:', editSingleOnly),
  },
};
