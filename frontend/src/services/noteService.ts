import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export interface Note {
  id: number;
  content: string;
  created_at: string;
}

export interface NoteInput {
  content: string;
}

const noteService = {
  getAllNotes: async (): Promise<Note[]> => {
    const response = await axios.get(`${API_URL}/notes/`);
    return response.data;
  },

  getNoteById: async (id: number): Promise<Note> => {
    const response = await axios.get(`${API_URL}/notes/${id}/`);
    return response.data;
  },

  createNote: async (note: NoteInput): Promise<Note> => {
    const response = await axios.post(`${API_URL}/notes/`, note);
    return response.data;
  },

  updateNote: async (id: number, note: NoteInput): Promise<Note> => {
    const response = await axios.put(`${API_URL}/notes/${id}/`, note);
    return response.data;
  },

  deleteNote: async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/notes/${id}/`);
  },
};

export default noteService;
