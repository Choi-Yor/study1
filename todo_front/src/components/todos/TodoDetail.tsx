import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Stack, 
  Divider, 
  Chip,
  IconButton,
  useTheme,
  Paper,
  Tooltip,
  Grid
} from '@mui/material';
import { 
  Edit as EditIcon,
  Delete as DeleteIcon,
  Flag as FlagIcon,
  CheckCircle as CheckIcon,
  RadioButtonUnchecked as UncheckedIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Todo } from '@/types/api';
import { Modal, LoadingState, ErrorState } from '@/components/common';
import TodoForm from './TodoForm';
import { formatDate } from '@/utils/dateUtils';

interface TodoDetailProps {
  todo: Todo | null;
  loading?: boolean;
  error?: Error | null;
  onEdit?: (todo: Todo) => void;
  onDelete?: (todo: Todo) => void;
  onToggleStatus?: (todo: Todo) => void;
  onClose?: () => void;
}

const TodoDetail: React.FC<TodoDetailProps> = ({
  todo,
  loading = false,
  error = null,
  onEdit,
  onDelete,
  onToggleStatus,
  onClose,
}) => {
  const theme = useTheme();
  const [isEditMode, setIsEditMode] = useState(false);

  // 편집 모드 토글
  const handleEditClick = () => {
    setIsEditMode(true);
  };

  // 편집 취소
  const handleCancelEdit = () => {
    setIsEditMode(false);
  };

  // 편집 제출
  const handleSubmitEdit = (updatedTodo: Partial<Todo>) => {
    if (todo && onEdit) {
      onEdit({ ...todo, ...updatedTodo });
      setIsEditMode(false);
    }
  };

  // 삭제 핸들러
  const handleDelete = () => {
    if (todo && onDelete) {
      onDelete(todo);
    }
  };

  // 상태 토글 핸들러
  const handleToggleStatus = () => {
    if (todo && onToggleStatus) {
      onToggleStatus(todo);
    }
  };

  // 우선순위에 따른 색상 결정
  const getPriorityColor = () => {
    if (!todo) return theme.palette.text.secondary;
    
    switch (todo.priority) {
      case 'High':
        return theme.palette.error.main;
      case 'Medium':
        return theme.palette.warning.main;
      case 'Low':
        return theme.palette.success.main;
      default:
        return theme.palette.text.secondary;
    }
  };

  // 우선순위 텍스트 변환
  const getPriorityText = () => {
    if (!todo) return '';
    
    switch (todo.priority) {
      case 'High':
        return '높음';
      case 'Medium':
        return '중간';
      case 'Low':
        return '낮음';
      default:
        return '';
    }
  };

  // 상태 텍스트 변환
  const getStatusText = () => {
    return todo?.status === 'Completed' ? '완료됨' : '진행 중';
  };

  // 로딩 상태 표시
  if (loading) {
    return <LoadingState />;
  }

  // 에러 상태 표시
  if (error) {
    return <ErrorState error={error} />;
  }

  // 할 일이 없는 경우
  if (!todo) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          선택된 할 일이 없습니다.
        </Typography>
      </Box>
    );
  }

  // 편집 모드 렌더링
  if (isEditMode) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          할 일 편집
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <TodoForm
          initialData={todo}
          onSubmit={handleSubmitEdit}
          onCancel={handleCancelEdit}
          submitLabel="저장"
        />
      </Box>
    );
  }

  // 생성 시간 포맷팅
  const formattedCreatedTime = formatDistanceToNow(new Date(todo.created_at), {
    addSuffix: true,
    locale: ko,
  });

  return (
    <Box sx={{ p: 3 }}>
      {/* 헤더 */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Typography variant="h5" component="h2" gutterBottom>
          {todo.task}
        </Typography>
        
        <Stack direction="row" spacing={1}>
          {onEdit && (
            <Tooltip title="편집">
              <IconButton onClick={handleEditClick} size="small" color="primary">
                <EditIcon />
              </IconButton>
            </Tooltip>
          )}
          
          {onToggleStatus && (
            <Tooltip title={todo.status === 'Completed' ? '미완료로 표시' : '완료로 표시'}>
              <IconButton 
                onClick={handleToggleStatus} 
                size="small"
                color={todo.status === 'Completed' ? 'default' : 'success'}
              >
                {todo.status === 'Completed' ? <UncheckedIcon /> : <CheckIcon />}
              </IconButton>
            </Tooltip>
          )}
          
          {onDelete && (
            <Tooltip title="삭제">
              <IconButton onClick={handleDelete} size="small" color="error">
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      </Box>

      <Divider sx={{ mb: 3 }} />
      
      {/* 정보 섹션 */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* 우선순위 */}
        <Grid item xs={12} sm={6}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <FlagIcon sx={{ color: getPriorityColor() }} />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  우선순위
                </Typography>
                <Typography variant="body1">
                  {getPriorityText()}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
        
        {/* 상태 */}
        <Grid item xs={12} sm={6}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              {todo.status === 'Completed' ? 
                <CheckIcon sx={{ color: theme.palette.success.main }} /> : 
                <UncheckedIcon sx={{ color: theme.palette.info.main }} />
              }
              <Box>
                <Typography variant="caption" color="text.secondary">
                  상태
                </Typography>
                <Typography variant="body1">
                  {getStatusText()}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
        
        {/* 마감일 */}
        <Grid item xs={12} sm={6}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <TimeIcon color="action" />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  마감일
                </Typography>
                <Typography variant="body1">
                  {formatDate(todo.due_date, 'yyyy년 MM월 dd일')}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
        
        {/* 생성일 */}
        <Grid item xs={12} sm={6}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <TimeIcon color="action" />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  생성일
                </Typography>
                <Typography variant="body1">
                  {formatDate(todo.created_at, 'yyyy년 MM월 dd일 HH:mm')}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ({formattedCreatedTime})
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* 액션 버튼 */}
      {onClose && (
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={onClose} variant="outlined">
            닫기
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default TodoDetail;
