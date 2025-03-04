import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Box,
  useTheme,
  useMediaQuery,
  Divider,
  LinearProgress
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  fullWidth?: boolean;
  fullScreen?: boolean;
  loading?: boolean;
  disableBackdropClick?: boolean;
  disableEscapeKeyDown?: boolean;
  hideCloseButton?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  children,
  actions,
  maxWidth = 'sm',
  fullWidth = true,
  fullScreen: fullScreenProp,
  loading = false,
  disableBackdropClick = false,
  disableEscapeKeyDown = false,
  hideCloseButton = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // 모바일에서 자동으로 전체 화면으로 표시할지 여부
  const fullScreen = fullScreenProp !== undefined ? fullScreenProp : isMobile;

  // 백드롭 클릭 핸들러
  const handleBackdropClick = (event: React.MouseEvent) => {
    if (disableBackdropClick) {
      event.stopPropagation();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      fullScreen={fullScreen}
      onBackdropClick={handleBackdropClick}
      disableEscapeKeyDown={disableEscapeKeyDown}
      PaperProps={{
        elevation: 2,
        sx: {
          borderRadius: fullScreen ? 0 : 2,
          overflow: 'hidden',
        },
      }}
    >
      {/* 로딩 인디케이터 */}
      {loading && (
        <LinearProgress
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1,
          }}
        />
      )}

      {/* 모달 헤더 */}
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          pb: 1,
        }}
      >
        <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        {!hideCloseButton && (
          <IconButton
            aria-label="close"
            onClick={onClose}
            size="small"
            disabled={loading}
            sx={{
              color: theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        )}
      </DialogTitle>

      <Divider />

      {/* 모달 콘텐츠 */}
      <DialogContent sx={{ p: 3 }}>
        {children}
      </DialogContent>

      {/* 모달 액션 버튼 */}
      {actions && (
        <>
          <Divider />
          <DialogActions sx={{ p: 2 }}>
            {actions}
          </DialogActions>
        </>
      )}
    </Dialog>
  );
};

export default Modal;
