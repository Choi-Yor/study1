import { format, parse, isValid, formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

// ISO 날짜 문자열을 사용자 친화적인 형식으로 변환
export const formatDate = (dateString: string, formatPattern = 'yyyy년 MM월 dd일'): string => {
  const date = new Date(dateString);
  if (!isValid(date)) {
    return '유효하지 않은 날짜';
  }
  return format(date, formatPattern, { locale: ko });
};

// 날짜를 상대적 시간으로 표시 (예: '3일 전', '1시간 전')
export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  if (!isValid(date)) {
    return '유효하지 않은 날짜';
  }
  return formatDistanceToNow(date, { addSuffix: true, locale: ko });
};

// YYYY-MM-DD 형식의 문자열을 Date 객체로 변환
export const parseDate = (dateString: string): Date => {
  return parse(dateString, 'yyyy-MM-dd', new Date());
};

// Date 객체를 YYYY-MM-DD 형식의 문자열로 변환
export const formatToYYYYMMDD = (date: Date): string => {
  if (!isValid(date)) {
    return '';
  }
  return format(date, 'yyyy-MM-dd');
};

// 오늘 날짜를 YYYY-MM-DD 형식의 문자열로 반환
export const getTodayFormatted = (): string => {
  return formatToYYYYMMDD(new Date());
};

// 두 날짜 사이의 일수 계산
export const getDaysBetween = (startDate: Date, endDate: Date): number => {
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// 마감일까지 남은 일수 계산
export const getDaysUntilDue = (dueDateString: string): number => {
  const dueDate = parseDate(dueDateString);
  const today = new Date();
  
  // 시간 부분을 제거하여 날짜만 비교
  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);
  
  const diffTime = dueDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// 마감일 상태 확인 (지남, 임박, 여유)
export const getDueStatus = (dueDateString: string): 'overdue' | 'soon' | 'safe' => {
  const daysUntilDue = getDaysUntilDue(dueDateString);
  
  if (daysUntilDue < 0) {
    return 'overdue'; // 마감일 지남
  } else if (daysUntilDue <= 3) {
    return 'soon'; // 마감일 임박 (3일 이내)
  } else {
    return 'safe'; // 여유 있음
  }
};
