import { useMediaQuery, useTheme as useMuiTheme } from '@mui/material';
import { useUIStore } from '../store/RootStore';
import { useEffect } from 'react';

// 테마 모드 관리 훅
export const useThemeMode = () => {
  const uiStore = useUIStore();
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  
  useEffect(() => {
    // 시스템 테마 변경 감지 (로컬 스토리지에 저장된 설정이 없을 경우)
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme === null) {
      uiStore.setDarkMode(prefersDarkMode);
    }
  }, [prefersDarkMode, uiStore]);
  
  return {
    isDarkMode: uiStore.isDarkMode,
    toggleTheme: uiStore.toggleTheme,
    setDarkMode: uiStore.setDarkMode,
  };
};

// 반응형 디자인을 위한 훅
export const useResponsive = () => {
  const theme = useMuiTheme();
  
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const isLargeDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  
  return {
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    // 화면 크기에 따른 값 반환 헬퍼 함수
    value: <T>(
      options: {
        mobile?: T;
        tablet?: T;
        desktop?: T;
        largeDesktop?: T;
        default: T;
      }
    ): T => {
      if (isLargeDesktop && options.largeDesktop !== undefined) return options.largeDesktop;
      if (isDesktop && options.desktop !== undefined) return options.desktop;
      if (isTablet && options.tablet !== undefined) return options.tablet;
      if (isMobile && options.mobile !== undefined) return options.mobile;
      return options.default;
    },
  };
};
