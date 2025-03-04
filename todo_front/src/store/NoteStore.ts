import { makeAutoObservable, runInAction } from 'mobx';
import { v4 as uuidv4 } from 'uuid';
import { RootStore } from './RootStore';
import noteService from '../services/noteService';
import { Note, NoteFilterOptions } from '../types/api';
import { extractPaginationInfo, PaginationInfo } from '../utils/paginationUtils';
import { createNoteFilterOptions } from '../utils/filterUtils';
import { showErrorToast } from '../utils/errorUtils';

export class NoteStore {
  // 데이터 상태
  notes: Note[] = [];
  selectedNote: Note | null = null;
  
  // 로딩 상태
  isLoading: boolean = false;
  isSubmitting: boolean = false;
  
  // 필터링 상태
  filterOptions: Partial<NoteFilterOptions> = {};
  
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
  
  // 노트 목록 조회
  fetchNotes = async (options?: Partial<NoteFilterOptions>): Promise<void> => {
    try {
      this.isLoading = true;
      
      // 필터 옵션 설정
      if (options) {
        this.filterOptions = { ...this.filterOptions, ...options };
      }
      
      // API 요청
      const filterParams = createNoteFilterOptions(this.filterOptions);
      const response = await noteService.getNotes(filterParams);
      
      runInAction(() => {
        this.notes = response.results;
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
  
  // 단일 노트 조회
  fetchNoteById = async (id: number): Promise<void> => {
    try {
      this.isLoading = true;
      
      const note = await noteService.getNoteById(id);
      
      runInAction(() => {
        this.selectedNote = note;
        this.isLoading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.isLoading = false;
      });
      showErrorToast(error);
    }
  };
  
  // 노트 생성
  createNote = async (noteData: Partial<Note>): Promise<Note | null> => {
    try {
      this.isSubmitting = true;
      
      const createdNote = await noteService.createNote(noteData);
      
      runInAction(() => {
        // 현재 페이지에 추가 (필요시)
        if (this.notes.length < this.pagination.pageSize) {
          this.notes.unshift(createdNote);
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
        message: '노트가 성공적으로 생성되었습니다.',
        type: 'success',
        autoRemove: true,
        timestamp: Date.now(),
      });
      
      return createdNote;
    } catch (error) {
      runInAction(() => {
        this.isSubmitting = false;
      });
      showErrorToast(error);
      return null;
    }
  };
  
  // 노트 수정
  updateNote = async (id: number, noteData: Partial<Note>): Promise<Note | null> => {
    try {
      this.isSubmitting = true;
      
      const updatedNote = await noteService.updateNote(id, noteData);
      
      runInAction(() => {
        // 목록에서 업데이트
        this.notes = this.notes.map(note => 
          note.id === id ? updatedNote : note
        );
        
        // 선택된 노트 업데이트
        if (this.selectedNote?.id === id) {
          this.selectedNote = updatedNote;
        }
        
        this.isSubmitting = false;
      });
      
      // 성공 알림
      this.rootStore.uiStore.addNotification({
        id: uuidv4(),
        message: '노트가 성공적으로 수정되었습니다.',
        type: 'success',
        autoRemove: true,
        timestamp: Date.now(),
      });
      
      return updatedNote;
    } catch (error) {
      runInAction(() => {
        this.isSubmitting = false;
      });
      showErrorToast(error);
      return null;
    }
  };
  
  // 노트 삭제
  deleteNote = async (id: number): Promise<boolean> => {
    try {
      await noteService.deleteNote(id);
      
      runInAction(() => {
        // 목록에서 제거
        this.notes = this.notes.filter(note => note.id !== id);
        
        // 선택된 노트 초기화
        if (this.selectedNote?.id === id) {
          this.selectedNote = null;
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
        message: '노트가 성공적으로 삭제되었습니다.',
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
  setFilterOptions = (options: Partial<NoteFilterOptions>): void => {
    this.filterOptions = { ...this.filterOptions, ...options };
  };
  
  // 필터 초기화
  resetFilters = (): void => {
    this.filterOptions = {};
  };
  
  // 페이지 변경
  setPage = (page: number): void => {
    this.filterOptions.page = page;
    this.fetchNotes();
  };
  
  // 선택된 노트 설정
  selectNote = (note: Note | null): void => {
    this.selectedNote = note;
  };
  
  // 선택된 노트 초기화
  clearSelectedNote = (): void => {
    this.selectedNote = null;
  };
}
