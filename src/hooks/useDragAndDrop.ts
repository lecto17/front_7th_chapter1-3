import { useCallback, useState } from 'react';

import { Event } from '../types';

// ==================== 상수 ====================
const DRAG_STYLES = {
  DRAGGING: {
    opacity: 0.5,
    cursor: 'grabbing' as const,
  },
  IDLE: {
    cursor: 'grab' as const,
  },
} as const;

const DROP_ZONE_STYLES = {
  ACTIVE: {
    backgroundColor: '#e3f2fd',
    border: '2px dashed #2196f3',
    transition: 'all 0.2s ease',
  },
  IDLE: {},
} as const;

// ==================== 타입 정의 ====================
interface UseDragAndDropProps {
  onRecurringEventUpdate?: (event: Event, editSingleOnly: boolean) => Promise<void>;
  fetchEvents: () => Promise<void>;
}

interface UseDragAndDropReturn {
  // 상태
  draggedEvent: Event | null;
  dragOverDate: string | null;
  pendingDropEvent: Event | null;
  pendingDropDate: string | null;

  // 핸들러
  handleDragStart: (event: Event) => (e: React.DragEvent) => void;
  handleDragEnd: () => void;
  handleDragOver: (date: string) => (e: React.DragEvent) => void;
  handleDrop: (date: string) => (e: React.DragEvent) => Promise<void>;
  handleRecurringDropConfirm: (editSingleOnly: boolean) => Promise<void>;
  handleRecurringDropCancel: () => void;

  // 스타일 헬퍼
  getDragStyles: (eventId: string) => React.CSSProperties;
  getDropZoneStyles: (date: string) => React.CSSProperties;
}

// ==================== 유틸리티 함수 ====================
/**
 * 반복 일정 여부 확인
 */
const isRecurringEvent = (event: Event): boolean => {
  return event.repeat.type !== 'none' && event.repeat.interval > 0;
};

/**
 * 이벤트 날짜 업데이트
 */
const createUpdatedEvent = (event: Event, newDate: string): Event => {
  return {
    ...event,
    date: newDate,
  };
};

// ==================== 메인 훅 ====================
export const useDragAndDrop = ({
  onRecurringEventUpdate,
  fetchEvents,
}: UseDragAndDropProps): UseDragAndDropReturn => {
  // ===== 상태 관리 =====
  const [draggedEvent, setDraggedEvent] = useState<Event | null>(null);
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);
  const [pendingDropEvent, setPendingDropEvent] = useState<Event | null>(null);
  const [pendingDropDate, setPendingDropDate] = useState<string | null>(null);

  // ===== 내부 헬퍼 함수 =====
  /**
   * API를 통해 일반 이벤트 업데이트
   */
  const updateEventViaAPI = useCallback(
    async (event: Event): Promise<void> => {
      const response = await fetch(`/api/events/${event.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      });

      if (!response.ok) {
        throw new Error('Failed to update event');
      }

      await fetchEvents();
    },
    [fetchEvents]
  );

  /**
   * 반복 일정 업데이트 (onRecurringEventUpdate 또는 API 직접 호출)
   */
  const updateRecurringEvent = useCallback(
    async (event: Event, editSingleOnly: boolean): Promise<void> => {
      if (onRecurringEventUpdate) {
        await onRecurringEventUpdate(event, editSingleOnly);
      } else {
        await updateEventViaAPI(event);
      }
    },
    [onRecurringEventUpdate, updateEventViaAPI]
  );

  /**
   * pending 상태 초기화
   */
  const clearPendingDrop = useCallback(() => {
    setPendingDropEvent(null);
    setPendingDropDate(null);
  }, []);

  // ===== 이벤트 핸들러 =====
  /**
   * 드래그 시작: 이벤트 정보 저장 및 DataTransfer 설정
   */
  const handleDragStart = useCallback(
    (event: Event) => (e: React.DragEvent) => {
      setDraggedEvent(event);
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', event.id);

      if (e.currentTarget instanceof HTMLElement) {
        e.dataTransfer.setDragImage(e.currentTarget, 0, 0);
      }
    },
    []
  );

  /**
   * 드래그 종료: 상태 초기화
   */
  const handleDragEnd = useCallback(() => {
    setDraggedEvent(null);
    setDragOverDate(null);
  }, []);

  /**
   * 드래그 오버: 드롭 가능 영역 하이라이트
   */
  const handleDragOver = useCallback(
    (date: string) => (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      setDragOverDate(date);
    },
    []
  );

  /**
   * 드롭: 이벤트를 새로운 날짜로 이동
   */
  const handleDrop = useCallback(
    (newDate: string) => async (e: React.DragEvent) => {
      e.preventDefault();

      if (!draggedEvent) return;

      // 같은 날짜에 드롭한 경우 무시
      if (draggedEvent.date === newDate) {
        handleDragEnd();
        return;
      }

      // 반복 일정의 경우 다이얼로그 표시
      if (isRecurringEvent(draggedEvent)) {
        setPendingDropEvent(draggedEvent);
        setPendingDropDate(newDate);
        handleDragEnd();
        return;
      }

      // 일반 이벤트는 즉시 이동
      try {
        const updatedEvent = createUpdatedEvent(draggedEvent, newDate);
        await updateEventViaAPI(updatedEvent);
      } catch (error) {
        console.error('Error updating event date:', error);
        throw error;
      } finally {
        handleDragEnd();
      }
    },
    [draggedEvent, handleDragEnd, updateEventViaAPI]
  );

  /**
   * 반복 일정 드롭 확인: 사용자 선택에 따라 처리
   */
  const handleRecurringDropConfirm = useCallback(
    async (editSingleOnly: boolean) => {
      if (!pendingDropEvent || !pendingDropDate) return;

      try {
        const updatedEvent = createUpdatedEvent(pendingDropEvent, pendingDropDate);
        await updateRecurringEvent(updatedEvent, editSingleOnly);
      } catch (error) {
        console.error('Error updating recurring event date:', error);
        throw error;
      } finally {
        clearPendingDrop();
      }
    },
    [pendingDropEvent, pendingDropDate, updateRecurringEvent, clearPendingDrop]
  );

  /**
   * 반복 일정 드롭 취소
   */
  const handleRecurringDropCancel = useCallback(() => {
    clearPendingDrop();
  }, [clearPendingDrop]);

  // ===== 스타일 헬퍼 =====
  /**
   * 드래그 중인 이벤트의 스타일
   */
  const getDragStyles = useCallback(
    (eventId: string): React.CSSProperties => {
      const isDragging = draggedEvent?.id === eventId;
      return isDragging ? DRAG_STYLES.DRAGGING : DRAG_STYLES.IDLE;
    },
    [draggedEvent]
  );

  /**
   * 드롭 영역(날짜 셀)의 스타일
   */
  const getDropZoneStyles = useCallback(
    (date: string): React.CSSProperties => {
      const isActive = dragOverDate === date && draggedEvent !== null;
      return isActive ? DROP_ZONE_STYLES.ACTIVE : DROP_ZONE_STYLES.IDLE;
    },
    [dragOverDate, draggedEvent]
  );

  // ===== 반환 =====
  return {
    // 상태
    draggedEvent,
    dragOverDate,
    pendingDropEvent,
    pendingDropDate,
    // 핸들러
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDrop,
    handleRecurringDropConfirm,
    handleRecurringDropCancel,
    // 스타일
    getDragStyles,
    getDropZoneStyles,
  };
};
