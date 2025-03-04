import { AxiosError } from 'axios';
import { toast } from 'react-toastify';

// 에러 타입 정의
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: Record<string, string[]>;
}

// Axios 에러를 ApiError로 변환
export const parseApiError = (error: unknown): ApiError => {
  if (error instanceof AxiosError && error.response) {
    const { status, data } = error.response;
    
    // DRF 에러 응답 형식 처리
    if (typeof data === 'object' && data !== null) {
      if (data.detail) {
        return {
          message: String(data.detail),
          status,
          code: data.code,
        };
      }
      
      // 필드 에러 처리 (폼 유효성 검사 등)
      if (Object.keys(data).length > 0) {
        const details: Record<string, string[]> = {};
        let message = '입력 데이터에 오류가 있습니다.';
        
        Object.entries(data).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            details[key] = value.map(v => String(v));
          } else if (typeof value === 'string') {
            details[key] = [value];
          } else if (value !== null && typeof value === 'object') {
            details[key] = [JSON.stringify(value)];
          }
        });
        
        return {
          message,
          status,
          details,
        };
      }
    }
    
    // 기본 HTTP 상태 코드 기반 메시지
    return {
      message: getErrorMessageByStatus(status),
      status,
    };
  }
  
  // 기타 에러 처리
  return {
    message: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
  };
};

// HTTP 상태 코드에 따른 에러 메시지
export const getErrorMessageByStatus = (status: number): string => {
  switch (status) {
    case 400:
      return '잘못된 요청입니다.';
    case 401:
      return '인증이 필요합니다.';
    case 403:
      return '접근 권한이 없습니다.';
    case 404:
      return '요청한 리소스를 찾을 수 없습니다.';
    case 405:
      return '허용되지 않은 메서드입니다.';
    case 408:
      return '요청 시간이 초과되었습니다.';
    case 409:
      return '요청이 현재 서버의 상태와 충돌합니다.';
    case 429:
      return '너무 많은 요청을 보냈습니다. 잠시 후 다시 시도해주세요.';
    case 500:
      return '서버 내부 오류가 발생했습니다.';
    case 502:
      return '게이트웨이 오류가 발생했습니다.';
    case 503:
      return '서비스를 일시적으로 사용할 수 없습니다.';
    case 504:
      return '게이트웨이 시간 초과가 발생했습니다.';
    default:
      return '오류가 발생했습니다.';
  }
};

// 에러를 토스트 메시지로 표시
export const showErrorToast = (error: unknown): void => {
  const apiError = parseApiError(error);
  toast.error(apiError.message);
};

// 에러 메시지 추출 함수
export const getErrorMessage = (error: unknown): string => {
  const apiError = parseApiError(error);
  return apiError.message;
};

// 폼 에러 처리 (React Hook Form과 함께 사용)
export const handleFormErrors = (
  error: unknown, 
  setError: (name: string, error: { type: string; message: string }) => void
): void => {
  const apiError = parseApiError(error);
  
  if (apiError.details) {
    Object.entries(apiError.details).forEach(([field, messages]) => {
      if (messages.length > 0) {
        setError(field, {
          type: 'manual',
          message: messages[0],
        });
      }
    });
  } else {
    // 일반 에러 메시지 표시
    toast.error(apiError.message);
  }
};
