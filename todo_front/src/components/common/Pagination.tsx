import React from 'react';
import {
  Box,
  Pagination as MuiPagination,
  PaginationItem,
  FormControl,
  Select,
  MenuItem,
  Typography,
  useTheme,
  SelectChangeEvent,
  Stack
} from '@mui/material';
import { PaginationInfo } from '@/types/api';
import { generatePageNumbers } from '@/utils/paginationUtils';

interface PaginationProps {
  paginationInfo: PaginationInfo;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  showPageSizeSelector?: boolean;
  showItemCount?: boolean;
  size?: 'small' | 'medium' | 'large';
  shape?: 'rounded' | 'circular';
}

const Pagination: React.FC<PaginationProps> = ({
  paginationInfo,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  showPageSizeSelector = true,
  showItemCount = true,
  size = 'medium',
  shape = 'rounded',
}) => {
  const theme = useTheme();
  const { currentPage, totalPages, pageSize, totalItems } = paginationInfo;

  // 페이지 변경 핸들러
  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    onPageChange(page);
  };

  // 페이지 크기 변경 핸들러
  const handlePageSizeChange = (event: SelectChangeEvent<number>) => {
    if (onPageSizeChange) {
      onPageSizeChange(Number(event.target.value));
    }
  };

  // 현재 표시되는 아이템 범위 계산
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between',
        alignItems: { xs: 'center', sm: 'center' },
        gap: 2,
        width: '100%',
        mt: 2,
      }}
    >
      {/* 아이템 카운트 정보 */}
      {showItemCount && (
        <Typography variant="body2" color="text.secondary">
          {totalItems > 0
            ? `${startItem}-${endItem} / 전체 ${totalItems}개`
            : '데이터가 없습니다'}
        </Typography>
      )}

      {/* 페이지네이션 컨트롤 */}
      <Stack 
        direction={{ xs: 'column', sm: 'row' }} 
        spacing={2} 
        alignItems="center"
      >
        <MuiPagination
          count={totalPages}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
          size={size}
          shape={shape}
          showFirstButton
          showLastButton
          siblingCount={1}
          boundaryCount={1}
          renderItem={(item) => (
            <PaginationItem
              {...item}
              sx={{
                '&.Mui-selected': {
                  fontWeight: 'bold',
                },
              }}
            />
          )}
        />

        {/* 페이지 크기 선택기 */}
        {showPageSizeSelector && onPageSizeChange && (
          <FormControl size="small" variant="outlined">
            <Select
              value={pageSize}
              onChange={handlePageSizeChange}
              displayEmpty
              sx={{ 
                minWidth: 80,
                height: size === 'small' ? 32 : 40,
              }}
            >
              {pageSizeOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}개씩
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Stack>
    </Box>
  );
};

export default Pagination;
