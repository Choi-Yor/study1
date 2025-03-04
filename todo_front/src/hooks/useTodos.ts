import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import todoService from '../services/todoService';
import { Todo, TodoFilterOptions } from '../types/api';
import { showErrorToast } from '../utils/errorUtils';

// Todo 목록 조회 훅
export const useTodos = (filterOptions?: Partial<TodoFilterOptions>) => {
  return useQuery({
    queryKey: ['todos', filterOptions],
    queryFn: () => todoService.getTodos(filterOptions),
    keepPreviousData: true,
    staleTime: 60000, // 1분
  });
};

// 단일 Todo 조회 훅
export const useTodo = (id: number | null) => {
  return useQuery({
    queryKey: ['todo', id],
    queryFn: () => todoService.getTodoById(id as number),
    enabled: !!id, // id가 있을 때만 실행
    staleTime: 60000, // 1분
  });
};

// Todo 생성 훅
export const useCreateTodo = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (todoData: Partial<Todo>) => todoService.createTodo(todoData),
    onSuccess: () => {
      // 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
    onError: (error) => {
      showErrorToast(error);
    },
  });
};

// Todo 수정 훅
export const useUpdateTodo = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, todoData }: { id: number; todoData: Partial<Todo> }) => 
      todoService.updateTodo(id, todoData),
    onSuccess: (updatedTodo) => {
      // 캐시 업데이트
      queryClient.setQueryData(['todo', updatedTodo.id], updatedTodo);
      
      // 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
    onError: (error) => {
      showErrorToast(error);
    },
  });
};

// Todo 상태 토글 훅
export const useToggleTodoStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => todoService.toggleTodoStatus(id),
    onSuccess: (updatedTodo) => {
      // 캐시 업데이트
      queryClient.setQueryData(['todo', updatedTodo.id], updatedTodo);
      
      // 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
    onError: (error) => {
      showErrorToast(error);
    },
  });
};

// Todo 삭제 훅
export const useDeleteTodo = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => todoService.deleteTodo(id),
    onSuccess: (_, id) => {
      // 캐시에서 제거
      queryClient.removeQueries({ queryKey: ['todo', id] });
      
      // 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
    onError: (error) => {
      showErrorToast(error);
    },
  });
};
