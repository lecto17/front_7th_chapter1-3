import type { Meta, StoryObj } from '@storybook/react-vite';

import OverlapDialog from './OverlapDialog';
import { Event } from '../types';

// 샘플 겹치는 이벤트 데이터
const mockOverlappingEvents: Event[] = [
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
    title: '클라이언트 미팅',
    date: '2024-11-05',
    startTime: '10:30',
    endTime: '11:30',
    description: '고객사 미팅',
    location: '회의실 B',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
];

const meta: Meta<typeof OverlapDialog> = {
  title: 'Components/OverlapDialog',
  component: OverlapDialog,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '일정 생성/수정 시 다른 일정과 시간이 겹칠 때 경고하는 다이얼로그',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    open: {
      control: 'boolean',
      description: '다이얼로그 열림 상태',
      table: {
        type: { summary: 'boolean' },
      },
    },
    overlappingEvents: {
      description: '겹치는 일정 목록',
      table: {
        type: { summary: 'Event[]' },
      },
    },
    onClose: {
      description: '취소 버튼 클릭 시 콜백',
      table: {
        type: { summary: '() => void' },
      },
    },
    onConfirm: {
      description: '계속 진행 버튼 클릭 시 콜백',
      table: {
        type: { summary: '() => void' },
      },
    },
  },
} satisfies Meta<typeof OverlapDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 단일 일정 겹침
 * 한 개의 일정과만 겹치는 경우
 */
export const SingleOverlap: Story = {
  args: {
    open: true,
    overlappingEvents: [mockOverlappingEvents[0]],
    onClose: () => console.log('Close clicked'),
    onConfirm: () => console.log('Confirmed - proceeding with overlap'),
  },
};

/**
 * 다중 일정 겹침
 * 두 개의 일정과 겹치는 경우
 */
export const MultipleOverlaps: Story = {
  args: {
    open: true,
    overlappingEvents: mockOverlappingEvents,
    onClose: () => console.log('Close clicked'),
    onConfirm: () => console.log('Confirmed - proceeding with overlap'),
  },
};

/**
 * 많은 일정 겹침
 * 여러 개의 일정과 동시에 겹치는 경우
 */
export const ManyOverlaps: Story = {
  args: {
    open: true,
    overlappingEvents: [
      ...mockOverlappingEvents,
      {
        ...mockOverlappingEvents[0],
        id: '3',
        title: '프로젝트 리뷰',
        startTime: '10:15',
        endTime: '11:15',
      },
      {
        ...mockOverlappingEvents[0],
        id: '4',
        title: '1:1 미팅',
        startTime: '10:45',
        endTime: '11:30',
      },
    ],
    onClose: () => console.log('Close clicked'),
    onConfirm: () => console.log('Confirmed - proceeding with overlap'),
  },
};

/**
 * 매우 많은 일정 겹침
 * 스크롤이 필요한 경우 (5개 이상)
 */
export const VeryManyOverlaps: Story = {
  args: {
    open: true,
    overlappingEvents: [
      ...mockOverlappingEvents,
      {
        ...mockOverlappingEvents[0],
        id: '3',
        title: '프로젝트 리뷰',
        startTime: '10:15',
        endTime: '11:15',
      },
      {
        ...mockOverlappingEvents[0],
        id: '4',
        title: '1:1 미팅',
        startTime: '10:45',
        endTime: '11:30',
      },
      {
        ...mockOverlappingEvents[0],
        id: '5',
        title: '부서 회의',
        startTime: '10:00',
        endTime: '12:00',
      },
      {
        ...mockOverlappingEvents[0],
        id: '6',
        title: '교육 세션',
        startTime: '10:30',
        endTime: '11:45',
      },
    ],
    onClose: () => console.log('Close clicked'),
    onConfirm: () => console.log('Confirmed - proceeding with overlap'),
  },
};

/**
 * 긴 제목의 일정 겹침
 * UI가 긴 텍스트를 어떻게 처리하는지 테스트
 */
export const LongTitleOverlap: Story = {
  args: {
    open: true,
    overlappingEvents: [
      {
        ...mockOverlappingEvents[0],
        title: '2024년 4분기 전사 비즈니스 리뷰 및 2025년 계획 수립을 위한 경영진 회의',
        description: '매우 긴 제목의 일정',
      },
      {
        ...mockOverlappingEvents[1],
        title: '글로벌 파트너사와의 전략적 제휴 협의 및 계약 검토 미팅 (Legal Team 참석)',
      },
    ],
    onClose: () => console.log('Close clicked'),
    onConfirm: () => console.log('Confirmed - proceeding with overlap'),
  },
};

/**
 * 반복 일정 겹침
 * 반복 일정과 겹치는 경우
 */
export const RecurringEventOverlap: Story = {
  args: {
    open: true,
    overlappingEvents: [
      {
        ...mockOverlappingEvents[0],
        repeat: { type: 'weekly', interval: 1, endDate: '2024-12-31' },
      },
      {
        ...mockOverlappingEvents[1],
        repeat: { type: 'daily', interval: 1, endDate: '2024-11-30' },
      },
    ],
    onClose: () => console.log('Close clicked'),
    onConfirm: () => console.log('Confirmed - proceeding with overlap'),
  },
};

/**
 * 닫힌 상태
 * open=false일 때
 */
export const Closed: Story = {
  args: {
    open: false,
    overlappingEvents: mockOverlappingEvents,
    onClose: () => console.log('Close clicked'),
    onConfirm: () => console.log('Confirmed - proceeding with overlap'),
  },
  parameters: {
    docs: {
      description: {
        story: 'open=false일 때는 다이얼로그가 표시되지 않습니다.',
      },
    },
  },
};
