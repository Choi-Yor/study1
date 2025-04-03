// 노트 데이터를 위한 전역 스토어 모듈
import { Note } from './noteService';

// 노트 스토어 인터페이스 정의
export interface NoteStore {
  notes: Note[];
  initialized: boolean;
}

// 전역 상태를 관리할 싱글톤 인스턴스 생성
class NoteStoreManager {
  private static instance: NoteStoreManager;
  private _store: NoteStore = {
    notes: [],
    initialized: false
  };

  private constructor() {
    // 브라우저 환경에서만 로컬 스토리지 접근
    if (typeof window !== 'undefined') {
      this.loadFromLocalStorage();
    }
  }

  // 싱글톤 인스턴스 접근자
  public static getInstance(): NoteStoreManager {
    if (!NoteStoreManager.instance) {
      NoteStoreManager.instance = new NoteStoreManager();
    }
    return NoteStoreManager.instance;
  }

  // 스토어 데이터 가져오기
  public getStore(): NoteStore {
    return this._store;
  }

  // 노트 목록 설정
  public setNotes(notes: Note[]): void {
    if (Array.isArray(notes)) {
      this._store.notes = notes;
      this._store.initialized = true;
      this.saveToLocalStorage();
    }
  }

  // 노트 추가
  public addNote(note: Note): void {
    if (note && note.id) {
      this._store.notes = [...this._store.notes, note];
      this._store.initialized = true;
      this.saveToLocalStorage();
    }
  }

  // 노트 업데이트
  public updateNote(updatedNote: Note): void {
    if (updatedNote && updatedNote.id) {
      this._store.notes = this._store.notes.map(note => 
        note.id === updatedNote.id ? updatedNote : note
      );
      this.saveToLocalStorage();
    }
  }

  // 노트 삭제
  public deleteNote(id: number): void {
    if (id) {
      this._store.notes = this._store.notes.filter(note => note.id !== id);
      this.saveToLocalStorage();
    }
  }

  // 초기화 상태 설정
  public setInitialized(initialized: boolean): void {
    this._store.initialized = initialized;
  }

  // 로컬 스토리지에서 데이터 로드
  private loadFromLocalStorage(): void {
    try {
      const storedNotes = localStorage.getItem('notes');
      if (storedNotes) {
        const parsedNotes = JSON.parse(storedNotes);
        if (Array.isArray(parsedNotes) && parsedNotes.length > 0) {
          this._store.notes = parsedNotes;
          this._store.initialized = true;
          console.log('Loaded notes from localStorage:', parsedNotes.length);
        }
      }
    } catch (error) {
      console.error('Error loading notes from localStorage:', error);
    }
  }

  // 로컬 스토리지에 데이터 저장
  private saveToLocalStorage(): void {
    try {
      // 존재하는 노트만 저장 (null, undefined 필터링)
      const validNotes = this._store.notes.filter(note => note && note.id);
      localStorage.setItem('notes', JSON.stringify(validNotes));
      console.log('Saved notes to localStorage:', validNotes.length);
    } catch (error) {
      console.error('Error saving notes to localStorage:', error);
    }
  }
}

// 싱글톤 인스턴스 익스포트
export const noteStore = NoteStoreManager.getInstance();

// 편의 함수 익스포트
export const getNotes = (): Note[] => noteStore.getStore().notes;
export const isInitialized = (): boolean => noteStore.getStore().initialized;
export const setNotes = (notes: Note[]): void => noteStore.setNotes(notes);
export const addNote = (note: Note): void => noteStore.addNote(note);
export const updateNote = (note: Note): void => noteStore.updateNote(note);
export const deleteNote = (id: number): void => noteStore.deleteNote(id);
export const setInitialized = (initialized: boolean): void => noteStore.setInitialized(initialized);
