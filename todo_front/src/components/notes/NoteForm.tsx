import React, { useEffect } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Stack,
  Typography,
  useTheme,
  CircularProgress
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { Note } from '@/types/api';
import { useFormErrors } from '@/hooks/useFormUtils';

interface NoteFormProps {
  initialData?: Partial<Note>;
  onSubmit: (data: Partial<Note>) => void;
  onCancel?: () => void;
  loading?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
}

interface NoteFormData {
  content: string;
}

const NoteForm: React.FC<NoteFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
  submitLabel = '저장',
  cancelLabel = '취소',
}) => {
  const theme = useTheme();
  const { handleFormErrors } = useFormErrors();
  
  // React Hook Form 설정
  const { 
    control, 
    handleSubmit, 
    formState: { errors, isDirty },
    reset
  } = useForm<NoteFormData>({
    defaultValues: {
      content: initialData?.content || '',
    },
  });

  // 초기 데이터가 변경되면 폼 리셋
  useEffect(() => {
    if (initialData) {
      reset({
        content: initialData.content || '',
      });
    }
  }, [initialData, reset]);

  // 폼 제출 핸들러
  const onFormSubmit = handleSubmit((data) => {
    try {
      onSubmit(data);
    } catch (error) {
      handleFormErrors(error);
    }
  });

  return (
    <Box component="form" onSubmit={onFormSubmit} noValidate>
      <Stack spacing={3}>
        {/* 노트 내용 */}
        <Controller
          name="content"
          control={control}
          rules={{ 
            required: '내용을 입력해주세요',
            minLength: {
              value: 3,
              message: '최소 3자 이상 입력해주세요',
            },
          }}
          render={({ field }) => (
            <TextField
              {...field}
              label="노트 내용"
              multiline
              rows={6}
              fullWidth
              error={!!errors.content}
              helperText={errors.content?.message}
              disabled={loading}
              placeholder="노트 내용을 입력하세요..."
              InputProps={{
                sx: { 
                  fontFamily: theme.typography.fontFamily,
                  fontSize: theme.typography.body1.fontSize,
                  lineHeight: 1.5,
                }
              }}
            />
          )}
        />

        {/* 글자 수 표시 */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Typography variant="caption" color="text.secondary">
            {control._formValues.content?.length || 0}자
          </Typography>
        </Box>

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
  );
};

export default NoteForm;
