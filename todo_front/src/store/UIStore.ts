import { makeAutoObservable } from 'mobx';
import { RootStore } from './RootStore';

// UI 상태 관리 스토어
export class UIStore {
  // 로딩 상태
  isLoading: boolean = false;
  
  // 사이드바 상태
  isSidebarOpen: boolean = true;
  
  // 모달 상태
  activeModal: string | null = null;
  modalData: any = null;
  
  // 알림 상태
  notifications: Notification[] = [];
  
  // 테마 설정
  isDarkMode: boolean = false;
  
  // 루트 스토어 참조
  rootStore: RootStore;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this, { rootStore: false });
    
    // 클라이언트 사이드에서만 테마 설정 불러오기
    if (typeof window !== 'undefined') {
      this.loadThemePreference();
    }
  }
  
  // 로딩 상태 설정
  setLoading = (isLoading: boolean): void => {
    this.isLoading = isLoading;
  };
  
  // 사이드바 토글
  toggleSidebar = (): void => {
    this.isSidebarOpen = !this.isSidebarOpen;
  };
  
  // 사이드바 상태 설정
  setSidebarOpen = (isOpen: boolean): void => {
    this.isSidebarOpen = isOpen;
  };
  
  // 모달 열기
  openModal = (modalName: string, data: any = null): void => {
    this.activeModal = modalName;
    this.modalData = data;
  };
  
  // 모달 닫기
  closeModal = (): void => {
    this.activeModal = null;
    this.modalData = null;
  };
  
  // 알림 추가
  addNotification = (notification: Notification): void => {
    this.notifications.push(notification);
    
    // 자동 제거 설정
    if (notification.autoRemove) {
      setTimeout(() => {
        this.removeNotification(notification.id);
      }, notification.duration || 5000);
    }
  };
  
  // 알림 제거
  removeNotification = (id: string): void => {
    this.notifications = this.notifications.filter(
      notification => notification.id !== id
    );
  };
  
  // 모든 알림 제거
  clearAllNotifications = (): void => {
    this.notifications = [];
  };
  
  // 테마 모드 전환
  toggleTheme = (): void => {
    this.isDarkMode = !this.isDarkMode;
    this.saveThemePreference();
  };
  
  // 테마 모드 설정
  setDarkMode = (isDark: boolean): void => {
    this.isDarkMode = isDark;
    this.saveThemePreference();
  };
  
  // 테마 설정 저장
  private saveThemePreference = (): void => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem('darkMode', String(this.isDarkMode));
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };
  
  // 테마 설정 불러오기
  private loadThemePreference = (): void => {
    if (typeof window === 'undefined') return;
    
    try {
      const savedTheme = localStorage.getItem('darkMode');
      if (savedTheme !== null) {
        this.isDarkMode = savedTheme === 'true';
      } else {
        // 시스템 테마 감지
        const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
        this.isDarkMode = prefersDark;
      }
    } catch (error) {
      console.error('Failed to load theme preference:', error);
    }
  };
}

// 알림 타입 정의
export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  autoRemove?: boolean;
  duration?: number;
  timestamp: number;
}
