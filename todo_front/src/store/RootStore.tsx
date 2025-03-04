import { createContext, useContext } from 'react';
import { TodoStore } from './TodoStore';
import { NoteStore } from './NoteStore';
import { UIStore } from './UIStore';

// 루트 스토어 클래스
export class RootStore {
  todoStore: TodoStore;
  noteStore: NoteStore;
  uiStore: UIStore;

  constructor() {
    // 각 스토어 초기화 및 상호 참조 설정
    this.todoStore = new TodoStore(this);
    this.noteStore = new NoteStore(this);
    this.uiStore = new UIStore(this);
  }
}

// 싱글톤 인스턴스 생성
export const rootStore = new RootStore();

// React Context 생성
const RootStoreContext = createContext<RootStore | null>(null);

// 스토어 Provider 컴포넌트
export const RootStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <RootStoreContext.Provider value={rootStore}>
      {children}
    </RootStoreContext.Provider>
  );
};

// 스토어 사용을 위한 훅
export const useRootStore = (): RootStore => {
  const context = useContext(RootStoreContext);
  if (context === null) {
    throw new Error('useRootStore must be used within a RootStoreProvider');
  }
  return context;
};

// 개별 스토어 사용을 위한 훅
export const useTodoStore = () => useRootStore().todoStore;
export const useNoteStore = () => useRootStore().noteStore;
export const useUIStore = () => useRootStore().uiStore;
