import { css } from '@emotion/react';
import { Theme } from '@mui/material/styles';

// 글로벌 스타일 정의
export const globalStyles = (theme: Theme) => css`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html,
  body {
    font-family: ${theme.typography.fontFamily};
    background-color: ${theme.palette.background.default};
    color: ${theme.palette.text.primary};
    line-height: 1.5;
    font-size: 16px;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow-x: hidden;
    min-height: 100vh;
  }

  #__next {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  a {
    color: ${theme.palette.primary.main};
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }

  h1, h2, h3, h4, h5, h6 {
    margin-bottom: 0.5em;
    line-height: 1.2;
    color: ${theme.palette.text.primary};
  }

  p {
    margin-bottom: 1em;
  }

  ul, ol {
    margin-left: 1.5em;
    margin-bottom: 1em;
  }

  img {
    max-width: 100%;
    height: auto;
  }

  /* 스크롤바 스타일링 */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${theme.palette.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.05)' 
      : 'rgba(0, 0, 0, 0.05)'
    };
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb {
    background: ${theme.palette.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.2)' 
      : 'rgba(0, 0, 0, 0.2)'
    };
    border-radius: 4px;
    &:hover {
      background: ${theme.palette.mode === 'dark' 
        ? 'rgba(255, 255, 255, 0.3)' 
        : 'rgba(0, 0, 0, 0.3)'
      };
    }
  }

  /* 선택 텍스트 스타일링 */
  ::selection {
    background-color: ${theme.palette.primary.main};
    color: ${theme.palette.primary.contrastText};
  }

  /* 모바일 탭 하이라이트 제거 */
  -webkit-tap-highlight-color: transparent;

  /* 포커스 아웃라인 스타일링 */
  :focus {
    outline: 2px solid ${theme.palette.primary.main};
    outline-offset: 2px;
  }

  /* 키보드 사용자를 위한 포커스 스타일 유지 */
  :focus:not(:focus-visible) {
    outline: none;
  }

  /* 애니메이션 설정 */
  * {
    transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
  }

  /* 접근성을 위한 스킵 네비게이션 */
  .skip-nav {
    position: absolute;
    top: -40px;
    left: 0;
    background: ${theme.palette.primary.main};
    color: ${theme.palette.primary.contrastText};
    padding: 8px;
    z-index: 100;
    &:focus {
      top: 0;
    }
  }

  /* 토스트 컨테이너 스타일링 */
  .Toastify__toast-container {
    z-index: 9999;
  }

  .Toastify__toast {
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .Toastify__toast--success {
    background-color: ${theme.palette.success.main};
  }

  .Toastify__toast--error {
    background-color: ${theme.palette.error.main};
  }

  .Toastify__toast--warning {
    background-color: ${theme.palette.warning.main};
  }

  .Toastify__toast--info {
    background-color: ${theme.palette.info.main};
  }
`;

export default globalStyles;
