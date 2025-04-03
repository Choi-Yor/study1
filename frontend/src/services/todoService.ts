import axios from 'axios';

// 로컬 개발 환경에서는 로컬 API 서버 사용
const API_URL = 'http://localhost:8000/api';

// 프로덕션 환경에서는 아래 URL을 사용 (서버 배포 시 주석 해제)
// const API_URL = 'https://your-api-server-url.com/api';

export interface Todo {
  id: number;
  task: string;
  due_date: string | null;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'Completed';
  created_at: string;
}

export interface TodoInput {
  task: string;
  due_date?: string | null;
  priority?: 'High' | 'Medium' | 'Low';
  status?: 'Pending' | 'Completed';
}

const todoService = {
  getAllTodos: async (): Promise<Todo[]> => {
    const response = await axios.get(`${API_URL}/todos/`);
    return response.data;
  },

  getTodoById: async (id: number): Promise<Todo> => {
    const response = await axios.get(`${API_URL}/todos/${id}/`);
    return response.data;
  },

  createTodo: async (todo: TodoInput): Promise<Todo> => {
    const response = await axios.post(`${API_URL}/todos/`, todo);
    return response.data;
  },

  updateTodo: async (id: number, todo: TodoInput): Promise<Todo> => {
    const response = await axios.put(`${API_URL}/todos/${id}/`, todo);
    return response.data;
  },

  deleteTodo: async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/todos/${id}/`);
  },
};

export default todoService;
