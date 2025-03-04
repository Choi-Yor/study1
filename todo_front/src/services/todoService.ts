import apiClient from './api';
import { Todo, TodoFilterOptions, TodoRequest, TodosResponse } from '../types/api';

const TODOS_ENDPOINT = '/api/todos/';

// 할 일 목록 조회 (GET /api/todos/)
export const getTodos = async (options?: TodoFilterOptions): Promise<TodosResponse> => {
  const { data } = await apiClient.get<TodosResponse>(TODOS_ENDPOINT, { params: options });
  return data;
};

// 할 일 상세 조회 (GET /api/todos/{id}/)
export const getTodoById = async (id: number): Promise<Todo> => {
  const { data } = await apiClient.get<Todo>(`${TODOS_ENDPOINT}${id}/`);
  return data;
};

// 할 일 생성 (POST /api/todos/)
export const createTodo = async (todoData: TodoRequest): Promise<Todo> => {
  const { data } = await apiClient.post<Todo>(TODOS_ENDPOINT, todoData);
  return data;
};

// 할 일 수정 (PUT /api/todos/{id}/)
export const updateTodo = async (id: number, todoData: TodoRequest): Promise<Todo> => {
  const { data } = await apiClient.put<Todo>(`${TODOS_ENDPOINT}${id}/`, todoData);
  return data;
};

// 할 일 부분 수정 (PATCH /api/todos/{id}/)
export const patchTodo = async (id: number, todoData: Partial<TodoRequest>): Promise<Todo> => {
  const { data } = await apiClient.patch<Todo>(`${TODOS_ENDPOINT}${id}/`, todoData);
  return data;
};

// 할 일 삭제 (DELETE /api/todos/{id}/)
export const deleteTodo = async (id: number): Promise<void> => {
  await apiClient.delete(`${TODOS_ENDPOINT}${id}/`);
};

// 할 일 상태 토글 (PATCH /api/todos/{id}/)
export const toggleTodoStatus = async (id: number, completed: boolean): Promise<Todo> => {
  const status = completed ? 'Completed' : 'Pending';
  return patchTodo(id, { status });
};

const todoService = {
  getTodos,
  getTodoById,
  createTodo,
  updateTodo,
  patchTodo,
  deleteTodo,
  toggleTodoStatus,
};

export default todoService;
