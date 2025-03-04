import React from 'react';
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  ListItemButton,
  Divider, 
  Box, 
  useTheme,
  Collapse,
  Typography
} from '@mui/material';
import { 
  Dashboard as DashboardIcon,
  CheckCircle as TodoIcon,
  Note as NoteIcon,
  ExpandLess,
  ExpandMore,
  Add as AddIcon,
  Settings as SettingsIcon,
  Help as HelpIcon,
  StarBorder,
  Label as LabelIcon,
  Flag as FlagIcon,
  CalendarToday as CalendarIcon,
  CheckCircle
} from '@mui/icons-material';
import { observer } from 'mobx-react-lite';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useUIStore } from '@/store/RootStore';

interface SidebarProps {
  width: number;
}

const Sidebar: React.FC<SidebarProps> = observer(({ width }) => {
  const theme = useTheme();
  const uiStore = useUIStore();
  const router = useRouter();
  const [todosOpen, setTodosOpen] = React.useState(true);
  const [notesOpen, setNotesOpen] = React.useState(true);

  // 현재 경로가 해당 메뉴 항목과 일치하는지 확인
  const isActive = (path: string) => {
    if (path === '/') {
      return router.pathname === '/';
    }
    return router.pathname.startsWith(path);
  };

  // 메뉴 토글 핸들러
  const handleTodosToggle = () => {
    setTodosOpen(!todosOpen);
  };

  const handleNotesToggle = () => {
    setNotesOpen(!notesOpen);
  };

  const drawerContent = (
    <>
      <Box
        sx={{
          height: '64px', // 네비게이션 바와 같은 높이
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: theme.palette.primary.main,
          }}
        >
          할 일 앱
        </Typography>
      </Box>

      <List sx={{ width: '100%', mt: 1 }}>
        {/* 대시보드 */}
        <ListItem disablePadding>
          <ListItemButton
            component={Link}
            href="/"
            selected={isActive('/')}
            sx={{
              borderRadius: '0 20px 20px 0',
              mr: 1,
              '&.Mui-selected': {
                backgroundColor: theme.palette.primary.main + '20',
                color: theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: theme.palette.primary.main + '30',
                },
                '& .MuiListItemIcon-root': {
                  color: theme.palette.primary.main,
                },
              },
            }}
          >
            <ListItemIcon>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="대시보드" />
          </ListItemButton>
        </ListItem>

        {/* 할 일 섹션 */}
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleTodosToggle}
            sx={{
              borderRadius: '0 20px 20px 0',
              mr: 1,
              ...(isActive('/todos') && {
                backgroundColor: theme.palette.primary.main + '20',
                color: theme.palette.primary.main,
                '& .MuiListItemIcon-root': {
                  color: theme.palette.primary.main,
                },
              }),
            }}
          >
            <ListItemIcon>
              <TodoIcon />
            </ListItemIcon>
            <ListItemText primary="할 일" />
            {todosOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
        </ListItem>

        <Collapse in={todosOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton
              component={Link}
              href="/todos"
              selected={router.pathname === '/todos'}
              sx={{
                pl: 4,
                borderRadius: '0 20px 20px 0',
                mr: 1,
                '&.Mui-selected': {
                  backgroundColor: theme.palette.primary.main + '20',
                  color: theme.palette.primary.main,
                },
              }}
            >
              <ListItemIcon>
                <StarBorder />
              </ListItemIcon>
              <ListItemText primary="모든 할 일" />
            </ListItemButton>

            <ListItemButton
              component={Link}
              href="/todos?priority=High"
              selected={router.pathname === '/todos' && router.query.priority === 'High'}
              sx={{
                pl: 4,
                borderRadius: '0 20px 20px 0',
                mr: 1,
                '&.Mui-selected': {
                  backgroundColor: theme.palette.primary.main + '20',
                  color: theme.palette.primary.main,
                },
              }}
            >
              <ListItemIcon>
                <FlagIcon color="error" />
              </ListItemIcon>
              <ListItemText primary="중요" />
            </ListItemButton>

            <ListItemButton
              component={Link}
              href="/todos?status=Completed"
              selected={router.pathname === '/todos' && router.query.status === 'Completed'}
              sx={{
                pl: 4,
                borderRadius: '0 20px 20px 0',
                mr: 1,
                '&.Mui-selected': {
                  backgroundColor: theme.palette.primary.main + '20',
                  color: theme.palette.primary.main,
                },
              }}
            >
              <ListItemIcon>
                <CheckCircle color="success" />
              </ListItemIcon>
              <ListItemText primary="완료됨" />
            </ListItemButton>

            <ListItemButton
              onClick={() => uiStore.openModal('createTodo')}
              sx={{
                pl: 4,
                borderRadius: '0 20px 20px 0',
                mr: 1,
                color: theme.palette.primary.main,
              }}
            >
              <ListItemIcon>
                <AddIcon color="primary" />
              </ListItemIcon>
              <ListItemText primary="새 할 일 추가" />
            </ListItemButton>
          </List>
        </Collapse>

        {/* 노트 섹션 */}
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleNotesToggle}
            sx={{
              borderRadius: '0 20px 20px 0',
              mr: 1,
              ...(isActive('/notes') && {
                backgroundColor: theme.palette.primary.main + '20',
                color: theme.palette.primary.main,
                '& .MuiListItemIcon-root': {
                  color: theme.palette.primary.main,
                },
              }),
            }}
          >
            <ListItemIcon>
              <NoteIcon />
            </ListItemIcon>
            <ListItemText primary="노트" />
            {notesOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
        </ListItem>

        <Collapse in={notesOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton
              component={Link}
              href="/notes"
              selected={router.pathname === '/notes'}
              sx={{
                pl: 4,
                borderRadius: '0 20px 20px 0',
                mr: 1,
                '&.Mui-selected': {
                  backgroundColor: theme.palette.primary.main + '20',
                  color: theme.palette.primary.main,
                },
              }}
            >
              <ListItemIcon>
                <LabelIcon />
              </ListItemIcon>
              <ListItemText primary="모든 노트" />
            </ListItemButton>

            <ListItemButton
              onClick={() => uiStore.openModal('createNote')}
              sx={{
                pl: 4,
                borderRadius: '0 20px 20px 0',
                mr: 1,
                color: theme.palette.primary.main,
              }}
            >
              <ListItemIcon>
                <AddIcon color="primary" />
              </ListItemIcon>
              <ListItemText primary="새 노트 추가" />
            </ListItemButton>
          </List>
        </Collapse>

        <Divider sx={{ my: 2 }} />

        {/* 설정 */}
        <ListItem disablePadding>
          <ListItemButton
            component={Link}
            href="/settings"
            selected={isActive('/settings')}
            sx={{
              borderRadius: '0 20px 20px 0',
              mr: 1,
              '&.Mui-selected': {
                backgroundColor: theme.palette.primary.main + '20',
                color: theme.palette.primary.main,
                '& .MuiListItemIcon-root': {
                  color: theme.palette.primary.main,
                },
              },
            }}
          >
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="설정" />
          </ListItemButton>
        </ListItem>

        {/* 도움말 */}
        <ListItem disablePadding>
          <ListItemButton
            component={Link}
            href="/help"
            selected={isActive('/help')}
            sx={{
              borderRadius: '0 20px 20px 0',
              mr: 1,
              '&.Mui-selected': {
                backgroundColor: theme.palette.primary.main + '20',
                color: theme.palette.primary.main,
                '& .MuiListItemIcon-root': {
                  color: theme.palette.primary.main,
                },
              },
            }}
          >
            <ListItemIcon>
              <HelpIcon />
            </ListItemIcon>
            <ListItemText primary="도움말" />
          </ListItemButton>
        </ListItem>
      </List>
    </>
  );

  return (
    <>
      {/* 모바일 드로어 (임시) */}
      <Drawer
        variant="temporary"
        open={uiStore.isSidebarOpen}
        onClose={() => uiStore.setSidebarOpen(false)}
        ModalProps={{
          keepMounted: true, // 모바일 성능 향상
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: width,
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* 데스크톱 드로어 (영구) */}
      <Drawer
        variant="persistent"
        open={uiStore.isSidebarOpen}
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: width,
            borderRight: `1px solid ${theme.palette.divider}`,
            mt: '64px', // 네비게이션 바 높이
            height: 'calc(100% - 64px)',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
});

export default Sidebar;
