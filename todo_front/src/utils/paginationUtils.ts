import { PaginatedResponse } from '../types/api';

// 페이지네이션 정보 추출
export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  pageSize: number;
}

// 페이지네이션 응답에서 페이지 정보 추출
export const extractPaginationInfo = <T>(
  response: PaginatedResponse<T>,
  defaultPageSize = 10
): PaginationInfo => {
  const { count, next, previous, results } = response;
  
  // 현재 페이지 추출 (URL에서 page 파라미터 추출)
  let currentPage = 1;
  if (previous) {
    const prevUrl = new URL(previous);
    const prevPage = prevUrl.searchParams.get('page');
    if (prevPage) {
      currentPage = parseInt(prevPage, 10) + 1;
    } else {
      currentPage = 2; // previous가 있지만 page 파라미터가 없으면 2페이지
    }
  } else if (next) {
    currentPage = 1; // previous가 없고 next가 있으면 1페이지
  }
  
  // 페이지 크기 추출 (결과 배열 길이 또는 기본값)
  const pageSize = results.length || defaultPageSize;
  
  // 총 페이지 수 계산
  const totalPages = Math.ceil(count / pageSize);
  
  return {
    currentPage,
    totalPages,
    totalItems: count,
    hasNextPage: !!next,
    hasPrevPage: !!previous,
    pageSize,
  };
};

// 페이지 번호 배열 생성 (페이지네이션 UI에 사용)
export const generatePageNumbers = (
  currentPage: number,
  totalPages: number,
  maxPageButtons = 5
): number[] => {
  if (totalPages <= maxPageButtons) {
    // 전체 페이지 수가 최대 버튼 수보다 작거나 같으면 모든 페이지 표시
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  
  // 현재 페이지 주변 페이지 표시
  const halfButtons = Math.floor(maxPageButtons / 2);
  let startPage = Math.max(currentPage - halfButtons, 1);
  let endPage = startPage + maxPageButtons - 1;
  
  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(endPage - maxPageButtons + 1, 1);
  }
  
  return Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i
  );
};

// URL에서 페이지 번호 추출
export const getPageFromUrl = (url: string | null): number => {
  if (!url) return 1;
  
  try {
    const urlObj = new URL(url);
    const page = urlObj.searchParams.get('page');
    return page ? parseInt(page, 10) : 1;
  } catch (error) {
    return 1;
  }
};

// 페이지네이션 파라미터 생성
export const createPaginationParams = (
  page: number,
  otherParams: Record<string, any> = {}
): Record<string, any> => {
  return {
    ...otherParams,
    page: page > 1 ? page : undefined, // 1페이지는 기본값이므로 생략
  };
};
