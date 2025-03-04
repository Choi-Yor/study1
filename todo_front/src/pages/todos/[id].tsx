import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Box, Container, Button, Stack, Typography } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { observer } from 'mobx-react-lite';

import { Layout } from '@/components/layout';
import { PageHeader, LoadingState, ErrorState, Modal, ConfirmDialog } from '@/components/common';
import { TodoDetail, TodoForm } from '@/components/todos';
import { todoService } from '@/services/todoService';
import { Todo } from '@/types/api';

const TodoDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const queryClient = useQueryClient();
  
  // 상태 관리
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // 할 일 데이터 가져오기
  const { 
    data: todo, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['todo', id],
    queryFn: () => todoService.getTodoById(Number(id)),
    enabled: !!id, // id가 있을 때만 쿼리 실행
  });
  
  // 할 일 수정 뮤테이션
  const updateTodoMutation = useMutation({
    mutationFn: (updatedTodo: Todo) => 
      todoService.updateTodo(updatedTodo.id, updatedTodo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todo', id] });
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      setIsEditMode(false);
    },
  });
  
  // 할 일 삭제 뮤테이션
  const deleteTodoMutation = useMutation({
    mutationFn: (id: number) => todoService.deleteTodo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      router.push('/todos');
    },
  });
  
  // 할 일 상태 토글 뮤테이션
  const toggleTodoStatusMutation = useMutation({
    mutationFn: (todo: Todo) => {
      const updatedTodo = {
        ...todo,
        status: todo.status === 'Completed' ? 'Pending' : 'Completed',
      };
      return todoService.updateTodo(todo.id, updatedTodo);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todo', id] });
      queryClient.invalidateQueries({ queryKey: ['todos'] });
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
  const handleSubmitEdit = (updatedTodo: Partial<Todo>) => {
    if (todo) {
      updateTodoMutation.mutate({ ...todo, ...updatedTodo } as Todo);
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
    if (todo) {
      deleteTodoMutation.mutate(todo.id);
    }
    handleCloseDeleteDialog();
  };
  
  // 상태 토글
  const handleToggleStatus = () => {
    if (todo) {
      toggleTodoStatusMutation.mutate(todo);
    }
  };
  
  // 뒤로 가기
  const handleGoBack = () => {
    router.push('/todos');
  };
  
  // 로딩 상태
  if (isLoading) {
    return (
      <Layout>
        <Head>
          <title>할 일 상세 | Todo & Notes App</title>
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
          <title>할 일 상세 | Todo & Notes App</title>
        </Head>
        <ErrorState error={error as Error} />
      </Layout>
    );
  }
  
  // 할 일이 없는 경우
  if (!todo) {
    return (
      <Layout>
        <Head>
          <title>할 일 상세 | Todo & Notes App</title>
        </Head>
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            할 일을 찾을 수 없습니다.
          </Typography>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={handleGoBack}
            sx={{ mt: 2 }}
          >
            할 일 목록으로 돌아가기
          </Button>
        </Box>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <Head>
        <title>할 일 상세 | Todo & Notes App</title>
        <meta name="description" content="할 일 상세 정보" />
      </Head>
      
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={handleGoBack}
          variant="text"
        >
          할 일 목록
        </Button>
      </Stack>
      
      {isEditMode ? (
        <Box sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 1 }}>
          <Typography variant="h6" gutterBottom>
            할 일 편집
          </Typography>
          <TodoForm
            initialData={todo}
            onSubmit={handleSubmitEdit}
            onCancel={handleCancelEdit}
            loading={updateTodoMutation.isPending}
          />
        </Box>
      ) : (
        <TodoDetail
          todo={todo}
          onEdit={handleEditClick}
          onDelete={handleOpenDeleteDialog}
          onToggleStatus={handleToggleStatus}
          onClose={handleGoBack}
        />
      )}
      
      {/* 삭제 확인 다이얼로그 */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        title="할 일 삭제"
        content={`"${todo.task}" 할 일을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
        confirmLabel="삭제"
        confirmColor="error"
        isLoading={deleteTodoMutation.isPending}
      />
    </Layout>
  );
};

export default observer(TodoDetailPage);
