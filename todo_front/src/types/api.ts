// API 응답 타입 정의

// 페이지네이션 응답 타입
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// 노트 타입
export interface Note {
  id: number;
  content: string;
  created_at: string;
}

export interface NoteRequest {
  content: string;
}

// 할 일(Todo) 타입
export interface Todo {
  id: number;
  task: string;
  due_date: string; // YYYY-MM-DD 형식
  priority: 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'Completed';
  created_at: string;
}

export interface TodoRequest {
  task: string;
  due_date: string; // YYYY-MM-DD 형식
  priority?: 'High' | 'Medium' | 'Low';
  status?: 'Pending' | 'Completed';
}

// 필터링 및 정렬 옵션 타입
export interface TodoFilterOptions {
  priority?: 'High' | 'Medium' | 'Low';
  status?: 'Pending' | 'Completed';
  search?: string;
  ordering?: 'due_date' | 'priority' | 'created_at';
  page?: number;
}

export interface NoteFilterOptions {
  search?: string;
  ordering?: 'created_at';
  page?: number;
}

// API 응답 타입
export type NotesResponse = PaginatedResponse<Note>;
export type TodosResponse = PaginatedResponse<Todo>;
