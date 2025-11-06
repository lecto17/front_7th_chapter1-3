import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { ChangeEvent } from 'react';

import { RepeatType } from '../types';

const categories = ['업무', '개인', '가족', '기타'];

const notificationOptions = [
  { value: 1, label: '1분 전' },
  { value: 10, label: '10분 전' },
  { value: 60, label: '1시간 전' },
  { value: 120, label: '2시간 전' },
  { value: 1440, label: '1일 전' },
];

/**
 * Props for the EventForm component
 */
interface EventFormProps {
  // 폼 값
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  location: string;
  category: string;
  isRepeating: boolean;
  repeatType: RepeatType;
  repeatInterval: number;
  repeatEndDate: string;
  notificationTime: number;

  // 에러 상태
  startTimeError?: string | null;
  endTimeError?: string | null;

  // 모드
  isEditMode?: boolean;

  // 핸들러
  onTitleChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onStartTimeChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onEndTimeChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onDescriptionChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onIsRepeatingChange: (checked: boolean) => void;
  onRepeatTypeChange: (value: RepeatType) => void;
  onRepeatIntervalChange: (value: number) => void;
  onRepeatEndDateChange: (value: string) => void;
  onNotificationTimeChange: (value: number) => void;
  onSubmit: () => void;
}

/**
 * EventForm component for adding/editing events
 * Handles all form controls with various states for visual regression testing
 */
export const EventForm = ({
  title,
  date,
  startTime,
  endTime,
  description,
  location,
  category,
  isRepeating,
  repeatType,
  repeatInterval,
  repeatEndDate,
  notificationTime,
  startTimeError,
  endTimeError,
  isEditMode = false,
  onTitleChange,
  onDateChange,
  onStartTimeChange,
  onEndTimeChange,
  onDescriptionChange,
  onLocationChange,
  onCategoryChange,
  onIsRepeatingChange,
  onRepeatTypeChange,
  onRepeatIntervalChange,
  onRepeatEndDateChange,
  onNotificationTimeChange,
  onSubmit,
}: EventFormProps) => {
  return (
    <Stack spacing={2} sx={{ width: '100%' }}>
      <Typography variant="h4">{isEditMode ? '일정 수정' : '일정 추가'}</Typography>

      <FormControl fullWidth>
        <FormLabel htmlFor="title">제목</FormLabel>
        <TextField
          id="title"
          size="small"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
        />
      </FormControl>

      <FormControl fullWidth>
        <FormLabel htmlFor="date">날짜</FormLabel>
        <TextField
          id="date"
          size="small"
          type="date"
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
        />
      </FormControl>

      <Stack direction="row" spacing={2}>
        <FormControl fullWidth>
          <FormLabel htmlFor="start-time">시작 시간</FormLabel>
          <Tooltip title={startTimeError || ''} open={!!startTimeError} placement="top">
            <TextField
              id="start-time"
              size="small"
              type="time"
              value={startTime}
              onChange={onStartTimeChange}
              error={!!startTimeError}
            />
          </Tooltip>
        </FormControl>
        <FormControl fullWidth>
          <FormLabel htmlFor="end-time">종료 시간</FormLabel>
          <Tooltip title={endTimeError || ''} open={!!endTimeError} placement="top">
            <TextField
              id="end-time"
              size="small"
              type="time"
              value={endTime}
              onChange={onEndTimeChange}
              error={!!endTimeError}
            />
          </Tooltip>
        </FormControl>
      </Stack>

      <FormControl fullWidth>
        <FormLabel htmlFor="description">설명</FormLabel>
        <TextField
          id="description"
          size="small"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
        />
      </FormControl>

      <FormControl fullWidth>
        <FormLabel htmlFor="location">위치</FormLabel>
        <TextField
          id="location"
          size="small"
          value={location}
          onChange={(e) => onLocationChange(e.target.value)}
        />
      </FormControl>

      <FormControl fullWidth>
        <FormLabel id="category-label">카테고리</FormLabel>
        <Select
          id="category"
          size="small"
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          aria-labelledby="category-label"
          aria-label="카테고리"
        >
          {categories.map((cat) => (
            <MenuItem key={cat} value={cat} aria-label={`${cat}-option`}>
              {cat}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {!isEditMode && (
        <FormControl>
          <FormControlLabel
            control={
              <Checkbox
                checked={isRepeating}
                onChange={(e) => {
                  const checked = e.target.checked;
                  onIsRepeatingChange(checked);
                  if (checked && repeatType === 'none') {
                    onRepeatTypeChange('daily');
                  }
                }}
              />
            }
            label="반복 일정"
          />
        </FormControl>
      )}

      {isRepeating && !isEditMode && (
        <Stack spacing={2}>
          <FormControl fullWidth>
            <FormLabel>반복 유형</FormLabel>
            <Select
              size="small"
              value={repeatType}
              aria-label="반복 유형"
              onChange={(e) => onRepeatTypeChange(e.target.value as RepeatType)}
            >
              <MenuItem value="daily" aria-label="daily-option">
                매일
              </MenuItem>
              <MenuItem value="weekly" aria-label="weekly-option">
                매주
              </MenuItem>
              <MenuItem value="monthly" aria-label="monthly-option">
                매월
              </MenuItem>
              <MenuItem value="yearly" aria-label="yearly-option">
                매년
              </MenuItem>
            </Select>
          </FormControl>
          <Stack direction="row" spacing={2}>
            <FormControl fullWidth>
              <FormLabel htmlFor="repeat-interval">반복 간격</FormLabel>
              <TextField
                id="repeat-interval"
                size="small"
                type="number"
                value={repeatInterval}
                onChange={(e) => onRepeatIntervalChange(Number(e.target.value))}
                slotProps={{ htmlInput: { min: 1 } }}
              />
            </FormControl>
            <FormControl fullWidth>
              <FormLabel htmlFor="repeat-end-date">반복 종료일</FormLabel>
              <TextField
                id="repeat-end-date"
                size="small"
                type="date"
                value={repeatEndDate}
                onChange={(e) => onRepeatEndDateChange(e.target.value)}
              />
            </FormControl>
          </Stack>
        </Stack>
      )}

      <FormControl fullWidth>
        <FormLabel htmlFor="notification">알림 설정</FormLabel>
        <Select
          id="notification"
          size="small"
          value={notificationTime}
          onChange={(e) => onNotificationTimeChange(Number(e.target.value))}
        >
          {notificationOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Button
        data-testid="event-submit-button"
        onClick={onSubmit}
        variant="contained"
        color="primary"
      >
        {isEditMode ? '일정 수정' : '일정 추가'}
      </Button>
    </Stack>
  );
};

