import type { Meta, StoryObj } from '@storybook/react-vite';

import { EventForm } from './EventForm';
import { RepeatType } from '../types';

const meta: Meta<typeof EventForm> = {
  title: 'Components/EventForm',
  component: EventForm,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '일정 추가/수정 폼 컴포넌트 - 다양한 폼 컨트롤 상태에 대한 시각적 회귀 테스트',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    isEditMode: {
      control: 'boolean',
      description: '편집 모드 여부',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    startTimeError: {
      control: 'text',
      description: '시작 시간 에러 메시지',
      table: {
        type: { summary: 'string | null' },
      },
    },
    endTimeError: {
      control: 'text',
      description: '종료 시간 에러 메시지',
      table: {
        type: { summary: 'string | null' },
      },
    },
    isRepeating: {
      control: 'boolean',
      description: '반복 일정 여부',
    },
  },
} satisfies Meta<typeof EventForm>;

export default meta;
type Story = StoryObj<typeof meta>;

// 공통 핸들러 (모든 스토리에서 재사용)
const defaultHandlers = {
  onTitleChange: (value: string) => console.log('Title changed:', value),
  onDateChange: (value: string) => console.log('Date changed:', value),
  onStartTimeChange: (e: any) => console.log('Start time changed:', e.target.value),
  onEndTimeChange: (e: any) => console.log('End time changed:', e.target.value),
  onDescriptionChange: (value: string) => console.log('Description changed:', value),
  onLocationChange: (value: string) => console.log('Location changed:', value),
  onCategoryChange: (value: string) => console.log('Category changed:', value),
  onIsRepeatingChange: (checked: boolean) => console.log('Repeating changed:', checked),
  onRepeatTypeChange: (value: RepeatType) => console.log('Repeat type changed:', value),
  onRepeatIntervalChange: (value: number) => console.log('Repeat interval changed:', value),
  onRepeatEndDateChange: (value: string) => console.log('Repeat end date changed:', value),
  onNotificationTimeChange: (value: number) => console.log('Notification time changed:', value),
  onSubmit: () => console.log('Form submitted'),
};

/**
 * 1. Empty - 빈 폼 (초기 상태)
 * 모든 필드가 비어있거나 기본값인 상태
 */
export const Empty: Story = {
  args: {
    title: '',
    date: '',
    startTime: '',
    endTime: '',
    description: '',
    location: '',
    category: '업무',
    isRepeating: false,
    repeatType: 'none',
    repeatInterval: 1,
    repeatEndDate: '',
    notificationTime: 10,
    startTimeError: null,
    endTimeError: null,
    isEditMode: false,
    ...defaultHandlers,
  },
};

/**
 * 2. Filled - 정상 입력 완료
 * 모든 필드가 적절하게 채워진 일반적인 상태
 */
export const Filled: Story = {
  args: {
    title: '팀 회의',
    date: '2024-11-10',
    startTime: '10:00',
    endTime: '11:00',
    description: '주간 팀 회의',
    location: '회의실 A',
    category: '업무',
    isRepeating: false,
    repeatType: 'none',
    repeatInterval: 1,
    repeatEndDate: '',
    notificationTime: 10,
    startTimeError: null,
    endTimeError: null,
    isEditMode: false,
    ...defaultHandlers,
  },
};

/**
 * 3. WithTimeError - 시간 에러 상태 ⚠️
 * 시작 시간이 종료 시간보다 늦을 때 Tooltip과 빨간 테두리 표시
 * 가장 중요한 에러 상태 테스트
 */
export const WithTimeError: Story = {
  args: {
    ...Filled.args,
    startTime: '14:00',
    endTime: '13:00',
    startTimeError: '시작 시간은 종료 시간보다 빨라야 합니다',
    endTimeError: '종료 시간은 시작 시간보다 늦어야 합니다',
  },
};

/**
 * 4. WithRepeating - 반복 일정 활성화
 * 반복 일정 체크박스가 활성화되어 추가 필드들이 표시된 상태
 * 조건부 렌더링 테스트
 */
export const WithRepeating: Story = {
  args: {
    ...Filled.args,
    title: '주간 회의',
    isRepeating: true,
    repeatType: 'weekly',
    repeatInterval: 1,
    repeatEndDate: '2024-12-31',
  },
};

/**
 * 5. LongText - 긴 텍스트 레이아웃 테스트
 * 매우 긴 제목, 설명, 위치로 UI가 깨지지 않는지 확인
 * 엣지 케이스 테스트
 */
export const LongText: Story = {
  args: {
    ...Filled.args,
    title: '2024년 4분기 전사 비즈니스 리뷰 및 2025년 계획 수립을 위한 경영진 회의',
    description:
      '분기별 성과 검토, 예산 논의, 조직 개편안 검토, 2025년 사업 계획 수립 및 목표 설정, 주요 이슈 논의를 위한 전 임원 참석 확대 회의입니다. 각 부서별 실적 보고 및 향후 전략 수립이 포함됩니다.',
    location:
      '본사 대회의실 (5층 스카이라운지, 100인 수용 가능, 프로젝터 및 화상 회의 시스템 구비)',
  },
};

/**
 * 6. EditMode - 편집 모드
 * 기존 일정을 수정하는 상태
 * 제목이 "일정 수정"으로 표시됨
 */
export const EditMode: Story = {
  args: {
    ...Filled.args,
    title: '클라이언트 미팅',
    date: '2024-11-15',
    startTime: '14:00',
    endTime: '16:00',
    description: '신규 프로젝트 논의',
    location: '회의실 B',
    category: '업무',
    isEditMode: true,
  },
};

/**
 * 7. RepeatingWithLongText - 복합 엣지 케이스
 * 반복 일정 + 긴 텍스트 조합
 * 여러 조건이 겹칠 때 레이아웃 확인
 */
export const RepeatingWithLongText: Story = {
  args: {
    ...LongText.args,
    isRepeating: true,
    repeatType: 'weekly',
    repeatInterval: 2,
    repeatEndDate: '2025-06-30',
  },
};
