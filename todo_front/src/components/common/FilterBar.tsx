import React, { useState } from 'react';
import {
  Box,
  Paper,
  Button,
  IconButton,
  Tooltip,
  Collapse,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  Typography,
  useTheme,
  SelectChangeEvent,
} from '@mui/material';
import {
  FilterList as FilterIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { FilterOption } from '@/utils/filterUtils';
import SearchField from './SearchField';

interface FilterBarProps {
  filters: Record<string, any>;
  filterOptions: FilterOption[];
  onFilterChange: (name: string, value: any) => void;
  onClearFilters: () => void;
  onSearchChange?: (value: string) => void;
  searchValue?: string;
  searchPlaceholder?: string;
  loading?: boolean;
}

const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  filterOptions,
  onFilterChange,
  onClearFilters,
  onSearchChange,
  searchValue = '',
  searchPlaceholder = '검색...',
  loading = false,
}) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);

  // 필터 확장 토글
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  // 활성화된 필터 수 계산
  const activeFilterCount = Object.keys(filters).filter(
    (key) => filters[key] !== '' && filters[key] !== null && filters[key] !== undefined
  ).length;

  // 선택 필터 변경 핸들러
  const handleSelectChange = (event: SelectChangeEvent<any>, name: string) => {
    onFilterChange(name, event.target.value);
  };

  // 텍스트 필터 변경 핸들러
  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>, name: string) => {
    onFilterChange(name, event.target.value);
  };

  // 날짜 필터 변경 핸들러
  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>, name: string) => {
    onFilterChange(name, event.target.value);
  };

  // 필터 렌더링
  const renderFilterInput = (option: FilterOption) => {
    const { type, name, label, options } = option;
    const value = filters[name] || '';

    switch (type) {
      case 'select':
        return (
          <FormControl fullWidth size="small" key={name}>
            <InputLabel id={`filter-${name}-label`}>{label}</InputLabel>
            <Select
              labelId={`filter-${name}-label`}
              id={`filter-${name}`}
              value={value}
              label={label}
              onChange={(e) => handleSelectChange(e, name)}
              disabled={loading}
            >
              <MenuItem value="">
                <em>전체</em>
              </MenuItem>
              {options?.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      case 'text':
        return (
          <TextField
            key={name}
            id={`filter-${name}`}
            label={label}
            value={value}
            onChange={(e) => handleTextChange(e as React.ChangeEvent<HTMLInputElement>, name)}
            fullWidth
            size="small"
            disabled={loading}
          />
        );

      case 'date':
        return (
          <TextField
            key={name}
            id={`filter-${name}`}
            label={label}
            type="date"
            value={value}
            onChange={(e) => handleDateChange(e, name)}
            fullWidth
            size="small"
            InputLabelProps={{
              shrink: true,
            }}
            disabled={loading}
          />
        );

      default:
        return null;
    }
  };

  // 활성화된 필터 칩 렌더링
  const renderActiveFilterChips = () => {
    return Object.keys(filters)
      .filter((key) => filters[key] !== '' && filters[key] !== null && filters[key] !== undefined)
      .map((key) => {
        const option = filterOptions.find((opt) => opt.name === key);
        if (!option) return null;

        let label = option.label;
        let value = filters[key];

        // 선택 옵션의 경우 레이블 찾기
        if (option.type === 'select' && option.options) {
          const selectedOption = option.options.find((opt) => opt.value === value);
          if (selectedOption) {
            value = selectedOption.label;
          }
        }

        return (
          <Chip
            key={key}
            label={`${label}: ${value}`}
            onDelete={() => onFilterChange(key, '')}
            size="small"
            sx={{ m: 0.5 }}
          />
        );
      });
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 3,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: activeFilterCount > 0 ? 2 : 0 }}>
        {/* 검색 필드 */}
        {onSearchChange && (
          <Box sx={{ flexGrow: 1, mr: 1 }}>
            <SearchField
              value={searchValue}
              onChange={onSearchChange}
              placeholder={searchPlaceholder}
              size="small"
              elevation={0}
            />
          </Box>
        )}

        {/* 필터 버튼 */}
        <Tooltip title={expanded ? '필터 접기' : '필터 펼치기'}>
          <Button
            color="inherit"
            startIcon={<FilterIcon />}
            endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            onClick={toggleExpanded}
            size="small"
            sx={{ 
              minWidth: 'auto',
              ...(activeFilterCount > 0 && {
                color: theme.palette.primary.main,
              }),
            }}
          >
            필터
            {activeFilterCount > 0 && (
              <Chip
                label={activeFilterCount}
                size="small"
                color="primary"
                sx={{ ml: 1, height: 20, minWidth: 20 }}
              />
            )}
          </Button>
        </Tooltip>

        {/* 필터 초기화 버튼 */}
        {activeFilterCount > 0 && (
          <Tooltip title="필터 초기화">
            <IconButton onClick={onClearFilters} size="small" sx={{ ml: 1 }}>
              <ClearIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* 활성화된 필터 칩 */}
      {activeFilterCount > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', mt: 1, mb: 1 }}>
          {renderActiveFilterChips()}
        </Box>
      )}

      {/* 확장된 필터 패널 */}
      <Collapse in={expanded}>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {filterOptions.map((option) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={option.name}>
              {renderFilterInput(option)}
            </Grid>
          ))}
        </Grid>
      </Collapse>
    </Paper>
  );
};

export default FilterBar;
