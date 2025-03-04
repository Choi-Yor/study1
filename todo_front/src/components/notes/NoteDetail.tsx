import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Divider, 
  Stack,
  IconButton,
  Tooltip,
  useTheme
} from '@mui/material';
import { 
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  ArrowBack as BackIcon
} from '@mui/icons-material';
import { Note } from '@/types/api';
import { formatDate } from '@/utils/dateUtils';
import { LoadingState, ErrorState } from '@/components/common';

interface NoteDetailProps {
  note: Note;
  loading?: boolean;
  error?: Error | null;
  onEdit: (note: Note) => void;
  onDelete: (note: Note) => void;
  onBack?: () => void;
}

const NoteDetail: React.FC<NoteDetailProps> = ({
  note,
  loading = false,
  error = null,
  onEdit,
  onDelete,
  onBack,
}) => {
  const theme = useTheme();

  // 에러 상태
  if (error) {
    return <ErrorState error={error} />;
  }

  // 로딩 상태
  if (loading) {
    return <LoadingState message="노트를 불러오는 중..." />;
  }

  // 클립보드에 복사 핸들러
  const handleCopy = () => {
    navigator.clipboard.writeText(note.content);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      {/* 헤더 */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        {onBack && (
          <Tooltip title="뒤로 가기">
            <IconButton onClick={onBack} sx={{ mr: 1 }}>
              <BackIcon />
            </IconButton>
          </Tooltip>
        )}
        <Typography variant="h5" component="h1" fontWeight="bold">
          노트 #{note.id}
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Stack direction="row" spacing={1}>
          <Tooltip title="복사">
            <IconButton onClick={handleCopy} size="small">
              <CopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="편집">
            <IconButton onClick={() => onEdit(note)} size="small">
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="삭제">
            <IconButton 
              onClick={() => onDelete(note)} 
              size="small"
              color="error"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {/* 메타 정보 */}
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: 2,
          color: theme.palette.text.secondary,
          fontSize: '0.875rem',
        }}
      >
        <Typography variant="body2">
          작성일: {formatDate(note.created_at, 'yyyy년 MM월 dd일 HH:mm')}
        </Typography>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* 노트 내용 */}
      <Typography 
        variant="body1" 
        component="div" 
        sx={{ 
          whiteSpace: 'pre-wrap',
          lineHeight: 1.7,
          '& p': {
            mb: 2
          }
        }}
      >
        {note.content}
      </Typography>
    </Paper>
  );
};

export default NoteDetail;
