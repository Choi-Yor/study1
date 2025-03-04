import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import noteService from '../services/noteService';
import { Note, NoteFilterOptions } from '../types/api';
import { showErrorToast } from '../utils/errorUtils';

// Note 목록 조회 훅
export const useNotes = (filterOptions?: Partial<NoteFilterOptions>) => {
  return useQuery({
    queryKey: ['notes', filterOptions],
    queryFn: () => noteService.getNotes(filterOptions),
    keepPreviousData: true,
    staleTime: 60000, // 1분
  });
};

// 단일 Note 조회 훅
export const useNote = (id: number | null) => {
  return useQuery({
    queryKey: ['note', id],
    queryFn: () => noteService.getNoteById(id as number),
    enabled: !!id, // id가 있을 때만 실행
    staleTime: 60000, // 1분
  });
};

// Note 생성 훅
export const useCreateNote = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (noteData: Partial<Note>) => noteService.createNote(noteData),
    onSuccess: () => {
      // 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
    onError: (error) => {
      showErrorToast(error);
    },
  });
};

// Note 수정 훅
export const useUpdateNote = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, noteData }: { id: number; noteData: Partial<Note> }) => 
      noteService.updateNote(id, noteData),
    onSuccess: (updatedNote) => {
      // 캐시 업데이트
      queryClient.setQueryData(['note', updatedNote.id], updatedNote);
      
      // 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
    onError: (error) => {
      showErrorToast(error);
    },
  });
};

// Note 삭제 훅
export const useDeleteNote = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => noteService.deleteNote(id),
    onSuccess: (_, id) => {
      // 캐시에서 제거
      queryClient.removeQueries({ queryKey: ['note', id] });
      
      // 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
    onError: (error) => {
      showErrorToast(error);
    },
  });
};
