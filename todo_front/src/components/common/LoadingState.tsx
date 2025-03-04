import React from 'react';
import { Box, CircularProgress, Typography, useTheme } from '@mui/material';

interface LoadingStateProps {
  message?: string;
  fullPage?: boolean;
  size?: 'small' | 'medium' | 'large';
  overlay?: boolean;
}

const LoadingState: React.FC<LoadingStateProps> = ({
  message = '로딩 중...',
  fullPage = false,
  size = 'medium',
  overlay = false,
}) => {
  const theme = useTheme();
  
  // 크기에 따른 CircularProgress 사이즈 결정
  const getProgressSize = () => {
    switch (size) {
      case 'small':
        return 24;
      case 'large':
        return 60;
      case 'medium':
      default:
        return 40;
    }
  };

  const progressSize = getProgressSize();

  // 풀 페이지 로딩 상태
  if (fullPage) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: theme.zIndex.modal + 1,
          backgroundColor: overlay 
            ? 'rgba(0, 0, 0, 0.5)' 
            : theme.palette.background.default,
        }}
      >
        <CircularProgress size={progressSize} color="primary" />
        {message && (
          <Typography
            variant="body1"
            sx={{ mt: 2, color: overlay ? 'white' : 'text.primary' }}
          >
            {message}
          </Typography>
        )}
      </Box>
    );
  }

  // 인라인 로딩 상태
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
        width: '100%',
      }}
    >
      <CircularProgress size={progressSize} color="primary" />
      {message && (
        <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
          {message}
        </Typography>
      )}
    </Box>
  );
};

export default LoadingState;
