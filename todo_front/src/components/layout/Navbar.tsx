import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Box, 
  useMediaQuery, 
  useTheme,
  Avatar,
  Button,
  Tooltip
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  Brightness4 as DarkModeIcon, 
  Brightness7 as LightModeIcon,
  Notifications as NotificationsIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { observer } from 'mobx-react-lite';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useUIStore } from '@/store/RootStore';
import { useThemeMode } from '@/hooks/useTheme';

interface NavbarProps {
  title?: string;
}

const Navbar: React.FC<NavbarProps> = observer(({ title }) => {
  const theme = useTheme();
  const uiStore = useUIStore();
  const router = useRouter();
  const { isDarkMode, toggleTheme } = useThemeMode();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // 현재 페이지 타이틀 결정
  const getPageTitle = () => {
    if (title) return title;
    
    const path = router.pathname;
    if (path === '/') return '대시보드';
    if (path.startsWith('/todos')) return '할 일 관리';
    if (path.startsWith('/notes')) return '노트';
    return '할 일 앱';
  };

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: theme.zIndex.drawer + 1,
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
      }}
      elevation={1}
    >
      <Toolbar>
        {/* 사이드바 토글 버튼 */}
        <IconButton
          color="inherit"
          aria-label="메뉴 열기"
          onClick={() => uiStore.toggleSidebar()}
          edge="start"
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>

        {/* 로고 및 타이틀 */}
        <Typography
          variant="h6"
          noWrap
          component={Link}
          href="/"
          sx={{
            mr: 2,
            fontWeight: 700,
            color: 'inherit',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Box
            component="span"
            sx={{
              display: 'inline-block',
              width: '24px',
              height: '24px',
              borderRadius: '4px',
              backgroundColor: theme.palette.primary.main,
              mr: 1,
            }}
          />
          할 일 앱
        </Typography>

        {/* 현재 페이지 타이틀 */}
        {!isMobile && (
          <Typography
            variant="h6"
            noWrap
            sx={{ flexGrow: 1, fontWeight: 500 }}
          >
            {getPageTitle()}
          </Typography>
        )}

        {/* 모바일에서는 타이틀이 중앙에 오도록 */}
        {isMobile && (
          <Typography
            variant="h6"
            noWrap
            sx={{ flexGrow: 1, textAlign: 'center', fontWeight: 500 }}
          >
            {getPageTitle()}
          </Typography>
        )}

        {/* 우측 아이콘들 */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {/* 검색 버튼 */}
          <Tooltip title="검색">
            <IconButton color="inherit" onClick={() => uiStore.openModal('search')}>
              <SearchIcon />
            </IconButton>
          </Tooltip>

          {/* 다크 모드 토글 */}
          <Tooltip title={isDarkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}>
            <IconButton color="inherit" onClick={toggleTheme}>
              {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>

          {/* 알림 버튼 */}
          <Tooltip title="알림">
            <IconButton color="inherit">
              <NotificationsIcon />
            </IconButton>
          </Tooltip>

          {/* 프로필 아바타 */}
          <Tooltip title="프로필">
            <IconButton sx={{ ml: 1 }}>
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: theme.palette.primary.main,
                }}
              >
                U
              </Avatar>
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
});

export default Navbar;
