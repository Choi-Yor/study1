import React from 'react';
import { 
  Box, 
  Typography, 
  IconButton, 
  Menu, 
  MenuItem, 
  ListItemIcon, 
  ListItemText,
  useTheme,
  Tooltip
} from '@mui/material';
import { 
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Note } from '@/types/api';
import { Card } from '@/components/common';
import { formatDate } from '@/utils/dateUtils';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (note: Note) => void;
  onClick?: (note: Note) => void;
  elevation?: number;
}

const NoteCard: React.FC<NoteCardProps> = ({
  note,
  onEdit,
  onDelete,
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
    onEdit(note);
  };

  // 삭제 핸들러
  const handleDelete = (event: React.MouseEvent<HTMLElement>) => {
    handleMenuClose(event);
    onDelete(note);
  };

  // 클립보드에 복사 핸들러
  const handleCopy = (event: React.MouseEvent<HTMLElement>) => {
    handleMenuClose(event);
    navigator.clipboard.writeText(note.content);
  };

  // 카드 클릭 핸들러
  const handleCardClick = () => {
    if (onClick) {
      onClick(note);
    }
  };

  // 노트 내용 요약 (최대 150자)
  const summarizeContent = (content: string, maxLength = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  // 생성 시간 포맷팅
  const formattedTime = formatDistanceToNow(new Date(note.created_at), {
    addSuffix: true,
    locale: ko,
  });

  // 메뉴 아이콘 렌더링
  const menuIcon = (
    <IconButton
      aria-label="더 보기"
      aria-controls={open ? 'note-menu' : undefined}
      aria-haspopup="true"
      aria-expanded={open ? 'true' : undefined}
      onClick={handleMenuOpen}
      size="small"
    >
      <MoreIcon fontSize="small" />
    </IconButton>
  );

  return (
    <Card
      title={`노트 #${note.id}`}
      subtitle={formattedTime}
      content={
        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
          {summarizeContent(note.content)}
        </Typography>
      }
      headerAction={menuIcon}
      onClick={onClick ? handleCardClick : undefined}
      elevation={elevation}
      badges={[
        {
          label: formatDate(note.created_at, 'yyyy-MM-dd'),
          color: 'default',
        },
      ]}
    >
      {/* 메뉴 */}
      <Menu
        id="note-menu"
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
        <MenuItem onClick={handleCopy}>
          <ListItemIcon>
            <CopyIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>복사</ListItemText>
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

export default NoteCard;
