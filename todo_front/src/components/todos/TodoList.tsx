import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Typography, 
  Fab, 
  useTheme, 
  useMediaQuery,
  Stack,
  Button,
  Chip,
  Divider
} from '@mui/material';
import { 
  Add as AddIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { Todo } from '@/types/api';
import { 
  Modal, 
  LoadingState, 
  ErrorState, 
  EmptyState,
  Pagination,
  SearchField,
  FilterBar
} from '@/components/common';
import TodoCard from './TodoCard';
import TodoForm from './TodoForm';
import TodoDetail from './TodoDetail';
import { ConfirmDialog } from '@/components/common';

interface TodoListProps {
  todos: Todo[];
  loading?: boolean;
  error?: Error | null;
  onCreateTodo?: (todo: Partial<Todo>) => void;
  onUpdateTodo?: (todo: Todo) => void;
  onDeleteTodo?: (todo: Todo) => void;
  onToggleTodoStatus?: (todo: Todo) => void;
  totalCount?: number;
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onSearch?: (query: string) => void;
  onFilter?: (filters: Record<string, any>) => void;
}

// 필터 옵션 정의
const priorityOptions = [
  { value: 'High', label: '높음' },
  { value: 'Medium', label: '중간' },
  { value: 'Low', label: '낮음' },
];

const statusOptions = [
  { value: 'Pending', label: '진행 중' },
  { value: 'Completed', label: '완료됨' },
];

const TodoList: React.FC<TodoListProps> = ({
  todos,
  loading = false,
  error = null,
  onCreateTodo,
  onUpdateTodo,
  onDeleteTodo,
  onToggleTodoStatus,
  totalCount = 0,
  page = 1,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  onSearch,
  onFilter,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // 상태 관리
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  
  // 검색어 변경 핸들러
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (onSearch) {
      onSearch(value);
    }
  };
  
  // 필터 변경 핸들러
  const handleFilterChange = (filters: Record<string, any>) => {
    setActiveFilters(filters);
    if (onFilter) {
      onFilter(filters);
    }
  };
  
  // 필터 제거 핸들러
  const handleRemoveFilter = (key: string) => {
    const newFilters = { ...activeFilters };
    delete newFilters[key];
    setActiveFilters(newFilters);
    if (onFilter) {
      onFilter(newFilters);
    }
  };
  
  // 모든 필터 제거 핸들러
  const handleClearFilters = () => {
    setActiveFilters({});
    if (onFilter) {
      onFilter({});
    }
  };
  
  // 할 일 생성 모달 열기/닫기
  const handleOpenCreateModal = () => setIsCreateModalOpen(true);
  const handleCloseCreateModal = () => setIsCreateModalOpen(false);
  
  // 할 일 상세 모달 열기/닫기
  const handleOpenDetailModal = (todo: Todo) => {
    setSelectedTodo(todo);
    setIsDetailModalOpen(true);
  };
  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedTodo(null);
  };
  
  // 할 일 편집 모달 열기/닫기
  const handleOpenEditModal = (todo: Todo) => {
    setSelectedTodo(todo);
    setIsEditModalOpen(true);
  };
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedTodo(null);
  };
  
  // 할 일 삭제 다이얼로그 열기/닫기
  const handleOpenDeleteDialog = (todo: Todo) => {
    setSelectedTodo(todo);
    setIsDeleteDialogOpen(true);
  };
  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setSelectedTodo(null);
  };
  
  // 할 일 생성 제출 핸들러
  const handleCreateSubmit = (todo: Partial<Todo>) => {
    if (onCreateTodo) {
      onCreateTodo(todo);
      handleCloseCreateModal();
    }
  };
  
  // 할 일 편집 제출 핸들러
  const handleEditSubmit = (updatedTodo: Partial<Todo>) => {
    if (selectedTodo && onUpdateTodo) {
      onUpdateTodo({ ...selectedTodo, ...updatedTodo });
      handleCloseEditModal();
      // 상세 모달이 열려있다면 선택된 할 일 업데이트
      if (isDetailModalOpen) {
        setSelectedTodo({ ...selectedTodo, ...updatedTodo as Todo });
      }
    }
  };
  
  // 할 일 삭제 확인 핸들러
  const handleConfirmDelete = () => {
    if (selectedTodo && onDeleteTodo) {
      onDeleteTodo(selectedTodo);
      handleCloseDeleteDialog();
      // 상세 모달이 열려있다면 닫기
      if (isDetailModalOpen) {
        handleCloseDetailModal();
      }
    }
  };
  
  // 할 일 상태 토글 핸들러
  const handleToggleStatus = (todo: Todo) => {
    if (onToggleTodoStatus) {
      const updatedTodo = { 
        ...todo, 
        status: todo.status === 'Completed' ? 'Pending' : 'Completed' 
      };
      onToggleTodoStatus(updatedTodo);
      
      // 상세 모달이 열려있고 선택된 할 일이 토글된 할 일과 같다면 선택된 할 일 업데이트
      if (isDetailModalOpen && selectedTodo && selectedTodo.id === todo.id) {
        setSelectedTodo(updatedTodo);
      }
    }
  };
  
  // 필터 옵션 생성
  const filterOptions = [
    {
      id: 'priority',
      label: '우선순위',
      options: priorityOptions,
    },
    {
      id: 'status',
      label: '상태',
      options: statusOptions,
    },
  ];
  
  // 활성 필터 칩 렌더링
  const renderActiveFilters = () => {
    const filterChips = Object.entries(activeFilters).map(([key, value]) => {
      let label = '';
      
      // 필터 라벨 찾기
      if (key === 'priority') {
        const option = priorityOptions.find(opt => opt.value === value);
        label = option ? `우선순위: ${option.label}` : '';
      } else if (key === 'status') {
        const option = statusOptions.find(opt => opt.value === value);
        label = option ? `상태: ${option.label}` : '';
      } else {
        label = `${key}: ${value}`;
      }
      
      return (
        <Chip
          key={key}
          label={label}
          onDelete={() => handleRemoveFilter(key)}
          size="small"
          color="primary"
          variant="outlined"
        />
      );
    });
    
    if (filterChips.length === 0) return null;
    
    return (
      <Box sx={{ mt: 2, mb: 2 }}>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <Typography variant="body2" color="text.secondary">
            활성 필터:
          </Typography>
          {filterChips}
          <Button 
            size="small" 
            variant="text" 
            color="primary" 
            onClick={handleClearFilters}
          >
            모두 지우기
          </Button>
        </Stack>
      </Box>
    );
  };
  
  // 로딩 상태 표시
  if (loading && todos.length === 0) {
    return <LoadingState />;
  }
  
  // 에러 상태 표시
  if (error) {
    return <ErrorState error={error} />;
  }
  
  return (
    <Box>
      {/* 검색 및 필터 영역 */}
      <Box sx={{ mb: 3 }}>
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={2} 
          alignItems={{ xs: 'stretch', sm: 'center' }}
          justifyContent="space-between"
          sx={{ mb: 2 }}
        >
          <SearchField
            placeholder="할 일 검색..."
            value={searchQuery}
            onChange={handleSearchChange}
            fullWidth={isMobile}
          />
          
          <FilterBar
            options={filterOptions}
            onChange={handleFilterChange}
            activeFilters={activeFilters}
            buttonProps={{
              startIcon: <FilterIcon />,
              variant: 'outlined',
              size: 'medium',
            }}
          />
        </Stack>
        
        {/* 활성 필터 표시 */}
        {renderActiveFilters()}
      </Box>
      
      {/* 할 일 목록 */}
      {todos.length === 0 ? (
        <EmptyState 
          title="할 일이 없습니다"
          description="새로운 할 일을 추가해보세요!"
          actionLabel={onCreateTodo ? "할 일 추가" : undefined}
          onAction={onCreateTodo ? handleOpenCreateModal : undefined}
        />
      ) : (
        <>
          <Grid container spacing={2}>
            {todos.map((todo) => (
              <Grid item xs={12} sm={6} md={4} key={todo.id}>
                <TodoCard
                  todo={todo}
                  onEdit={handleOpenEditModal}
                  onDelete={handleOpenDeleteDialog}
                  onToggleStatus={handleToggleStatus}
                  onClick={handleOpenDetailModal}
                  elevation={1}
                />
              </Grid>
            ))}
          </Grid>
          
          {/* 페이지네이션 */}
          {totalCount > 0 && onPageChange && (
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
              <Pagination
                count={totalCount}
                page={page}
                pageSize={pageSize}
                onPageChange={onPageChange}
                onPageSizeChange={onPageSizeChange}
              />
            </Box>
          )}
        </>
      )}
      
      {/* 할 일 추가 버튼 */}
      {onCreateTodo && (
        <Fab
          color="primary"
          aria-label="할 일 추가"
          sx={{
            position: 'fixed',
            bottom: theme.spacing(3),
            right: theme.spacing(3),
          }}
          onClick={handleOpenCreateModal}
        >
          <AddIcon />
        </Fab>
      )}
      
      {/* 할 일 생성 모달 */}
      {onCreateTodo && (
        <Modal
          open={isCreateModalOpen}
          onClose={handleCloseCreateModal}
          title="새 할 일 추가"
          maxWidth="sm"
          fullWidth
        >
          <TodoForm
            onSubmit={handleCreateSubmit}
            onCancel={handleCloseCreateModal}
            submitLabel="추가"
          />
        </Modal>
      )}
      
      {/* 할 일 상세 모달 */}
      <Modal
        open={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        title="할 일 상세"
        maxWidth="md"
        fullWidth
      >
        <TodoDetail
          todo={selectedTodo}
          onEdit={onUpdateTodo ? handleOpenEditModal : undefined}
          onDelete={onDeleteTodo ? handleOpenDeleteDialog : undefined}
          onToggleStatus={onToggleTodoStatus ? handleToggleStatus : undefined}
          onClose={handleCloseDetailModal}
        />
      </Modal>
      
      {/* 할 일 편집 모달 */}
      {onUpdateTodo && selectedTodo && (
        <Modal
          open={isEditModalOpen}
          onClose={handleCloseEditModal}
          title="할 일 편집"
          maxWidth="sm"
          fullWidth
        >
          <TodoForm
            initialData={selectedTodo}
            onSubmit={handleEditSubmit}
            onCancel={handleCloseEditModal}
            submitLabel="저장"
          />
        </Modal>
      )}
      
      {/* 할 일 삭제 확인 다이얼로그 */}
      {onDeleteTodo && selectedTodo && (
        <ConfirmDialog
          open={isDeleteDialogOpen}
          onClose={handleCloseDeleteDialog}
          onConfirm={handleConfirmDelete}
          title="할 일 삭제"
          content={`"${selectedTodo.task}" 할 일을 삭제하시겠습니까?`}
          confirmLabel="삭제"
          confirmColor="error"
        />
      )}
    </Box>
  );
};

export default TodoList;
