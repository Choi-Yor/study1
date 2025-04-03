import React, { useState, useEffect } from 'react';
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
  Paper
} from '@mui/material';
import { Add as AddIcon, Search as SearchIcon } from '@mui/icons-material';
import TodoItem from './TodoItem';
import TodoForm from './TodoForm';
import ConfirmDialog from '@/components/ConfirmDialog';
import todoService, { Todo, TodoInput } from '@/services/todoService';

// 전역 변수로 데이터 저장소 생성
const todoStore = {
  todos: [] as Todo[],
  initialized: false
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
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; todoId: number | null }>({
    open: false,
    todoId: null
  });

  // Fetch todos from API
  const fetchTodos = async () => {
    if (todoStore.initialized && todoStore.todos.length > 0) {
      setTodos(todoStore.todos);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await todoService.getAllTodos();
      setTodos(data);
      todoStore.todos = data;
      todoStore.initialized = true;
      setError(null);
    } catch (err) {
      console.error('Error fetching todos:', err);
      setError('Failed to load todos. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  // Filter todos based on search term and selected tab
  useEffect(() => {    
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
    
    setFilteredTodos(filtered);
  }, [todos, searchTerm, tab]);

  // Handle creating a new todo
  const handleAddTodo = async (todoData: TodoInput) => {
    try {
      const newTodo = await todoService.createTodo(todoData);
      const updatedTodos = [...todos, newTodo];
      setTodos(updatedTodos);
      todoStore.todos = updatedTodos;
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
      const updatedTodos = todos.map(todo => 
        todo.id === editTodo.id ? updatedTodo : todo
      );
      
      setTodos(updatedTodos);
      todoStore.todos = updatedTodos;
    } catch (err) {
      console.error('Error updating todo:', err);
      setError('Failed to update todo. Please try again.');
    }
  };

  // Handle deleting a todo
  const handleDeleteTodo = async (id: number) => {
    try {
      await todoService.deleteTodo(id);
      const updatedTodos = todos.filter(todo => todo.id !== id);
      
      setTodos(updatedTodos);
      todoStore.todos = updatedTodos;
    } catch (err) {
      console.error('Error deleting todo:', err);
      setError('Failed to delete todo. Please try again.');
    }
  };

  // Handle toggling a todo's completed status
  const handleToggleComplete = async (id: number, completed: boolean) => {
    const todoToUpdate = todos.find(todo => todo.id === id);
    if (!todoToUpdate) return;
    
    try {
      const updatedTodo = await todoService.updateTodo(id, {
        ...todoToUpdate,
        status: completed ? 'Completed' : 'Pending'
      });
      
      const updatedTodos = Array.isArray(todos)
        ? todos.map(todo => todo.id === id ? updatedTodo : todo)
        : [updatedTodo];
      
      setTodos(updatedTodos);
      // 전역 저장소 업데이트
      todoStore.todos = updatedTodos;
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
        
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
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
