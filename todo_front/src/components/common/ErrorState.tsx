import React from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  useTheme,
  SvgIcon
} from '@mui/material';
import { ErrorOutline as ErrorIcon } from '@mui/icons-material';
import { getErrorMessage } from '@/utils/errorUtils';

interface ErrorStateProps {
  error: Error | unknown;
  resetError?: () => void;
  fullPage?: boolean;
}

const ErrorState: React.FC<ErrorStateProps> = ({
  error,
  resetError,
  fullPage = false,
}) => {
  const theme = useTheme();
  const errorMessage = getErrorMessage(error);

  // 풀 페이지 에러 상태
  if (fullPage) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          p: 3,
          textAlign: 'center',
        }}
      >
        <ErrorIcon color="error" sx={{ fontSize: 80, mb: 2 }} />
        <Typography variant="h4" component="h1" gutterBottom>
          오류가 발생했습니다
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 500 }}>
          {errorMessage}
        </Typography>
        {resetError && (
          <Button
            variant="contained"
            color="primary"
            onClick={resetError}
            sx={{ mt: 2 }}
          >
            다시 시도
          </Button>
        )}
        <Button
          variant="outlined"
          color="primary"
          onClick={() => window.location.href = '/'}
          sx={{ mt: 2 }}
        >
          홈으로 돌아가기
        </Button>
      </Box>
    );
  }

  // 인라인 에러 상태
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 2,
        backgroundColor: theme.palette.error.light,
        border: `1px solid ${theme.palette.error.main}`,
        color: theme.palette.error.contrastText,
        width: '100%',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <ErrorIcon sx={{ mr: 1 }} />
        <Typography variant="h6" component="h2">
          오류가 발생했습니다
        </Typography>
      </Box>
      <Typography variant="body2" sx={{ mb: 2 }}>
        {errorMessage}
      </Typography>
      {resetError && (
        <Button
          variant="contained"
          size="small"
          onClick={resetError}
          sx={{ 
            backgroundColor: theme.palette.error.dark,
            '&:hover': {
              backgroundColor: theme.palette.error.main,
            }
          }}
        >
          다시 시도
        </Button>
      )}
    </Paper>
  );
};

export default ErrorState;
