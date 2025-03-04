import React from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  useTheme,
  SvgIcon
} from '@mui/material';
import { 
  InboxOutlined as InboxIcon,
  Add as AddIcon
} from '@mui/icons-material';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  compact?: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action,
  compact = false,
}) => {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        p: compact ? 3 : 5,
        borderRadius: 2,
        backgroundColor: theme.palette.background.paper,
        border: `1px dashed ${theme.palette.divider}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        width: '100%',
      }}
    >
      {/* 아이콘 */}
      {icon || (
        <InboxIcon
          sx={{
            fontSize: compact ? 48 : 72,
            color: theme.palette.text.secondary,
            opacity: 0.5,
            mb: 2,
          }}
        />
      )}

      {/* 타이틀 */}
      <Typography
        variant={compact ? 'h6' : 'h5'}
        component="h2"
        gutterBottom
        sx={{ fontWeight: 'medium' }}
      >
        {title}
      </Typography>

      {/* 설명 */}
      {description && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 3, maxWidth: 400 }}
        >
          {description}
        </Typography>
      )}

      {/* 액션 버튼 */}
      {action && (
        <Button
          variant="contained"
          color="primary"
          onClick={action.onClick}
          startIcon={action.icon || <AddIcon />}
          size={compact ? 'small' : 'medium'}
        >
          {action.label}
        </Button>
      )}
    </Paper>
  );
};

export default EmptyState;
