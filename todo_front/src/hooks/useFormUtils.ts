import { useForm, UseFormProps, FieldValues, UseFormReturn } from 'react-hook-form';
import { useEffect } from 'react';
import { handleFormErrors } from '../utils/errorUtils';

// 폼 초기화 및 에러 처리를 위한 커스텀 훅
export const useFormWithErrorHandling = <T extends FieldValues>(
  options: UseFormProps<T> = {}
): UseFormReturn<T> => {
  const methods = useForm<T>(options);
  
  // 폼 에러 처리 함수
  const handleSubmitWithErrorHandling = (
    onValid: (data: T) => Promise<unknown> | void,
    onInvalid?: (errors: any) => void
  ) => {
    return methods.handleSubmit(async (data) => {
      try {
        await onValid(data);
      } catch (error) {
        // API 에러를 폼 에러로 변환
        handleFormErrors(error, methods.setError);
      }
    }, onInvalid);
  };
  
  // 확장된 메서드 반환
  return {
    ...methods,
    handleSubmitWithErrorHandling,
  } as UseFormReturn<T> & {
    handleSubmitWithErrorHandling: typeof handleSubmitWithErrorHandling;
  };
};

// 폼 데이터 초기화를 위한 커스텀 훅
export const useFormReset = <T extends FieldValues>(
  methods: UseFormReturn<T>,
  values: Partial<T> | null | undefined,
  dependencies: any[] = []
): void => {
  useEffect(() => {
    if (values) {
      methods.reset(values as T);
    }
  }, [methods, values, ...dependencies]);
};

// 폼 필드 에러 메시지 표시를 위한 유틸리티 함수
export const getErrorMessage = (error: any): string => {
  if (!error) return '';
  return error.message || '유효하지 않은 값입니다.';
};

// 폼 필드 에러 상태 확인을 위한 유틸리티 함수
export const hasError = (error: any): boolean => {
  return !!error;
};
