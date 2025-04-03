import React, { useState, useEffect, useCallback } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Button, 
  CircularProgress, 
  Alert,
  TextField,
  InputAdornment,
  Paper
} from '@mui/material';
import { Add as AddIcon, Search as SearchIcon } from '@mui/icons-material';
import NoteItem from './NoteItem';
import NoteForm from './NoteForm';
import ConfirmDialog from '@/components/ConfirmDialog';
import noteService, { Note, NoteInput } from '@/services/noteService';

// 전역 변수로 데이터 저장소 생성
const noteStore = {
  notes: [] as Note[],
  initialized: false
};

const NoteList: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [editNote, setEditNote] = useState<Note | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; noteId: number | null }>({
    open: false,
    noteId: null
  });

  // 데이터 로딩 함수 - 간단한 접근법으로 개선
  const fetchNotes = useCallback(async () => {
    // 바로 캐시 데이터 사용
    if (noteStore.initialized && noteStore.notes.length > 0) {
      console.log('Using cached notes:', noteStore.notes.length);
      setNotes(noteStore.notes);
      // 항상 초기에 로딩 상태 해제
      setLoading(false);
      return;
    }

    try {
      // 로딩 시작 - 지연 없이 바로 설정
      setLoading(true);
      
      console.log('Fetching notes from API...');
      const data = await noteService.getAllNotes();
      console.log('Notes fetched:', data.length);
      
      // 데이터 설정 및 저장 - 모듈 수준 스토어 유지
      setNotes(data);
      noteStore.notes = data;
      noteStore.initialized = true;
      setError(null);
    } catch (err) {
      console.error('Error fetching notes:', err);
      setError('Failed to load notes. Please try again later.');
    } finally {
      // 항상 로딩 상태 해제하도록 finally 블록 사용
      setLoading(false);
    }
  }, []);

  // 컴포넌트 마운트 시 실행
  useEffect(() => {
    // 즉시 렌더링 시 로딩 상태 false로 초기화
    setLoading(false);
    
    // 데이터 로드
    fetchNotes();
  }, [fetchNotes]);

  // Filter notes based on search term
  useEffect(() => {
    // 방어적 코드 추가: notes가 배열인지 확인
    if (!Array.isArray(notes)) {
      console.log('Notes is not an array:', notes);
      setFilteredNotes([]);
      return;
    }
    
    let filtered = [...notes];
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(note => 
        note.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Sort by creation date (newest first)
    filtered.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    setFilteredNotes(filtered);
  }, [notes, searchTerm]);

  // Handle creating a new note
  const handleAddNote = async (noteData: NoteInput) => {
    try {
      const newNote = await noteService.createNote(noteData);
      
      // 방어적 코드 추가
      const currentNotes = Array.isArray(notes) ? notes : [];
      const updatedNotes = [...currentNotes, newNote];
      
      setNotes(updatedNotes);
      noteStore.notes = updatedNotes;
    } catch (err) {
      console.error('Error adding note:', err);
      setError('Failed to add note. Please try again.');
    }
  };

  // Handle updating an existing note
  const handleUpdateNote = async (noteData: NoteInput) => {
    if (!editNote) return;
    
    try {
      const updatedNote = await noteService.updateNote(editNote.id, noteData);
      
      // 방어적 코드 추가
      if (!Array.isArray(notes)) {
        console.error('Notes is not an array in handleUpdateNote');
        setError('An error occurred. Please try again.');
        return;
      }
      
      const updatedNotes = notes.map(note => 
        note.id === editNote.id ? updatedNote : note
      );
      
      setNotes(updatedNotes);
      noteStore.notes = updatedNotes;
    } catch (err) {
      console.error('Error updating note:', err);
      setError('Failed to update note. Please try again.');
    }
  };

  // Handle deleting a note
  const handleDeleteNote = async (id: number) => {
    try {
      await noteService.deleteNote(id);
      
      // 방어적 코드 추가
      if (!Array.isArray(notes)) {
        console.error('Notes is not an array in handleDeleteNote');
        setError('An error occurred. Please try again.');
        return;
      }
      
      const updatedNotes = notes.filter(note => note.id !== id);
      
      setNotes(updatedNotes);
      noteStore.notes = updatedNotes;
    } catch (err) {
      console.error('Error deleting note:', err);
      setError('Failed to delete note. Please try again.');
    }
  };

  // Open form for editing
  const handleEditNote = (note: Note) => {
    setEditNote(note);
    setOpenForm(true);
  };

  // Submit form handler
  const handleSubmitForm = (noteData: NoteInput) => {
    if (editNote) {
      handleUpdateNote(noteData);
    } else {
      handleAddNote(noteData);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Notes
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <TextField
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            fullWidth
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditNote(undefined);
              setOpenForm(true);
            }}
          >
            Add
          </Button>
        </Box>
        
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Your notes can be used to store important information, ideas, or thoughts. Use the search box to find specific notes.
          </Typography>
        </Paper>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      
      {filteredNotes.length > 0 ? (
        <Box>
          {filteredNotes.map(note => (
            <NoteItem
              key={note.id}
              note={note}
              onEdit={handleEditNote}
              onDelete={(id) => setConfirmDelete({ open: true, noteId: id })}
            />
          ))}
        </Box>
      ) : (
        <Typography align="center" color="text.secondary" sx={{ my: 4 }}>
          {searchTerm 
            ? 'No notes match your search'
            : 'No notes yet. Add one to get started!'}
        </Typography>
      )}

      {/* Note Form Dialog */}
      <NoteForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSubmit={handleSubmitForm}
        initialData={editNote}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={confirmDelete.open}
        title="Delete Note"
        content="Are you sure you want to delete this note?"
        onClose={() => setConfirmDelete({ open: false, noteId: null })}
        onConfirm={() => {
          if (confirmDelete.noteId !== null) {
            handleDeleteNote(confirmDelete.noteId);
          }
          setConfirmDelete({ open: false, noteId: null });
        }}
      />
    </Container>
  );
};

export default NoteList;
