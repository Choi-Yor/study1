import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Box, Container, Button, Stack, Typography } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { observer } from 'mobx-react-lite';

import { Layout } from '@/components/layout';
import { PageHeader, LoadingState, ErrorState, Modal, ConfirmDialog } from '@/components/common';
import { NoteDetail, NoteForm } from '@/components/notes';
import { noteService } from '@/services/noteService';
import { Note } from '@/types/api';

const NoteDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const queryClient = useQueryClient();
  
  // 상태 관리
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // 노트 데이터 가져오기
  const { 
    data: note, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['note', id],
    queryFn: () => noteService.getNoteById(Number(id)),
    enabled: !!id, // id가 있을 때만 쿼리 실행
  });
  
  // 노트 수정 뮤테이션
  const updateNoteMutation = useMutation({
    mutationFn: ({ id, content }: { id: number; content: string }) => 
      noteService.updateNote(id, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['note', id] });
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      setIsEditMode(false);
    },
  });
  
  // 노트 삭제 뮤테이션
  const deleteNoteMutation = useMutation({
    mutationFn: (id: number) => noteService.deleteNote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      router.push('/notes');
    },
  });
  
  // 편집 모드 토글
  const handleEditClick = () => {
    setIsEditMode(true);
  };
  
  // 편집 취소
  const handleCancelEdit = () => {
    setIsEditMode(false);
  };
  
  // 편집 제출
  const handleSubmitEdit = (updatedNote: Partial<Note>) => {
    if (note && updatedNote.content) {
      updateNoteMutation.mutate({ 
        id: note.id, 
        content: updatedNote.content 
      });
    }
  };
  
  // 삭제 다이얼로그 열기
  const handleOpenDeleteDialog = () => {
    setIsDeleteDialogOpen(true);
  };
  
  // 삭제 다이얼로그 닫기
  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
  };
  
  // 삭제 확인
  const handleConfirmDelete = () => {
    if (note) {
      deleteNoteMutation.mutate(note.id);
    }
    handleCloseDeleteDialog();
  };
  
  // 뒤로 가기
  const handleGoBack = () => {
    router.push('/notes');
  };
  
  // 로딩 상태
  if (isLoading) {
    return (
      <Layout>
        <Head>
          <title>노트 상세 | Todo & Notes App</title>
        </Head>
        <LoadingState />
      </Layout>
    );
  }
  
  // 에러 상태
  if (error) {
    return (
      <Layout>
        <Head>
          <title>노트 상세 | Todo & Notes App</title>
        </Head>
        <ErrorState error={error as Error} />
      </Layout>
    );
  }
  
  // 노트가 없는 경우
  if (!note) {
    return (
      <Layout>
        <Head>
          <title>노트 상세 | Todo & Notes App</title>
        </Head>
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            노트를 찾을 수 없습니다.
          </Typography>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={handleGoBack}
            sx={{ mt: 2 }}
          >
            노트 목록으로 돌아가기
          </Button>
        </Box>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <Head>
        <title>노트 상세 | Todo & Notes App</title>
        <meta name="description" content="노트 상세 정보" />
      </Head>
      
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={handleGoBack}
          variant="text"
        >
          노트 목록
        </Button>
      </Stack>
      
      {isEditMode ? (
        <Box sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 1 }}>
          <Typography variant="h6" gutterBottom>
            노트 편집
          </Typography>
          <NoteForm
            initialData={note}
            onSubmit={handleSubmitEdit}
            onCancel={handleCancelEdit}
            loading={updateNoteMutation.isPending}
          />
        </Box>
      ) : (
        <NoteDetail
          note={note}
          onEdit={handleEditClick}
          onDelete={handleOpenDeleteDialog}
        />
      )}
      
      {/* 삭제 확인 다이얼로그 */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        title="노트 삭제"
        content="이 노트를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
        confirmLabel="삭제"
        confirmColor="error"
        isLoading={deleteNoteMutation.isPending}
      />
    </Layout>
  );
};

export default observer(NoteDetailPage);
