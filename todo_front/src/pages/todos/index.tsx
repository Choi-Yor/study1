import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Box, Container, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { observer } from 'mobx-react-lite';

import { Layout } from '@/components/layout';
import { PageHeader } from '@/components/common';
import { TodoList } from '@/components/todos';
import { todoService } from '@/services/todoService';
import { TodoFilterOptions } from '@/types/api';

const TodosPage = () => {
  const router = useRouter();
  
  // 상태 관리
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<TodoFilterOptions>({});
  
  // 필터 옵션 생성
  const filterOptions: TodoFilterOptions = {
    ...filters,
    search: searchQuery,
    page,
    ordering: 'due_date', // 마감일 기준 정렬
  };
  
  // 할 일 데이터 가져오기
  const { 
    data, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['todos', filterOptions],
    queryFn: () => todoService.getTodos(filterOptions),
  });
  
  // 페이지 변경 핸들러
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };
  
  // 페이지 크기 변경 핸들러
  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1); // 페이지 크기가 변경되면 첫 페이지로 이동
  };
  
  // 검색 핸들러
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1); // 검색어가 변경되면 첫 페이지로 이동
  };
  
  // 필터 변경 핸들러
  const handleFilterChange = (newFilters: Record<string, any>) => {
    setFilters(newFilters);
    setPage(1); // 필터가 변경되면 첫 페이지로 이동
  };
  
  // 할 일 생성 핸들러
  const handleCreateTodo = async (todoData: any) => {
    try {
      await todoService.createTodo(todoData);
      refetch(); // 데이터 다시 불러오기
    } catch (error) {
      console.error('할 일 생성 오류:', error);
    }
  };
  
  // 할 일 수정 핸들러
  const handleUpdateTodo = async (todo: any) => {
    try {
      await todoService.updateTodo(todo.id, todo);
      refetch(); // 데이터 다시 불러오기
    } catch (error) {
      console.error('할 일 수정 오류:', error);
    }
  };
  
  // 할 일 삭제 핸들러
  const handleDeleteTodo = async (todo: any) => {
    try {
      await todoService.deleteTodo(todo.id);
      refetch(); // 데이터 다시 불러오기
    } catch (error) {
      console.error('할 일 삭제 오류:', error);
    }
  };
  
  // 할 일 상태 토글 핸들러
  const handleToggleTodoStatus = async (todo: any) => {
    try {
      await todoService.updateTodo(todo.id, todo);
      refetch(); // 데이터 다시 불러오기
    } catch (error) {
      console.error('할 일 상태 변경 오류:', error);
    }
  };
  
  return (
    <Layout>
      <Head>
        <title>할 일 | Todo & Notes App</title>
        <meta name="description" content="할 일 관리 페이지" />
      </Head>
      
      <PageHeader
        title="할 일"
        description="할 일을 관리하고 우선순위를 설정하세요."
        actionLabel="할 일 추가"
        onAction={() => {}}
      />
      
      <Box sx={{ mt: 3 }}>
        <TodoList
          todos={data?.results || []}
          loading={isLoading}
          error={error as Error}
          onCreateTodo={handleCreateTodo}
          onUpdateTodo={handleUpdateTodo}
          onDeleteTodo={handleDeleteTodo}
          onToggleTodoStatus={handleToggleTodoStatus}
          totalCount={data?.count || 0}
          page={page}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onSearch={handleSearch}
          onFilter={handleFilterChange}
        />
      </Box>
    </Layout>
  );
};

export default observer(TodosPage);
