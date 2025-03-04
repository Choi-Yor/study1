import React, { useState, useEffect } from 'react';
import { Box, Container, useMediaQuery, useTheme } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { useUIStore } from '@/store/RootStore';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

const Layout: React.FC<LayoutProps> = observer(({ children, title }) => {
  const theme = useTheme();
  const uiStore = useUIStore();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // 모바일에서는 기본적으로 사이드바 닫기
  useEffect(() => {
    if (isMobile && uiStore.isSidebarOpen) {
      uiStore.setSidebarOpen(false);
    } else if (!isMobile && !uiStore.isSidebarOpen) {
      uiStore.setSidebarOpen(true);
    }
  }, [isMobile, uiStore]);

  // 사이드바 너비 계산
  const sidebarWidth = 240;
  
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* 접근성을 위한 스킵 네비게이션 */}
      <a className="skip-nav" href="#main-content">
        메인 콘텐츠로 건너뛰기
      </a>
      
      {/* 네비게이션 바 */}
      <Navbar title={title} />
      
      {/* 사이드바 */}
      <Sidebar width={sidebarWidth} />
      
      {/* 메인 콘텐츠 */}
      <Box
        component="main"
        id="main-content"
        sx={{
          flexGrow: 1,
          pt: { xs: 2, sm: 3 },
          pb: { xs: 2, sm: 3 },
          px: { xs: 2, sm: 3 },
          mt: '64px', // 네비게이션 바 높이
          ml: {
            xs: 0,
            md: uiStore.isSidebarOpen ? `${sidebarWidth}px` : 0,
          },
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Container maxWidth="lg" sx={{ height: '100%' }}>
          {children}
        </Container>
      </Box>
    </Box>
  );
});

export default Layout;
