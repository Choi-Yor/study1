import { makeAutoObservable, runInAction } from 'mobx';
import { v4 as uuidv4 } from 'uuid';
import { RootStore } from './RootStore';
import todoService from '../services/todoService';
import { Todo, TodoFilterOptions, PaginatedResponse } from '../types/api';
import { extractPaginationInfo, PaginationInfo } from '../utils/paginationUtils';
import { createTodoFilterOptions } from '../utils/filterUtils';
import { showErrorToast } from '../utils/errorUtils';

export class TodoStore {
  // 데이터 상태
  todos: Todo[] = [];
  selectedTodo: Todo | null = null;
  
  // 로딩 상태
  isLoading: boolean = false;
  isSubmitting: boolean = false;
  
  // 필터링 상태
  filterOptions: Partial<TodoFilterOptions> = {};
  
  // 페이지네이션 상태
  pagination: PaginationInfo = {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNextPage: false,
    hasPrevPage: false,
    pageSize: 10,
  };
  
  // 루트 스토어 참조
  rootStore: RootStore;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this, { rootStore: false });
  }
  
  // Todo 목록 조회
  fetchTodos = async (options?: Partial<TodoFilterOptions>): Promise<void> => {
    try {
      this.isLoading = true;
      
      // 필터 옵션 설정
      if (options) {
        this.filterOptions = { ...this.filterOptions, ...options };
      }
      
      // API 요청
      const filterParams = createTodoFilterOptions(this.filterOptions);
      const response = await todoService.getTodos(filterParams);
      
      runInAction(() => {
        this.todos = response.results;
        this.pagination = extractPaginationInfo(response);
        this.isLoading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.isLoading = false;
      });
      showErrorToast(error);
    }
  };
  
  // 단일 Todo 조회
  fetchTodoById = async (id: number): Promise<void> => {
    try {
      this.isLoading = true;
      
      const todo = await todoService.getTodoById(id);
      
      runInAction(() => {
        this.selectedTodo = todo;
        this.isLoading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.isLoading = false;
      });
      showErrorToast(error);
    }
  };
  
  // Todo 생성
  createTodo = async (todoData: Partial<Todo>): Promise<Todo | null> => {
    try {
      this.isSubmitting = true;
      
      const createdTodo = await todoService.createTodo(todoData);
      
      runInAction(() => {
        // 현재 페이지에 추가 (필요시)
        if (this.todos.length < this.pagination.pageSize) {
          this.todos.unshift(createdTodo);
        }
        
        // 페이지네이션 정보 업데이트
        this.pagination.totalItems += 1;
        this.pagination.totalPages = Math.ceil(
          this.pagination.totalItems / this.pagination.pageSize
        );
        
        this.isSubmitting = false;
      });
      
      // 성공 알림
      this.rootStore.uiStore.addNotification({
        id: uuidv4(),
        message: '할 일이 성공적으로 생성되었습니다.',
        type: 'success',
        autoRemove: true,
        timestamp: Date.now(),
      });
      
      return createdTodo;
    } catch (error) {
      runInAction(() => {
        this.isSubmitting = false;
      });
      showErrorToast(error);
      return null;
    }
  };
  
  // Todo 수정
  updateTodo = async (id: number, todoData: Partial<Todo>): Promise<Todo | null> => {
    try {
      this.isSubmitting = true;
      
      const updatedTodo = await todoService.updateTodo(id, todoData);
      
      runInAction(() => {
        // 목록에서 업데이트
        this.todos = this.todos.map(todo => 
          todo.id === id ? updatedTodo : todo
        );
        
        // 선택된 Todo 업데이트
        if (this.selectedTodo?.id === id) {
          this.selectedTodo = updatedTodo;
        }
        
        this.isSubmitting = false;
      });
      
      // 성공 알림
      this.rootStore.uiStore.addNotification({
        id: uuidv4(),
        message: '할 일이 성공적으로 수정되었습니다.',
        type: 'success',
        autoRemove: true,
        timestamp: Date.now(),
      });
      
      return updatedTodo;
    } catch (error) {
      runInAction(() => {
        this.isSubmitting = false;
      });
      showErrorToast(error);
      return null;
    }
  };
  
  // Todo 상태 토글
  toggleTodoStatus = async (id: number): Promise<Todo | null> => {
    try {
      const todo = this.todos.find(t => t.id === id);
      if (!todo) return null;
      
      const updatedTodo = await todoService.toggleTodoStatus(id);
      
      runInAction(() => {
        // 목록에서 업데이트
        this.todos = this.todos.map(todo => 
          todo.id === id ? updatedTodo : todo
        );
        
        // 선택된 Todo 업데이트
        if (this.selectedTodo?.id === id) {
          this.selectedTodo = updatedTodo;
        }
      });
      
      return updatedTodo;
    } catch (error) {
      showErrorToast(error);
      return null;
    }
  };
  
  // Todo 삭제
  deleteTodo = async (id: number): Promise<boolean> => {
    try {
      await todoService.deleteTodo(id);
      
      runInAction(() => {
        // 목록에서 제거
        this.todos = this.todos.filter(todo => todo.id !== id);
        
        // 선택된 Todo 초기화
        if (this.selectedTodo?.id === id) {
          this.selectedTodo = null;
        }
        
        // 페이지네이션 정보 업데이트
        this.pagination.totalItems -= 1;
        this.pagination.totalPages = Math.ceil(
          this.pagination.totalItems / this.pagination.pageSize
        );
      });
      
      // 성공 알림
      this.rootStore.uiStore.addNotification({
        id: uuidv4(),
        message: '할 일이 성공적으로 삭제되었습니다.',
        type: 'success',
        autoRemove: true,
        timestamp: Date.now(),
      });
      
      return true;
    } catch (error) {
      showErrorToast(error);
      return false;
    }
  };
  
  // 필터 옵션 설정
  setFilterOptions = (options: Partial<TodoFilterOptions>): void => {
    this.filterOptions = { ...this.filterOptions, ...options };
  };
  
  // 필터 초기화
  resetFilters = (): void => {
    this.filterOptions = {};
  };
  
  // 페이지 변경
  setPage = (page: number): void => {
    this.filterOptions.page = page;
    this.fetchTodos();
  };
  
  // 선택된 Todo 설정
  selectTodo = (todo: Todo | null): void => {
    this.selectedTodo = todo;
  };
  
  // 선택된 Todo 초기화
  clearSelectedTodo = (): void => {
    this.selectedTodo = null;
  };
}
