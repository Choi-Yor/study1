import React, { useState, useEffect, useCallback } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Button, 
  CircularProgress, 
  Alert,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Paper,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  IconButton,
  Tooltip
} from '@mui/material';
import { Add as AddIcon, Search as SearchIcon, CalendarToday, Clear as ClearIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import TodoItem from './TodoItem';
import TodoForm from './TodoForm';
import ConfirmDialog from '@/components/ConfirmDialog';
import todoService, { Todo, TodoInput } from '@/services/todoService';

// TodoList에서도 TodayList와 동일한 전역 스토어 사용하도록 수정
interface TodoStore {
  todos: Todo[];
  initialized: boolean;
}

// 전역 스토어 접근 함수 (TodayList와 동일한 방식)
const getTodoStore = (): TodoStore => {
  // window 객체에 todoStore가 없다면 생성
  if (typeof window !== 'undefined' && !(window as any).todoStore) {
    (window as any).todoStore = {
      todos: [],
      initialized: false
    };
  }
  return typeof window !== 'undefined' ? (window as any).todoStore : { todos: [], initialized: false };
};

const TodoList: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filteredTodos, setFilteredTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [editTodo, setEditTodo] = useState<Todo | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [tab, setTab] = useState(0);
  const [dateFilter, setDateFilter] = useState<Date | null>(null);
  // 정렬 기능을 마감일 늦은순으로 고정하고 UI 숲김
  const sortOrder = 'due-latest' as const;

  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; todoId: number | null }>({
    open: false,
    todoId: null
  });

  // 데이터 로딩 함수 - window.todoStore 사용하도록 개선
  const fetchTodos = useCallback(async () => {
    // 전역 스토어 참조
    const store = getTodoStore();
    
    // 캐시된 데이터 사용
    if (store.initialized && Array.isArray(store.todos) && store.todos.length > 0) {
      console.log('Using cached todos from global store:', store.todos.length);
      setTodos(store.todos);
      // 항상 초기에 로딩 상태 해제
      setLoading(false);
      return;
    }

    try {
      // 로딩 시작 - 지연 없이 바로 설정
      setLoading(true);
      
      console.log('Fetching todos from API...');
      const response = await todoService.getAllTodos();
      
      // API 응답 처리
      let data: Todo[] = [];
      if (Array.isArray(response)) {
        data = response;
        console.log('API returned array with', data.length, 'todos');
      } else {
        console.error('API response is not an array:', response);
        // DRF pagination 응답 형식 처리
        const responseObj = response as any; // any로 타입 지정
        if (responseObj && typeof responseObj === 'object' && 'results' in responseObj && Array.isArray(responseObj.results)) {
          data = responseObj.results;
          console.log('Extracted todos from results field:', data.length);
        } else {
          // 기본 빈 배열 사용
          console.error('Unable to extract todos from API response');
          data = [];
        }
      }
      console.log('Processed todos data:', data.length);
      
      // 데이터 설정 및 저장 (window.todoStore 사용)
      setTodos(data);
      const store = getTodoStore();
      store.todos = data;
      store.initialized = true;
      setError(null);
    } catch (err) {
      console.error('Error fetching todos:', err);
      setError('Failed to load todos. Please try again later.');
    } finally {
      // 항상 로딩 상태 해제하도록 finally 블록 사용
      setLoading(false);
    }
  }, []);
  
  // 컴포넌트 마운트 시 실행
  useEffect(() => {
    // 즉시 렌더링 시 로딩 상태 false로 초기화
    setLoading(false);
    
    // 데이터 로드
    fetchTodos();
  }, [fetchTodos]);

  // 위에서 이미 useEffect를 통합했으므로 이 useEffect는 제거

  // Filter todos based on search term, selected tab, and date filter
  useEffect(() => {    
    // 방어적 코드 추가: todos가 배열인지 확인
    if (!Array.isArray(todos)) {
      console.log('Todos is not an array:', todos);
      setFilteredTodos([]);
      return;
    }
    
    let filtered = [...todos];
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(todo => 
        todo.task.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by tab
    if (tab === 1) {
      filtered = filtered.filter(todo => todo.status !== 'Completed');
    } else if (tab === 2) {
      filtered = filtered.filter(todo => todo.status === 'Completed');
    }
    
    // Filter by date
    if (dateFilter) {
      filtered = filtered.filter(todo => {
        if (!todo.due_date) return false;
        
        // 타임존 차이 문제 해결을 위한 날짜 문자열 처리
        const todoDate = new Date(todo.due_date);
        
        // 날짜만 비교하기 위해 시간 정보 제거
        const todoDateString = `${todoDate.getFullYear()}-${String(todoDate.getMonth() + 1).padStart(2, '0')}-${String(todoDate.getDate()).padStart(2, '0')}`;
        const filterDateString = `${dateFilter.getFullYear()}-${String(dateFilter.getMonth() + 1).padStart(2, '0')}-${String(dateFilter.getDate()).padStart(2, '0')}`;
        
        return todoDateString === filterDateString;
      });
    }
    
    // 정렬 로직 적용
    filtered.sort((a, b) => {
      // 마감일(due date) 기준 정렬
      if (sortOrder === 'due-latest' || sortOrder === 'due-oldest') {
        // null 마감일 처리 - null은 정렬에서 가장 뒤로 나오도록 처리
        if (!a.due_date && !b.due_date) {
          // 두 항목 모두 null이면 한글/알파벳 순 정렬
          return a.task.localeCompare(b.task, 'ko');
        } else if (!a.due_date) {
          return 1; // a의 마감일이 null이면 b가 앞으로
        } else if (!b.due_date) {
          return -1; // b의 마감일이 null이면 a가 앞으로
        }
        
        const dateA = new Date(a.due_date).getTime();
        const dateB = new Date(b.due_date).getTime();
        
        // 마감일이 다르면 마감일 기준으로 정렬
        if (dateA !== dateB) {
          // due-latest: 마감일이 늦은 항목이 상단에 표시
          // due-oldest: 마감일이 빨른 항목이 상단에 표시
          return sortOrder === 'due-latest' ? dateB - dateA : dateA - dateB;
        }
      }
      
      // 마감일이 같거나 이름순 정렬인 경우 한글/알파벳 순 정렬
      return a.task.localeCompare(b.task, 'ko');
    });
    
    setFilteredTodos(filtered);
  }, [todos, searchTerm, tab, dateFilter]);

  // Handle creating a new todo
  const handleAddTodo = async (todoData: TodoInput) => {
    try {
      const newTodo = await todoService.createTodo(todoData);
      
      // 방어적 코드 추가
      const currentTodos = Array.isArray(todos) ? todos : [];
      const updatedTodos = [...currentTodos, newTodo];
      
      setTodos(updatedTodos);
      // 전역 스토어 업데이트
      const store = getTodoStore();
      store.todos = updatedTodos;
    } catch (err) {
      console.error('Error adding todo:', err);
      setError('Failed to add todo. Please try again.');
    }
  };

  // Handle updating an existing todo
  const handleUpdateTodo = async (todoData: TodoInput) => {
    if (!editTodo) return;
    
    try {
      const updatedTodo = await todoService.updateTodo(editTodo.id, todoData);
      
      // 방어적 코드 추가
      if (!Array.isArray(todos)) {
        console.error('Todos is not an array in handleUpdateTodo');
        setError('An error occurred. Please try again.');
        return;
      }
      
      const updatedTodos = todos.map(todo => 
        todo.id === editTodo.id ? updatedTodo : todo
      );
      
      setTodos(updatedTodos);
      // 전역 스토어 업데이트
      const store = getTodoStore();
      store.todos = updatedTodos;
    } catch (err) {
      console.error('Error updating todo:', err);
      setError('Failed to update todo. Please try again.');
    }
  };

  // Handle deleting a todo
  const handleDeleteTodo = async (id: number) => {
    try {
      await todoService.deleteTodo(id);
      
      // 방어적 코드 추가
      if (!Array.isArray(todos)) {
        console.error('Todos is not an array in handleDeleteTodo');
        setError('An error occurred. Please try again.');
        return;
      }
      
      const updatedTodos = todos.filter(todo => todo.id !== id);
      
      setTodos(updatedTodos);
      // 전역 스토어 업데이트
      const store = getTodoStore();
      store.todos = updatedTodos;
    } catch (err) {
      console.error('Error deleting todo:', err);
      setError('Failed to delete todo. Please try again.');
    }
  };

  // Handle toggling a todo's completed status
  const handleToggleComplete = async (id: number, completed: boolean) => {
    // 방어적 코드 추가 - 상위에서 배열 체크
    if (!Array.isArray(todos)) {
      console.error('Todos is not an array in handleToggleComplete');
      setError('An error occurred. Please try again.');
      return;
    }
    
    const todoToUpdate = todos.find(todo => todo.id === id);
    if (!todoToUpdate) return;
    
    try {
      const updatedTodo = await todoService.updateTodo(id, {
        ...todoToUpdate,
        status: completed ? 'Completed' : 'Pending'
      });
      
      // 이미 위에서 체크했으니 배열임을 보장할 수 있음
      const updatedTodos = todos.map(todo => 
        todo.id === id ? updatedTodo : todo
      );
      
      setTodos(updatedTodos);
      // 전역 스토어 업데이트
      const store = getTodoStore();
      store.todos = updatedTodos;
    } catch (err) {
      console.error('Error updating todo status:', err);
      setError('Failed to update todo status. Please try again.');
    }
  };

  // Open form for editing
  const handleEditTodo = (todo: Todo) => {
    setEditTodo(todo);
    setOpenForm(true);
  };

  // Submit form handler
  const handleSubmitForm = (todoData: TodoInput) => {
    if (editTodo) {
      handleUpdateTodo(todoData);
    } else {
      handleAddTodo(todoData);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Todo List
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
          {/* 검색 및 추가 버튼 */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              placeholder="Search todos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              fullWidth
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => {
                setEditTodo(undefined);
                setOpenForm(true);
              }}
            >
              Add
            </Button>
          </Box>
          
          {/* 정렬 옵션 UI 숲김 처리 */}
          
          {/* 날짜 필터 */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Filter by date"
                value={dateFilter}
                onChange={(newDate) => setDateFilter(newDate)}
                slotProps={{
                  textField: { 
                    size: 'small',
                    fullWidth: true
                  }
                }}
              />
            </LocalizationProvider>
            {dateFilter && (
              <Tooltip title="Clear date filter">
                <IconButton
                  onClick={() => setDateFilter(null)}
                  color="default"
                  size="small"
                >
                  <ClearIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>
        
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={tab}
            onChange={(_, newValue) => setTab(newValue)}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab label="All" />
            <Tab label="Active" />
            <Tab label="Completed" />
          </Tabs>
        </Paper>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      
      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : filteredTodos.length > 0 ? (
        <Box>
          {filteredTodos.map(todo => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onEdit={handleEditTodo}
              onDelete={(id) => setConfirmDelete({ open: true, todoId: id })}
              onToggleComplete={handleToggleComplete}
            />
          ))}
        </Box>
      ) : (
        <Typography align="center" color="textSecondary">
          {searchTerm 
            ? 'No todos match your search'
            : tab === 0 
              ? 'No todos yet. Add one to get started!' 
              : tab === 1 
                ? 'No active todos' 
                : 'No completed todos'}
        </Typography>
      )}

      {/* Todo Form Dialog */}
      <TodoForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSubmit={handleSubmitForm}
        initialData={editTodo}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={confirmDelete.open}
        title="Delete Todo"
        content="Are you sure you want to delete this todo?"
        onClose={() => setConfirmDelete({ open: false, todoId: null })}
        onConfirm={() => {
          if (confirmDelete.todoId !== null) {
            handleDeleteTodo(confirmDelete.todoId);
          }
          setConfirmDelete({ open: false, todoId: null });
        }}
      />
    </Container>
  );
};

export default TodoList;
