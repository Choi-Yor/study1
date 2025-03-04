import React, { useState } from 'react';
import { 
  Box, 
  Grid, 
  Button,
  useTheme,
  Typography
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { Note, NoteFilterOptions, PaginatedResponse } from '@/types/api';
import { 
  LoadingState, 
  ErrorState, 
  EmptyState,
  FilterBar,
  Pagination,
  Modal,
  ConfirmDialog
} from '@/components/common';
import NoteCard from './NoteCard';
import NoteForm from './NoteForm';
import NoteDetail from './NoteDetail';
import { createFilterOptions } from '@/utils/filterUtils';

interface NoteListProps {
  notes: PaginatedResponse<Note> | undefined;
  loading: boolean;
  error: Error | null;
  filters: Partial<NoteFilterOptions>;
  onFilterChange: (name: string, value: any) => void;
  onClearFilters: () => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onCreateNote: (data: Partial<Note>) => void;
  onUpdateNote: (id: number, data: Partial<Note>) => void;
  onDeleteNote: (id: number) => void;
}

const NoteList: React.FC<NoteListProps> = ({
  notes,
  loading,
  error,
  filters,
  onFilterChange,
  onClearFilters,
  onPageChange,
  onPageSizeChange,
  onCreateNote,
  onUpdateNote,
  onDeleteNote,
}) => {
  const theme = useTheme();
  
  // 상태 관리
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);
  
  // 필터 옵션 생성
  const filterOptions = createFilterOptions('note');

  // 노트 생성 모달 핸들러
  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleCreateNote = (data: Partial<Note>) => {
    onCreateNote(data);
    handleCloseCreateModal();
  };

  // 노트 편집 모달 핸들러
  const handleOpenEditModal = (note: Note) => {
    setSelectedNote(note);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedNote(null);
  };

  const handleUpdateNote = (data: Partial<Note>) => {
    if (selectedNote) {
      onUpdateNote(selectedNote.id, data);
      handleCloseEditModal();
    }
  };

  // 노트 상세 모달 핸들러
  const handleOpenDetailModal = (note: Note) => {
    setSelectedNote(note);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedNote(null);
  };

  // 노트 삭제 다이얼로그 핸들러
  const handleOpenDeleteDialog = (note: Note) => {
    setNoteToDelete(note);
    setIsDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setNoteToDelete(null);
  };

  const handleConfirmDelete = () => {
    if (noteToDelete) {
      onDeleteNote(noteToDelete.id);
      handleCloseDeleteDialog();
      
      // 상세 모달이 열려있었다면 닫기
      if (isDetailModalOpen) {
        handleCloseDetailModal();
      }
    }
  };

  // 에러 상태
  if (error) {
    return <ErrorState error={error} />;
  }

  // 페이지네이션 정보 계산
  const paginationInfo = notes ? {
    currentPage: Math.ceil(notes.count > 0 ? (filters.page || 1) : 1),
    totalPages: Math.ceil(notes.count / (filters.page_size || 10)),
    pageSize: filters.page_size || 10,
    totalItems: notes.count,
  } : {
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
    totalItems: 0,
  };

  return (
    <Box>
      {/* 필터 바 */}
      <FilterBar
        filters={filters}
        filterOptions={filterOptions}
        onFilterChange={onFilterChange}
        onClearFilters={onClearFilters}
        onSearchChange={(value) => onFilterChange('search', value)}
        searchValue={filters.search || ''}
        searchPlaceholder="노트 검색..."
        loading={loading}
      />

      {/* 로딩 상태 */}
      {loading && !notes && (
        <LoadingState message="노트를 불러오는 중..." />
      )}

      {/* 빈 상태 */}
      {!loading && notes && notes.results.length === 0 && (
        <EmptyState
          title="노트가 없습니다"
          description="새로운 노트를 추가해보세요."
          action={{
            label: "노트 추가",
            onClick: handleOpenCreateModal,
            icon: <AddIcon />,
          }}
        />
      )}

      {/* 노트 목록 */}
      {notes && notes.results.length > 0 && (
        <>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {notes.results.map((note) => (
              <Grid item xs={12} sm={6} md={4} key={note.id}>
                <NoteCard
                  note={note}
                  onEdit={handleOpenEditModal}
                  onDelete={handleOpenDeleteDialog}
                  onClick={handleOpenDetailModal}
                />
              </Grid>
            ))}
          </Grid>

          {/* 페이지네이션 */}
          <Pagination
            paginationInfo={paginationInfo}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
            showPageSizeSelector={true}
            showItemCount={true}
          />
        </>
      )}

      {/* 새 노트 버튼 (고정) */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000,
        }}
      >
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenCreateModal}
          sx={{
            borderRadius: 8,
            px: 3,
            py: 1.5,
            boxShadow: theme.shadows[4],
          }}
        >
          노트 추가
        </Button>
      </Box>

      {/* 노트 생성 모달 */}
      <Modal
        open={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        title="새 노트 추가"
        maxWidth="md"
      >
        <NoteForm
          onSubmit={handleCreateNote}
          onCancel={handleCloseCreateModal}
          submitLabel="추가"
        />
      </Modal>

      {/* 노트 편집 모달 */}
      <Modal
        open={isEditModalOpen}
        onClose={handleCloseEditModal}
        title={`노트 #${selectedNote?.id} 편집`}
        maxWidth="md"
      >
        {selectedNote && (
          <NoteForm
            initialData={selectedNote}
            onSubmit={handleUpdateNote}
            onCancel={handleCloseEditModal}
            submitLabel="저장"
          />
        )}
      </Modal>

      {/* 노트 상세 모달 */}
      <Modal
        open={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        title="노트 상세"
        maxWidth="md"
      >
        {selectedNote && (
          <NoteDetail
            note={selectedNote}
            onEdit={handleOpenEditModal}
            onDelete={handleOpenDeleteDialog}
          />
        )}
      </Modal>

      {/* 노트 삭제 확인 다이얼로그 */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        title="노트 삭제"
        message="이 노트를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
        confirmText="삭제"
        cancelText="취소"
        onConfirm={handleConfirmDelete}
        onCancel={handleCloseDeleteDialog}
        severity="error"
      />
    </Box>
  );
};

export default NoteList;
