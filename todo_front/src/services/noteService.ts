import apiClient from './api';
import { Note, NoteFilterOptions, NoteRequest, NotesResponse } from '../types/api';

const NOTES_ENDPOINT = '/api/notes/';

// 노트 목록 조회 (GET /api/notes/)
export const getNotes = async (options?: NoteFilterOptions): Promise<NotesResponse> => {
  const { data } = await apiClient.get<NotesResponse>(NOTES_ENDPOINT, { params: options });
  return data;
};

// 노트 상세 조회 (GET /api/notes/{id}/)
export const getNoteById = async (id: number): Promise<Note> => {
  const { data } = await apiClient.get<Note>(`${NOTES_ENDPOINT}${id}/`);
  return data;
};

// 노트 생성 (POST /api/notes/)
export const createNote = async (noteData: NoteRequest): Promise<Note> => {
  const { data } = await apiClient.post<Note>(NOTES_ENDPOINT, noteData);
  return data;
};

// 노트 수정 (PUT /api/notes/{id}/)
export const updateNote = async (id: number, noteData: NoteRequest): Promise<Note> => {
  const { data } = await apiClient.put<Note>(`${NOTES_ENDPOINT}${id}/`, noteData);
  return data;
};

// 노트 부분 수정 (PATCH /api/notes/{id}/)
export const patchNote = async (id: number, noteData: Partial<NoteRequest>): Promise<Note> => {
  const { data } = await apiClient.patch<Note>(`${NOTES_ENDPOINT}${id}/`, noteData);
  return data;
};

// 노트 삭제 (DELETE /api/notes/{id}/)
export const deleteNote = async (id: number): Promise<void> => {
  await apiClient.delete(`${NOTES_ENDPOINT}${id}/`);
};

const noteService = {
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  patchNote,
  deleteNote,
};

export default noteService;
