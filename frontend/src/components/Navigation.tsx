import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Container,
  Box,
  useTheme
} from '@mui/material';
import { 
  Note as NoteIcon, 
  FormatListBulleted as TodoIcon 
} from '@mui/icons-material';
import Link from 'next/link';
import { useRouter } from 'next/router';

const Navigation: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  const path = router.pathname;

  return (
    <AppBar position="static" color="primary" elevation={0}>
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            Todo & Notes App
          </Typography>
          
          <Box sx={{ display: 'flex' }}>
            <Link href="/" passHref legacyBehavior>
              <Button 
                color="inherit" 
                startIcon={<TodoIcon />}
                sx={{ 
                  mx: 1,
                  borderBottom: path === '/' ? `2px solid ${theme.palette.common.white}` : 'none',
                  borderRadius: 0,
                  paddingBottom: '6px'
                }}
              >
                Todos
              </Button>
            </Link>
            
            <Link href="/notes" passHref legacyBehavior>
              <Button 
                color="inherit" 
                startIcon={<NoteIcon />}
                sx={{ 
                  mx: 1,
                  borderBottom: path === '/notes' ? `2px solid ${theme.palette.common.white}` : 'none',
                  borderRadius: 0,
                  paddingBottom: '6px'
                }}
              >
                Notes
              </Button>
            </Link>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navigation;
