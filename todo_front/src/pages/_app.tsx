import { useState, useEffect } from 'react';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { CacheProvider, EmotionCache } from '@emotion/react';
import { ThemeProvider, CssBaseline, GlobalStyles } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { RootStoreProvider, useUIStore } from '@/store/RootStore';
import { createAppTheme } from '@/styles/theme';
import globalStyles from '@/styles/globals';
import createEmotionCache from '@/utils/createEmotionCache';

// 클라이언트 사이드 캐시, 공유된 인스턴스
const clientSideEmotionCache = createEmotionCache();

// React Query 클라이언트 설정
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5분
    },
  },
});

// 확장된 AppProps 인터페이스
interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache;
}

// 테마 프로바이더 컴포넌트
const ThemeProviderWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const uiStore = useUIStore();
  const theme = createAppTheme(uiStore.isDarkMode ? 'dark' : 'light');

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles styles={globalStyles(theme)} />
      {children}
    </ThemeProvider>
  );
};

export default function App({ 
  Component, 
  pageProps, 
  emotionCache = clientSideEmotionCache 
}: MyAppProps) {
  // 클라이언트 사이드에서만 실행되도록 하는 상태
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <title>Todo 앱</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="description" content="할 일 관리 및 노트 작성 애플리케이션" />
      </Head>
      
      <QueryClientProvider client={queryClient}>
        <RootStoreProvider>
          {isClient ? (
            <ThemeProviderWrapper>
              <Component {...pageProps} />
              <ToastContainer
                position="bottom-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
              />
            </ThemeProviderWrapper>
          ) : (
            <Component {...pageProps} />
          )}
        </RootStoreProvider>
      </QueryClientProvider>
    </CacheProvider>
  );
}
