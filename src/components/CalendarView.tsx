import { Notifications, Repeat } from '@mui/icons-material';
import {
  Box,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import React from 'react';

import { Event, RepeatType } from '../types';
import {
  formatDate,
  formatMonth,
  formatWeek,
  getEventsForDay,
  getWeekDates,
  getWeeksAtMonth,
} from '../utils/dateUtils';

// 스타일 상수
const eventBoxStyles = {
  notified: {
    backgroundColor: '#ffebee',
    fontWeight: 'bold',
    color: '#d32f2f',
  },
  normal: {
    backgroundColor: '#f5f5f5',
    fontWeight: 'normal',
    color: 'inherit',
  },
  common: {
    p: 0.5,
    my: 0.5,
    borderRadius: 1,
    minHeight: '18px',
    width: '100%',
    overflow: 'hidden',
  },
};

const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

const getRepeatTypeLabel = (type: RepeatType): string => {
  switch (type) {
    case 'daily':
      return '일';
    case 'weekly':
      return '주';
    case 'monthly':
      return '월';
    case 'yearly':
      return '년';
    default:
      return '';
  }
};

export interface CalendarViewProps {
  view: 'week' | 'month';
  currentDate: Date;
  filteredEvents: Event[];
  holidays: { [key: string]: string };
  notifiedEvents: string[];
  onDateClick: (dateString: string) => void;
  onDragStart: (event: Event) => (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onDragOver: (dateString: string) => (e: React.DragEvent) => void;
  onDrop: (dateString: string) => (e: React.DragEvent) => void;
  getDragStyles: (eventId: string) => React.CSSProperties;
  getDropZoneStyles: (dateString: string) => React.CSSProperties;
}

export const CalendarView = ({
  view,
  currentDate,
  filteredEvents,
  holidays,
  notifiedEvents,
  onDateClick,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  getDragStyles,
  getDropZoneStyles,
}: CalendarViewProps) => {
  const renderWeekView = () => {
    const weekDates = getWeekDates(currentDate);
    return (
      <Stack data-testid="week-view" spacing={4} sx={{ width: '100%' }}>
        <Typography variant="h5">{formatWeek(currentDate)}</Typography>
        <TableContainer>
          <Table sx={{ tableLayout: 'fixed', width: '100%' }}>
            <TableHead>
              <TableRow>
                {weekDays.map((day) => (
                  <TableCell key={day} sx={{ width: '14.28%', padding: 1, textAlign: 'center' }}>
                    {day}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                {weekDates.map((date) => {
                  const dateString = formatDate(date, date.getDate());
                  const hasEvents =
                    filteredEvents.filter(
                      (event) => new Date(event.date).toDateString() === date.toDateString()
                    ).length > 0;

                  return (
                    <TableCell
                      key={date.toISOString()}
                      sx={{
                        height: '120px',
                        verticalAlign: 'top',
                        width: '14.28%',
                        padding: 1,
                        border: '1px solid #e0e0e0',
                        overflow: 'hidden',
                        ...getDropZoneStyles(dateString),
                        ...(!hasEvents
                          ? {
                              cursor: 'pointer',
                              '&:hover': {
                                backgroundColor: '#f5f5f5',
                              },
                            }
                          : {}),
                      }}
                      onClick={!hasEvents ? () => onDateClick(dateString) : undefined}
                      onDragOver={onDragOver(dateString)}
                      onDrop={onDrop(dateString)}
                    >
                      <Typography variant="body2" fontWeight="bold">
                        {date.getDate()}
                      </Typography>
                      {filteredEvents
                        .filter(
                          (event) => new Date(event.date).toDateString() === date.toDateString()
                        )
                        .map((event) => {
                          const isNotified = notifiedEvents.includes(event.id);
                          const isRepeating = event.repeat.type !== 'none';

                          return (
                            <Box
                              key={event.id}
                              draggable
                              onDragStart={onDragStart(event)}
                              onDragEnd={onDragEnd}
                              sx={{
                                ...eventBoxStyles.common,
                                ...(isNotified ? eventBoxStyles.notified : eventBoxStyles.normal),
                                ...getDragStyles(event.id),
                              }}
                            >
                              <Stack direction="row" spacing={1} alignItems="center">
                                {isNotified && <Notifications fontSize="small" />}
                                {/* ! TEST CASE */}
                                {isRepeating && (
                                  <Tooltip
                                    title={`${event.repeat.interval}${getRepeatTypeLabel(
                                      event.repeat.type
                                    )}마다 반복${
                                      event.repeat.endDate ? ` (종료: ${event.repeat.endDate})` : ''
                                    }`}
                                  >
                                    <Repeat fontSize="small" />
                                  </Tooltip>
                                )}
                                <Typography
                                  variant="caption"
                                  noWrap
                                  sx={{ fontSize: '0.75rem', lineHeight: 1.2 }}
                                >
                                  {event.title}
                                </Typography>
                              </Stack>
                            </Box>
                          );
                        })}
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
    );
  };

  const renderMonthView = () => {
    const weeks = getWeeksAtMonth(currentDate);

    return (
      <Stack data-testid="month-view" spacing={4} sx={{ width: '100%' }}>
        <Typography variant="h5">{formatMonth(currentDate)}</Typography>
        <TableContainer>
          <Table sx={{ tableLayout: 'fixed', width: '100%' }}>
            <TableHead>
              <TableRow>
                {weekDays.map((day) => (
                  <TableCell key={day} sx={{ width: '14.28%', padding: 1, textAlign: 'center' }}>
                    {day}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {weeks.map((week, weekIndex) => (
                <TableRow key={weekIndex}>
                  {week.map((day, dayIndex) => {
                    const dateString = day ? formatDate(currentDate, day) : '';
                    const holiday = holidays[dateString];
                    const hasEvents = day && getEventsForDay(filteredEvents, day).length > 0;

                    return (
                      <TableCell
                        key={dayIndex}
                        sx={{
                          height: '120px',
                          verticalAlign: 'top',
                          width: '14.28%',
                          padding: 1,
                          border: '1px solid #e0e0e0',
                          overflow: 'hidden',
                          position: 'relative',
                          ...(day ? getDropZoneStyles(dateString) : {}),
                          ...(day && !hasEvents
                            ? {
                                cursor: 'pointer',
                                '&:hover': {
                                  backgroundColor: '#f5f5f5',
                                },
                              }
                            : {}),
                        }}
                        onClick={day && !hasEvents ? () => onDateClick(dateString) : undefined}
                        onDragOver={day ? onDragOver(dateString) : undefined}
                        onDrop={day ? onDrop(dateString) : undefined}
                      >
                        {day && (
                          <>
                            <Typography variant="body2" fontWeight="bold">
                              {day}
                            </Typography>
                            {holiday && (
                              <Typography variant="body2" color="error">
                                {holiday}
                              </Typography>
                            )}
                            {getEventsForDay(filteredEvents, day).map((event) => {
                              const isNotified = notifiedEvents.includes(event.id);
                              const isRepeating = event.repeat.type !== 'none';

                              return (
                                <Box
                                  key={event.id}
                                  draggable
                                  onDragStart={onDragStart(event)}
                                  onDragEnd={onDragEnd}
                                  sx={{
                                    p: 0.5,
                                    my: 0.5,
                                    backgroundColor: isNotified ? '#ffebee' : '#f5f5f5',
                                    borderRadius: 1,
                                    fontWeight: isNotified ? 'bold' : 'normal',
                                    color: isNotified ? '#d32f2f' : 'inherit',
                                    minHeight: '18px',
                                    width: '100%',
                                    overflow: 'hidden',
                                    ...getDragStyles(event.id),
                                  }}
                                >
                                  <Stack direction="row" spacing={1} alignItems="center">
                                    {isNotified && <Notifications fontSize="small" />}
                                    {/* ! TEST CASE */}
                                    {isRepeating && (
                                      <Tooltip
                                        title={`${event.repeat.interval}${getRepeatTypeLabel(
                                          event.repeat.type
                                        )}마다 반복${
                                          event.repeat.endDate
                                            ? ` (종료: ${event.repeat.endDate})`
                                            : ''
                                        }`}
                                      >
                                        <Repeat fontSize="small" />
                                      </Tooltip>
                                    )}
                                    <Typography
                                      variant="caption"
                                      noWrap
                                      sx={{ fontSize: '0.75rem', lineHeight: 1.2 }}
                                    >
                                      {event.title}
                                    </Typography>
                                  </Stack>
                                </Box>
                              );
                            })}
                          </>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
    );
  };

  return (
    <>
      {view === 'week' && renderWeekView()}
      {view === 'month' && renderMonthView()}
    </>
  );
};
