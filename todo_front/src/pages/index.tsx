import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { 
  Box, 
  Grid, 
  Typography, 
  Paper, 
  Button, 
  Divider, 
  Stack,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Chip,
  useTheme,
  alpha
} from '@mui/material';
import { 
  CheckCircle as CheckIcon,
  RadioButtonUnchecked as UncheckedIcon,
  Flag as FlagIcon,
  AccessTime as TimeIcon,
  Assignment as AssignmentIcon,
  Note as NoteIcon,
  ArrowForward as ArrowForwardIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { observer } from 'mobx-react-lite';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

import { Layout } from '@/components/layout';
import { PageHeader, LoadingState, ErrorState } from '@/components/common';
import { Todo, Note } from '@/types/api';
import { todoService, noteService } from '@/services';
import { formatDate } from '@/utils/dateUtils';

const Dashboard = () => {
  const theme = useTheme();
  const router = useRouter();
  
  // 할 일 데이터 가져오기 (최근 5개)
  const { 
    data: todosData, 
    isLoading: isTodosLoading, 
    error: todosError 
  } = useQuery({
    queryKey: ['todos', { limit: 5 }],
    queryFn: () => todoService.getTodos({ limit: 5 }),
  });
  
  // 노트 데이터 가져오기 (최근 5개)
  const { 
    data: notesData, 
    isLoading: isNotesLoading, 
    error: notesError 
  } = useQuery({
    queryKey: ['notes', { limit: 5 }],
    queryFn: () => noteService.getNotes({ limit: 5 }),
  });
  
  // 할 일 통계 데이터
  const todoStats = {
    total: todosData?.count || 0,
    completed: todosData?.results.filter(todo => todo.status === 'Completed').length || 0,
    pending: todosData?.results.filter(todo => todo.status === 'Pending').length || 0,
    highPriority: todosData?.results.filter(todo => todo.priority === 'High').length || 0,
  };
  
  // 노트 통계 데이터
  const noteStats = {
    total: notesData?.count || 0,
    recentCount: notesData?.results.length || 0,
  };
  
  // 할 일 페이지로 이동
  const navigateToTodos = () => {
    router.push('/todos');
  };
  
  // 노트 페이지로 이동
  const navigateToNotes = () => {
    router.push('/notes');
  };
  
  // 할 일 상세 페이지로 이동
  const navigateToTodoDetail = (id: number) => {
    router.push(`/todos/${id}`);
  };
  
  // 노트 상세 페이지로 이동
  const navigateToNoteDetail = (id: number) => {
    router.push(`/notes/${id}`);
  };
  
  // 우선순위에 따른 색상 결정
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return theme.palette.error.main;
      case 'Medium':
        return theme.palette.warning.main;
      case 'Low':
        return theme.palette.success.main;
      default:
        return theme.palette.text.secondary;
    }
  };
  
  // 할 일 목록 렌더링
  const renderTodoList = () => {
    if (isTodosLoading) {
      return <LoadingState size="small" />;
    }
    
    if (todosError) {
      return <ErrorState error={todosError as Error} />;
    }
    
    if (!todosData?.results.length) {
      return (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            할 일이 없습니다.
          </Typography>
          <Button 
            startIcon={<AddIcon />} 
            sx={{ mt: 1 }}
            onClick={() => router.push('/todos')}
          >
            할 일 추가
          </Button>
        </Box>
      );
    }
    
    return (
      <List disablePadding>
        {todosData.results.map((todo) => (
          <React.Fragment key={todo.id}>
            <ListItem 
              disablePadding
              secondaryAction={
                <IconButton 
                  edge="end" 
                  aria-label="자세히 보기"
                  onClick={() => navigateToTodoDetail(todo.id)}
                >
                  <ArrowForwardIcon fontSize="small" />
                </IconButton>
              }
            >
              <ListItemButton onClick={() => navigateToTodoDetail(todo.id)}>
                <ListItemIcon>
                  {todo.status === 'Completed' ? (
                    <CheckIcon color="success" />
                  ) : (
                    <UncheckedIcon color="action" />
                  )}
                </ListItemIcon>
                <ListItemText 
                  primary={todo.task}
                  secondary={
                    <Stack direction="row" spacing={1} alignItems="center">
                      <FlagIcon 
                        fontSize="small" 
                        sx={{ 
                          color: getPriorityColor(todo.priority),
                          fontSize: '0.75rem'
                        }} 
                      />
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(todo.due_date, 'MM/dd')} 마감
                      </Typography>
                    </Stack>
                  }
                  primaryTypographyProps={{
                    style: {
                      textDecoration: todo.status === 'Completed' ? 'line-through' : 'none',
                    }
                  }}
                />
              </ListItemButton>
            </ListItem>
            <Divider component="li" />
          </React.Fragment>
        ))}
      </List>
    );
  };
  
  // 노트 목록 렌더링
  const renderNoteList = () => {
    if (isNotesLoading) {
      return <LoadingState size="small" />;
    }
    
    if (notesError) {
      return <ErrorState error={notesError as Error} />;
    }
    
    if (!notesData?.results.length) {
      return (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            노트가 없습니다.
          </Typography>
          <Button 
            startIcon={<AddIcon />} 
            sx={{ mt: 1 }}
            onClick={() => router.push('/notes')}
          >
            노트 추가
          </Button>
        </Box>
      );
    }
    
    return (
      <List disablePadding>
        {notesData.results.map((note) => (
          <React.Fragment key={note.id}>
            <ListItem 
              disablePadding
              secondaryAction={
                <IconButton 
                  edge="end" 
                  aria-label="자세히 보기"
                  onClick={() => navigateToNoteDetail(note.id)}
                >
                  <ArrowForwardIcon fontSize="small" />
                </IconButton>
              }
            >
              <ListItemButton onClick={() => navigateToNoteDetail(note.id)}>
                <ListItemIcon>
                  <NoteIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary={note.content.length > 50 ? `${note.content.substring(0, 50)}...` : note.content}
                  secondary={
                    <Typography variant="caption" color="text.secondary">
                      {formatDistanceToNow(new Date(note.created_at), { addSuffix: true, locale: ko })}
                    </Typography>
                  }
                />
              </ListItemButton>
            </ListItem>
            <Divider component="li" />
          </React.Fragment>
        ))}
      </List>
    );
  };
  
  // 통계 카드 렌더링
  const renderStatCard = (
    title: string, 
    value: number, 
    icon: React.ReactNode, 
    color: string,
    onClick?: () => void
  ) => (
    <Paper
      sx={{
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        bgcolor: alpha(color, 0.1),
        cursor: onClick ? 'pointer' : 'default',
      }}
      onClick={onClick}
      elevation={1}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Box sx={{ mr: 1 }}>{icon}</Box>
        <Typography variant="h6" component="div">
          {title}
        </Typography>
      </Box>
      <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', color }}>
        {value}
      </Typography>
    </Paper>
  );
  
  return (
    <Layout>
      <Head>
        <title>대시보드 | Todo & Notes App</title>
        <meta name="description" content="할 일 및 노트 관리 앱 대시보드" />
      </Head>
      
      <PageHeader
        title="대시보드"
        description="할 일과 노트의 요약 정보를 확인하세요."
      />
      
      {/* 통계 카드 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          {renderStatCard(
            '전체 할 일',
            todoStats.total,
            <AssignmentIcon sx={{ color: theme.palette.primary.main }} />,
            theme.palette.primary.main,
            navigateToTodos
          )}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {renderStatCard(
            '완료된 할 일',
            todoStats.completed,
            <CheckIcon sx={{ color: theme.palette.success.main }} />,
            theme.palette.success.main,
            navigateToTodos
          )}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {renderStatCard(
            '진행 중인 할 일',
            todoStats.pending,
            <UncheckedIcon sx={{ color: theme.palette.info.main }} />,
            theme.palette.info.main,
            navigateToTodos
          )}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {renderStatCard(
            '높은 우선순위',
            todoStats.highPriority,
            <FlagIcon sx={{ color: theme.palette.error.main }} />,
            theme.palette.error.main,
            navigateToTodos
          )}
        </Grid>
      </Grid>
      
      {/* 할 일 및 노트 목록 */}
      <Grid container spacing={3}>
        {/* 최근 할 일 */}
        <Grid item xs={12} md={6}>
          <Card elevation={1}>
            <CardHeader
              title="최근 할 일"
              action={
                <Button
                  endIcon={<ArrowForwardIcon />}
                  onClick={navigateToTodos}
                >
                  모두 보기
                </Button>
              }
            />
            <Divider />
            <CardContent sx={{ p: 0 }}>
              {renderTodoList()}
            </CardContent>
          </Card>
        </Grid>
        
        {/* 최근 노트 */}
        <Grid item xs={12} md={6}>
          <Card elevation={1}>
            <CardHeader
              title="최근 노트"
              action={
                <Button
                  endIcon={<ArrowForwardIcon />}
                  onClick={navigateToNotes}
                >
                  모두 보기
                </Button>
              }
            />
            <Divider />
            <CardContent sx={{ p: 0 }}>
              {renderNoteList()}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Layout>
  );
};

export default observer(Dashboard);
