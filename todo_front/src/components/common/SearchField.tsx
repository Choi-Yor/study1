import React, { useState, useEffect } from 'react';
import {
  TextField,
  InputAdornment,
  IconButton,
  Paper,
  useTheme,
  Box,
  Tooltip
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as ClearIcon
} from '@mui/icons-material';

interface SearchFieldProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  fullWidth?: boolean;
  autoFocus?: boolean;
  debounceMs?: number;
  variant?: 'standard' | 'outlined' | 'filled';
  size?: 'small' | 'medium';
  elevation?: number;
}

const SearchField: React.FC<SearchFieldProps> = ({
  placeholder = '검색...',
  value,
  onChange,
  onSearch,
  fullWidth = true,
  autoFocus = false,
  debounceMs = 300,
  variant = 'outlined',
  size = 'medium',
  elevation = 0,
}) => {
  const theme = useTheme();
  const [inputValue, setInputValue] = useState(value);
  
  // 입력값이 변경될 때마다 로컬 상태 업데이트
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // 디바운스 처리
  useEffect(() => {
    const handler = setTimeout(() => {
      if (inputValue !== value) {
        onChange(inputValue);
      }
    }, debounceMs);

    return () => {
      clearTimeout(handler);
    };
  }, [inputValue, onChange, value, debounceMs]);

  // 입력 변경 핸들러
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  // 클리어 버튼 핸들러
  const handleClear = () => {
    setInputValue('');
    onChange('');
  };

  // 검색 제출 핸들러
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(inputValue);
    }
  };

  return (
    <Paper
      component="form"
      onSubmit={handleSubmit}
      elevation={elevation}
      sx={{
        display: 'flex',
        alignItems: 'center',
        width: fullWidth ? '100%' : 'auto',
        borderRadius: size === 'small' ? 1 : 2,
        overflow: 'hidden',
        border: elevation === 0 ? `1px solid ${theme.palette.divider}` : 'none',
      }}
    >
      <TextField
        value={inputValue}
        onChange={handleInputChange}
        placeholder={placeholder}
        variant={variant}
        size={size}
        fullWidth
        autoFocus={autoFocus}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
          endAdornment: inputValue ? (
            <InputAdornment position="end">
              <Tooltip title="지우기">
                <IconButton
                  aria-label="clear search"
                  onClick={handleClear}
                  edge="end"
                  size="small"
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </InputAdornment>
          ) : null,
          sx: {
            pl: variant === 'outlined' ? 1 : 0,
          }
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              border: 'none',
            },
          },
          '& .MuiFilledInput-root': {
            backgroundColor: 'background.paper',
            '&:hover': {
              backgroundColor: 'action.hover',
            },
            '&.Mui-focused': {
              backgroundColor: 'background.paper',
            },
          },
        }}
      />
      {/* 검색 버튼 (시각적으로 숨김, 엔터 키로 제출 가능) */}
      <Box sx={{ display: 'none' }}>
        <button type="submit">검색</button>
      </Box>
    </Paper>
  );
};

export default SearchField;
