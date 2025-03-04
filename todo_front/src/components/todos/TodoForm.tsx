import React, { useEffect } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Typography,
  useTheme,
  CircularProgress
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ko } from 'date-fns/locale';
import { useForm, Controller } from 'react-hook-form';
import { Todo } from '@/types/api';
import { useFormErrors } from '@/hooks/useFormUtils';
import { formatDate } from '@/utils/dateUtils';

interface TodoFormProps {
  initialData?: Partial<Todo>;
  onSubmit: (data: Partial<Todo>) => void;
  onCancel?: () => void;
  loading?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
}

interface TodoFormData {
  task: string;
  due_date: Date | null;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'Completed';
}

const TodoForm: React.FC<TodoFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
  submitLabel = '저장',
  cancelLabel = '취소',
}) => {
  const theme = useTheme();
  const { handleFormErrors } = useFormErrors();
  
  // 초기값 설정
  const defaultValues = {
    task: initialData?.task || '',
    due_date: initialData?.due_date ? new Date(initialData.due_date) : new Date(),
    priority: initialData?.priority || 'Medium',
    status: initialData?.status || 'Pending',
  };
  
  // React Hook Form 설정
  const { 
    control, 
    handleSubmit, 
    formState: { errors, isDirty },
    reset
  } = useForm<TodoFormData>({
    defaultValues,
  });

  // 초기 데이터가 변경되면 폼 리셋
  useEffect(() => {
    if (initialData) {
      reset({
        task: initialData.task || '',
        due_date: initialData.due_date ? new Date(initialData.due_date) : new Date(),
        priority: initialData.priority || 'Medium',
        status: initialData.status || 'Pending',
      });
    }
  }, [initialData, reset]);

  // 폼 제출 핸들러
  const onFormSubmit = handleSubmit((data) => {
    try {
      // 날짜 형식 변환 (Date -> YYYY-MM-DD 문자열)
      const formattedData = {
        ...data,
        due_date: data.due_date ? formatDate(data.due_date, 'yyyy-MM-dd') : '',
      };
      
      onSubmit(formattedData);
    } catch (error) {
      handleFormErrors(error);
    }
  });

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
      <Box component="form" onSubmit={onFormSubmit} noValidate>
        <Stack spacing={3}>
          {/* 할 일 내용 */}
          <Controller
            name="task"
            control={control}
            rules={{ 
              required: '할 일을 입력해주세요',
              minLength: {
                value: 3,
                message: '최소 3자 이상 입력해주세요',
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="할 일"
                fullWidth
                error={!!errors.task}
                helperText={errors.task?.message}
                disabled={loading}
                placeholder="할 일을 입력하세요..."
              />
            )}
          />

          {/* 마감일 */}
          <Controller
            name="due_date"
            control={control}
            rules={{ required: '마감일을 선택해주세요' }}
            render={({ field }) => (
              <DatePicker
                label="마감일"
                value={field.value}
                onChange={(date) => field.onChange(date)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.due_date,
                    helperText: errors.due_date?.message,
                    disabled: loading,
                  },
                }}
              />
            )}
          />

          {/* 우선순위 */}
          <Controller
            name="priority"
            control={control}
            rules={{ required: '우선순위를 선택해주세요' }}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.priority} disabled={loading}>
                <InputLabel id="priority-label">우선순위</InputLabel>
                <Select
                  {...field}
                  labelId="priority-label"
                  label="우선순위"
                >
                  <MenuItem value="High">높음</MenuItem>
                  <MenuItem value="Medium">중간</MenuItem>
                  <MenuItem value="Low">낮음</MenuItem>
                </Select>
                {errors.priority && (
                  <FormHelperText>{errors.priority.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />

          {/* 상태 */}
          <Controller
            name="status"
            control={control}
            rules={{ required: '상태를 선택해주세요' }}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.status} disabled={loading}>
                <InputLabel id="status-label">상태</InputLabel>
                <Select
                  {...field}
                  labelId="status-label"
                  label="상태"
                >
                  <MenuItem value="Pending">진행 중</MenuItem>
                  <MenuItem value="Completed">완료됨</MenuItem>
                </Select>
                {errors.status && (
                  <FormHelperText>{errors.status.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />

          {/* 액션 버튼 */}
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            {onCancel && (
              <Button
                type="button"
                variant="outlined"
                color="inherit"
                onClick={onCancel}
                disabled={loading}
              >
                {cancelLabel}
              </Button>
            )}
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading || !isDirty}
              startIcon={loading && <CircularProgress size={20} color="inherit" />}
            >
              {submitLabel}
            </Button>
          </Stack>
        </Stack>
      </Box>
    </LocalizationProvider>
  );
};

export default TodoForm;
