import React from 'react';
import { 
  Box, 
  Typography, 
  IconButton, 
  Menu, 
  MenuItem, 
  ListItemIcon, 
  ListItemText,
  Chip,
  Checkbox,
  useTheme,
  Tooltip
} from '@mui/material';
import { 
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Flag as FlagIcon,
  CheckCircle as CheckIcon,
  RadioButtonUnchecked as UncheckedIcon
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Todo } from '@/types/api';
import { Card } from '@/components/common';
import { formatDate } from '@/utils/dateUtils';

interface TodoCardProps {
  todo: Todo;
  onEdit: (todo: Todo) => void;
  onDelete: (todo: Todo) => void;
  onToggleStatus: (todo: Todo) => void;
  onClick?: (todo: Todo) => void;
  elevation?: number;
}

const TodoCard: React.FC<TodoCardProps> = ({
  todo,
  onEdit,
  onDelete,
  onToggleStatus,
  onClick,
  elevation = 0,
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  // 메뉴 열기/닫기 핸들러
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (event?: React.MouseEvent<HTMLElement>) => {
    if (event) {
      event.stopPropagation();
    }
    setAnchorEl(null);
  };

  // 편집 핸들러
  const handleEdit = (event: React.MouseEvent<HTMLElement>) => {
    handleMenuClose(event);
    onEdit(todo);
  };

  // 삭제 핸들러
  const handleDelete = (event: React.MouseEvent<HTMLElement>) => {
    handleMenuClose(event);
    onDelete(todo);
  };

  // 상태 토글 핸들러
  const handleToggleStatus = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    onToggleStatus(todo);
  };

  // 카드 클릭 핸들러
  const handleCardClick = () => {
    if (onClick) {
      onClick(todo);
    }
  };

  // 우선순위에 따른 색상 결정
  const getPriorityColor = () => {
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

  // 우선순위에 따른 아이콘 렌더링
  const renderPriorityIcon = () => {
    return (
      <FlagIcon
        fontSize="small"
        sx={{ color: getPriorityColor() }}
      />
    );
  };

  // 상태에 따른 색상 결정
  const getStatusColor = () => {
    return todo.status === 'Completed'
      ? theme.palette.success.main
      : theme.palette.info.main;
  };

  // 상태에 따른 텍스트 결정
  const getStatusText = () => {
    return todo.status === 'Completed' ? '완료됨' : '진행 중';
  };

  // 생성 시간 포맷팅
  const formattedTime = formatDistanceToNow(new Date(todo.created_at), {
    addSuffix: true,
    locale: ko,
  });

  // 메뉴 아이콘 렌더링
  const menuIcon = (
    <IconButton
      aria-label="더 보기"
      aria-controls={open ? 'todo-menu' : undefined}
      aria-haspopup="true"
      aria-expanded={open ? 'true' : undefined}
      onClick={handleMenuOpen}
      size="small"
    >
      <MoreIcon fontSize="small" />
    </IconButton>
  );

  // 할 일 완료 체크박스 렌더링
  const checkboxIcon = (
    <Checkbox
      checked={todo.status === 'Completed'}
      onChange={handleToggleStatus}
      onClick={(e) => e.stopPropagation()}
      icon={<UncheckedIcon />}
      checkedIcon={<CheckIcon />}
      sx={{
        color: theme.palette.text.secondary,
        '&.Mui-checked': {
          color: theme.palette.success.main,
        },
      }}
    />
  );

  // 뱃지 생성
  const badges = [
    {
      label: todo.priority,
      color: todo.priority === 'High' 
        ? 'error' 
        : todo.priority === 'Medium' 
          ? 'warning' 
          : 'success'
    },
    {
      label: getStatusText(),
      color: todo.status === 'Completed' ? 'success' : 'info'
    }
  ] as const;

  return (
    <Card
      title={todo.task}
      subtitle={`마감일: ${formatDate(todo.due_date, 'yyyy년 MM월 dd일')}`}
      content={
        <Box>
          <Typography variant="body2" color="text.secondary">
            {formattedTime} 생성됨
          </Typography>
        </Box>
      }
      icon={checkboxIcon}
      headerAction={menuIcon}
      onClick={onClick ? handleCardClick : undefined}
      elevation={elevation}
      badges={badges}
      variant={todo.status === 'Completed' ? 'outlined' : 'elevation'}
    >
      {/* 메뉴 */}
      <Menu
        id="todo-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>편집</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleToggleStatus}>
          <ListItemIcon>
            {todo.status === 'Completed' ? (
              <UncheckedIcon fontSize="small" />
            ) : (
              <CheckIcon fontSize="small" color="success" />
            )}
          </ListItemIcon>
          <ListItemText>
            {todo.status === 'Completed' ? '미완료로 표시' : '완료로 표시'}
          </ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: theme.palette.error.main }}>
          <ListItemIcon sx={{ color: theme.palette.error.main }}>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>삭제</ListItemText>
        </MenuItem>
      </Menu>
    </Card>
  );
};

export default TodoCard;
