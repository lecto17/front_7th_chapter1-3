import type { Meta, StoryObj } from '@storybook/react-vite';

import NotificationAlert, { Notification } from './NotificationAlert';

// 샘플 알림 데이터
const sampleNotifications: Notification[] = [
  {
    id: '1',
    message: '10분 후 팀 회의가 시작됩니다.',
  },
  {
    id: '2',
    message: '30분 후 클라이언트 미팅이 시작됩니다.',
  },
  {
    id: '3',
    message: '1시간 후 프로젝트 발표가 시작됩니다.',
  },
];

const meta: Meta<typeof NotificationAlert> = {
  title: 'Components/NotificationAlert',
  component: NotificationAlert,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: '일정 알림을 화면 우측 상단에 표시하는 컴포넌트',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    notifications: {
      description: '표시할 알림 목록',
      table: {
        type: { summary: 'Notification[]' },
      },
    },
    onDismiss: {
      description: '알림 닫기 버튼 클릭 시 콜백',
      table: {
        type: { summary: '(index: number) => void' },
      },
    },
  },
} satisfies Meta<typeof NotificationAlert>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 단일 알림
 * 하나의 알림만 표시되는 경우
 */
export const Single: Story = {
  args: {
    notifications: [sampleNotifications[0]],
    onDismiss: (index) => console.log('Dismissed notification at index:', index),
  },
};

/**
 * 다중 알림
 * 여러 개의 알림이 쌓여있는 경우
 */
export const Multiple: Story = {
  args: {
    notifications: sampleNotifications,
    onDismiss: (index) => console.log('Dismissed notification at index:', index),
  },
};

/**
 * 긴 메시지 알림
 * 알림 메시지가 긴 경우 UI 테스트
 */
export const LongMessage: Story = {
  args: {
    notifications: [
      {
        id: '1',
        message:
          '10분 후 2024년 4분기 전사 비즈니스 리뷰 및 2025년 계획 수립을 위한 경영진 회의가 시작됩니다.',
      },
      {
        id: '2',
        message:
          '30분 후 글로벌 파트너사와의 전략적 제휴 협의 및 계약 검토 미팅 (Legal Team 참석)이 시작됩니다.',
      },
    ],
    onDismiss: (index) => console.log('Dismissed notification at index:', index),
  },
};

/**
 * 많은 알림
 * 5개 이상의 알림이 있는 경우
 */
export const ManyNotifications: Story = {
  args: {
    notifications: [
      { id: '1', message: '10분 후 팀 회의가 시작됩니다.' },
      { id: '2', message: '10분 후 클라이언트 미팅이 시작됩니다.' },
      { id: '3', message: '10분 후 프로젝트 발표가 시작됩니다.' },
      { id: '4', message: '10분 후 부서 회의가 시작됩니다.' },
      { id: '5', message: '10분 후 1:1 미팅이 시작됩니다.' },
      { id: '6', message: '10분 후 교육 세션이 시작됩니다.' },
    ],
    onDismiss: (index) => console.log('Dismissed notification at index:', index),
  },
};

/**
 * 다양한 시간의 알림
 * 1분, 10분, 1시간 등 다양한 알림 시간
 */
export const VariousTimes: Story = {
  args: {
    notifications: [
      { id: '1', message: '1분 후 긴급 회의가 시작됩니다.' },
      { id: '2', message: '10분 후 팀 스탠드업이 시작됩니다.' },
      { id: '3', message: '1시간 후 점심 약속이 있습니다.' },
      { id: '4', message: '2시간 후 프로젝트 리뷰가 시작됩니다.' },
      { id: '5', message: '1일 후 중요한 발표가 있습니다.' },
    ],
    onDismiss: (index) => console.log('Dismissed notification at index:', index),
  },
};

/**
 * 빈 알림
 * 알림이 없는 경우 (null 반환)
 */
export const Empty: Story = {
  args: {
    notifications: [],
    onDismiss: (index) => console.log('Dismissed notification at index:', index),
  },
  parameters: {
    docs: {
      description: {
        story: '알림이 없을 때는 아무것도 렌더링되지 않습니다.',
      },
    },
  },
};

/**
 * 매우 긴 단일 알림
 * 한 줄로 표시될 수 없을 정도로 긴 메시지
 */
export const VeryLongSingleMessage: Story = {
  args: {
    notifications: [
      {
        id: '1',
        message:
          '10분 후 2024년 4분기 전사 비즈니스 리뷰 및 2025년 사업 계획 수립, 조직 개편안 논의, 예산 배정 검토, 성과 평가 기준 재정립을 위한 전 임원 참석 필수 경영진 확대 회의가 본사 대회의실에서 시작됩니다.',
      },
    ],
    onDismiss: (index) => console.log('Dismissed notification at index:', index),
  },
};

/**
 * 짧은 메시지 알림
 * 매우 짧은 알림 메시지
 */
export const ShortMessages: Story = {
  args: {
    notifications: [
      { id: '1', message: '곧 시작' },
      { id: '2', message: '10분 후' },
      { id: '3', message: '준비 필요' },
    ],
    onDismiss: (index) => console.log('Dismissed notification at index:', index),
  },
};

/**
 * 특수 문자 포함 알림
 * 이모지나 특수 문자가 포함된 알림
 */
export const WithSpecialCharacters: Story = {
  args: {
    notifications: [
      { id: '1', message: '🔔 10분 후 팀 회의가 시작됩니다!' },
      { id: '2', message: '⚠️ 중요: 클라이언트 미팅 준비 필요' },
      { id: '3', message: '✅ 프로젝트 마감 1시간 전입니다.' },
    ],
    onDismiss: (index) => console.log('Dismissed notification at index:', index),
  },
};

