import createCache from '@emotion/cache';

// prepend: true는 MUI 스타일이 사용자 정의 스타일보다 우선 적용되도록 함
export default function createEmotionCache() {
  return createCache({ key: 'css', prepend: true });
}
