import { TodoFilterOptions, NoteFilterOptions } from '../types/api';

// 빈 값 제거 (undefined, null, 빈 문자열)
export const removeEmptyValues = <T extends Record<string, any>>(obj: T): Partial<T> => {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      acc[key as keyof T] = value;
    }
    return acc;
  }, {} as Partial<T>);
};

// Todo 필터 옵션 생성
export const createTodoFilterOptions = (
  options: Partial<TodoFilterOptions> = {}
): Partial<TodoFilterOptions> => {
  return removeEmptyValues({
    priority: options.priority,
    status: options.status,
    search: options.search,
    ordering: options.ordering,
    page: options.page,
  });
};

// Note 필터 옵션 생성
export const createNoteFilterOptions = (
  options: Partial<NoteFilterOptions> = {}
): Partial<NoteFilterOptions> => {
  return removeEmptyValues({
    search: options.search,
    ordering: options.ordering,
    page: options.page,
  });
};

// URL 쿼리 파라미터를 객체로 변환
export const parseQueryParams = (query: Record<string, string | string[] | undefined>): Record<string, string> => {
  return Object.entries(query).reduce((acc, [key, value]) => {
    if (value !== undefined) {
      acc[key] = Array.isArray(value) ? value[0] : value;
    }
    return acc;
  }, {} as Record<string, string>);
};

// Todo 정렬 옵션 레이블
export const todoOrderingOptions = [
  { value: 'due_date', label: '마감일순' },
  { value: '-due_date', label: '마감일 역순' },
  { value: 'priority', label: '우선순위순' },
  { value: '-priority', label: '우선순위 역순' },
  { value: 'created_at', label: '생성일순' },
  { value: '-created_at', label: '생성일 역순' },
];

// Todo 우선순위 옵션
export const todoPriorityOptions = [
  { value: 'High', label: '높음' },
  { value: 'Medium', label: '중간' },
  { value: 'Low', label: '낮음' },
];

// Todo 상태 옵션
export const todoStatusOptions = [
  { value: 'Pending', label: '진행 중' },
  { value: 'Completed', label: '완료' },
];

// 우선순위에 따른 색상 반환
export const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'High':
      return '#f44336'; // red
    case 'Medium':
      return '#ff9800'; // orange
    case 'Low':
      return '#4caf50'; // green
    default:
      return '#757575'; // grey
  }
};

// 상태에 따른 색상 반환
export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'Completed':
      return '#4caf50'; // green
    case 'Pending':
      return '#2196f3'; // blue
    default:
      return '#757575'; // grey
  }
};
