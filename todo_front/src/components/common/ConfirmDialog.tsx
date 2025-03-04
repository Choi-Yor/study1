import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Box,
  useTheme
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  severity?: 'info' | 'warning' | 'error' | 'success';
  loading?: boolean;
  icon?: React.ReactNode;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  confirmText = '확인',
  cancelText = '취소',
  onConfirm,
  onCancel,
  severity = 'warning',
  loading = false,
  icon,
}) => {
  const theme = useTheme();

  // 심각도에 따른 색상 결정
  const getSeverityColor = () => {
    switch (severity) {
      case 'error':
        return theme.palette.error.main;
      case 'warning':
        return theme.palette.warning.main;
      case 'success':
        return theme.palette.success.main;
      case 'info':
      default:
        return theme.palette.info.main;
    }
  };

  const severityColor = getSeverityColor();

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
      PaperProps={{
        elevation: 1,
        sx: {
          borderRadius: 2,
          maxWidth: 400,
        },
      }}
    >
      {/* 제목 */}
      <DialogTitle id="confirm-dialog-title" sx={{ pr: 6 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {icon && <Box sx={{ mr: 1, color: severityColor }}>{icon}</Box>}
          <Typography variant="h6" component="span">
            {title}
          </Typography>
        </Box>
        <IconButton
          aria-label="close"
          onClick={onCancel}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* 내용 */}
      <DialogContent>
        <DialogContentText id="confirm-dialog-description">
          {message}
        </DialogContentText>
      </DialogContent>

      {/* 액션 버튼 */}
      <DialogActions sx={{ p: 2, pt: 1 }}>
        <Button
          onClick={onCancel}
          color="inherit"
          disabled={loading}
        >
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color={severity}
          autoFocus
          disabled={loading}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
