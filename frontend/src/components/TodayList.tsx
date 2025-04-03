import React, { useState, useEffect, useCallback } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  CircularProgress, 
  Alert,
  Paper,
  Divider
} from '@mui/material';
import { format } from 'date-fns';
import TodoItem from './TodoItem';
import todoService, { Todo } from '@/services/todoService';

// TodoList에서 사용한 전역 todoStore 참조
interface TodoStore {
  todos: Todo[];
  initialized: boolean;
}

// 전역 스토어 접근 (window 객체에 저장된 것으로 간주)
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

const TodayList: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [todayTodos, setTodayTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [todayDate, setTodayDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));

  // 오늘 날짜 설정
  // 오늘 날짜 초기화 - 현재 시간대에 맞는 날짜 표시
  useEffect(() => {
    // 현재 로컴 시간 기준으로 날짜 계산
    const today = new Date();
    const formattedDate = format(today, 'yyyy-MM-dd');
    console.log('Setting today date:', formattedDate);
    setTodayDate(formattedDate);
  }, []);

  // 오늘 날짜와 할 일 데이터 로딩 함수
  // 문제를 해결하기 위해 의존성 배열에 router.pathname 추가
  useEffect(() => {
    async function loadTodosForToday() {
      try {
        setLoading(true);
        
        // 오늘 날짜 계산
        const today = new Date();
        const formattedDate = format(today, 'yyyy-MM-dd');
        setTodayDate(formattedDate);
        console.log('Today date:', formattedDate);
        
        // 전역 스토어에서 데이터 가져오기 또는 API 호출
        let todosData: Todo[] = [];
        const store = getTodoStore();
        
        // Today 페이지에서는 항상 서버에서 최신 데이터 가져오기
        console.log('Today page: Always fetching fresh todos from API');
        store.initialized = false; // 강제로 초기화 상태로 설정
        {
          console.log('Fetching todos from API...');
          try {
            const response = await todoService.getAllTodos();
            // API 응답 처리
            if (Array.isArray(response)) {
              todosData = response;
              console.log('API returned array with', todosData.length, 'todos');
            } else {
              console.error('API response is not an array:', response);
              // DRF pagination 응답 형식 처리
              const responseObj = response as any; // any로 타입 지정
              if (responseObj && typeof responseObj === 'object' && 'results' in responseObj && Array.isArray(responseObj.results)) {
                todosData = responseObj.results;
                console.log('Extracted todos from results field:', todosData.length);
              } else {
                // 기본 빈 배열 사용
                console.error('Unable to extract todos from API response');
              }
            }
          } catch (error) {
            console.error('Error in API response:', error);
          }
          
          // 글로벌 스토어 업데이트
          const storeRef = getTodoStore();
          storeRef.todos = todosData;
          storeRef.initialized = true;
          console.log('Global store updated with', todosData.length, 'todos');
        }
        
        // 데이터가 유효한지 한번 더 확인
        if (!Array.isArray(todosData)) {
          console.error('todosData is not an array:', todosData);
          todosData = [];
        }
        
        // 오늘 날짜의 할 일만 필터링
        console.log('Filtering todos for today:', formattedDate);
        console.log('Total todos available:', todosData.length);
        
        // 안전한 필터링을 위한 별도의 try-catch 블록
        let filtered: Todo[] = [];
        try {
          filtered = todosData.filter((todo: Todo) => {
          // null 체크 및 due_date 존재 여부 확인
          if (!todo || !todo.due_date) {
            console.log('Todo has no due date:', todo);
            return false;
          }
          
          try {
            // due_date에서 YYYY-MM-DD 부분만 추출
            const todoDueDate = todo.due_date.substring(0, 10);
            
            const isToday = todoDueDate === formattedDate;
            console.log(`Todo ${todo.id}: "${todo.task}" - Due: ${todoDueDate}, Is today's task: ${isToday}`);
            return isToday;
          } catch (error) {
            console.error('Error processing todo date:', error);
            return false;
          }
          });
        } catch (error) {
          console.error('Error during filtering todos:', error);
        }
        
        console.log(`Found ${filtered.length} todos for today`);
        setTodayTodos(filtered);
        setError(null);
      } catch (err) {
        console.error('Error loading todos for today:', err);
        setError('Failed to load today\'s tasks. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    
    loadTodosForToday();
  }, []);

  // Handle toggling a todo's completed status
  const handleToggleComplete = async (id: number, completed: boolean) => {
    // TodayTodos에서 해당 항목 찾기
    const todoToUpdate = todayTodos.find((todo: Todo) => todo.id === id);
    if (!todoToUpdate) {
      console.error('Todo not found in today\'s list:', id);
      return;
    }
    
    try {
      // API 호출로 상태 업데이트
      const updatedTodo = await todoService.updateTodo(id, {
        ...todoToUpdate,
        status: completed ? 'Completed' : 'Pending'
      });
      
      // 오늘의 할 일 목록 업데이트
      const updatedTodayTodos = todayTodos.map((todo: Todo) => 
        todo.id === id ? updatedTodo : todo
      );
      setTodayTodos(updatedTodayTodos);
      
      // 전역 스토어 업데이트 - 항상 업데이트하도록 수정
      const store = getTodoStore();
      // 전역 스토어가 초기화되지 않았다면 초기화
      if (!store.initialized || !Array.isArray(store.todos)) {
        store.todos = []; 
        store.initialized = true;
      }
      
      // 전역 스토어에서 해당 Todo 찾기
      const existsInStore = store.todos.some((todo: Todo) => todo.id === id);
      
      if (existsInStore) {
        // 존재하면 업데이트
        store.todos = store.todos.map((todo: Todo) =>
          todo.id === id ? updatedTodo : todo
        );
      } else {
        // 존재하지 않으면 API에서 모든 할 일 다시 가져오기
        console.log('Todo not found in global store, refreshing all todos');
        todoService.getAllTodos().then(response => {
          if (Array.isArray(response)) {
            store.todos = response;
          } else if (response && typeof response === 'object' && 'results' in response) {
            // response 타입 명시적 지정
            const paginatedResponse = response as { results: Todo[] };
            store.todos = paginatedResponse.results;
          }
          store.initialized = true;
        }).catch(error => {
          console.error('Failed to refresh todos:', error);
        });
      }
      console.log('Updated global todoStore with completed status change');
    } catch (err) {
      console.error('Error updating todo status:', err);
      setError('Failed to update todo status. Please try again.');
    }
  };

  // 오늘 날짜를 보기 좋게 포맷팅
  const formattedDate = () => {
    const today = new Date(todayDate);
    return format(today, 'yyyy년 MM월 dd일 eeee');
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Today's Tasks
        </Typography>
        
        <Paper sx={{ p: 3, mb: 3, textAlign: 'center' }}>
          <Typography variant="h5" color="primary">
            {formattedDate()}
          </Typography>
        </Paper>
        
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Below are your tasks due today. Focus on completing these priority items to stay on track.
          </Typography>
          <Divider />
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" color="primary" fontWeight="bold">
              Due Today: {todayTodos.length} {todayTodos.length === 1 ? 'task' : 'tasks'}
            </Typography>
          </Box>
        </Paper>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : todayTodos.length > 0 ? (
        <Box>
          {todayTodos.map((todo: Todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onEdit={() => {}} // Today 페이지에서는 편집 기능 생략
              onDelete={() => {}} // Today 페이지에서는 삭제 기능 생략
              onToggleComplete={handleToggleComplete}
              hideEditDelete={true} // 수정/삭제 버튼 숨기기
            />
          ))}
        </Box>
      ) : (
        <Box sx={{ textAlign: 'center', my: 4 }}>
          <Typography color="text.secondary">
            No tasks due today. Enjoy your day!
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default TodayList;
