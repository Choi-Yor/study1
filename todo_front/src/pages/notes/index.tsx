import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Box, Container, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { observer } from 'mobx-react-lite';

import { Layout } from '@/components/layout';
import { PageHeader } from '@/components/common';
import { NoteList } from '@/components/notes';
import { noteService } from '@/services/noteService';
import { NoteFilterOptions } from '@/types/api';

const NotesPage = () => {
  const router = useRouter();
  
  // 상태 관리
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<NoteFilterOptions>({});
  
  // 필터 옵션 생성
  const filterOptions: NoteFilterOptions = {
    search: searchQuery,
    page,
    ordering: '-created_at', // 최신순 정렬
  };
  
  // 노트 데이터 가져오기
  const { 
    data, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['notes', filterOptions],
    queryFn: () => noteService.getNotes(filterOptions),
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
  
  // 노트 생성 핸들러
  const handleCreateNote = async (noteData: { content: string }) => {
    try {
      await noteService.createNote(noteData);
      refetch(); // 데이터 다시 불러오기
    } catch (error) {
      console.error('노트 생성 오류:', error);
    }
  };
  
  // 노트 수정 핸들러
  const handleUpdateNote = async (note: { id: number; content: string }) => {
    try {
      await noteService.updateNote(note.id, { content: note.content });
      refetch(); // 데이터 다시 불러오기
    } catch (error) {
      console.error('노트 수정 오류:', error);
    }
  };
  
  // 노트 삭제 핸들러
  const handleDeleteNote = async (note: { id: number }) => {
    try {
      await noteService.deleteNote(note.id);
      refetch(); // 데이터 다시 불러오기
    } catch (error) {
      console.error('노트 삭제 오류:', error);
    }
  };
  
  return (
    <Layout>
      <Head>
        <title>노트 | Todo & Notes App</title>
        <meta name="description" content="노트 관리 페이지" />
      </Head>
      
      <PageHeader
        title="노트"
        description="중요한 정보를 노트로 저장하고 관리하세요."
        actionLabel="노트 추가"
        onAction={() => {}}
      />
      
      <Box sx={{ mt: 3 }}>
        <NoteList
          notes={data?.results || []}
          loading={isLoading}
          error={error as Error}
          onCreateNote={handleCreateNote}
          onUpdateNote={handleUpdateNote}
          onDeleteNote={handleDeleteNote}
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

export default observer(NotesPage);
