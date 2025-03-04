import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// API 기본 URL 설정
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Axios 인스턴스 생성
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10초 타임아웃
});

// 요청 인터셉터 설정
apiClient.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    // 요청 전에 수행할 작업
    // 예: 토큰 추가, 로깅 등
    return config;
  },
  (error: AxiosError) => {
    // 요청 에러 처리
    return Promise.reject(error);
  }
);

// 응답 인터셉터 설정
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // 응답 데이터 가공 또는 로깅
    return response;
  },
  (error: AxiosError) => {
    // 응답 에러 처리
    // 예: 401 에러 시 로그인 페이지로 리다이렉트, 에러 메시지 표시 등
    const status = error.response?.status;

    if (status === 401) {
      // 인증 에러 처리
      console.error('Authentication error');
    } else if (status === 403) {
      // 권한 에러 처리
      console.error('Permission denied');
    } else if (status === 404) {
      // 리소스 없음 에러 처리
      console.error('Resource not found');
    } else if (status === 500) {
      // 서버 에러 처리
      console.error('Server error');
    }

    return Promise.reject(error);
  }
);

export default apiClient;
