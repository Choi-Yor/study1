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
import * as noteStore from '@/services/noteStore';

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

  // 데이터 로딩 함수 - 개선된 noteStore 모듈 사용
  const fetchNotes = useCallback(async () => {
    console.log('NoteList fetchNotes called - using improved noteStore');
    
    // 1. 먼저 저장된 데이터가 있는지 확인
    if (noteStore.isInitialized() && noteStore.getNotes().length > 0) {
      console.log('Using notes from global store:', noteStore.getNotes().length);
      setNotes(noteStore.getNotes());
      setLoading(false);
    }
    
    // 2. 어케든 API에서 데이터 가져오기 시도
    try {
      setLoading(true);
      console.log('Fetching notes from API...');
      const data = await noteService.getAllNotes();
      console.log('Notes fetched from API:', data.length);
      
      // 데이터 설정 및 저장 - 가져온 데이터가 있을 때만 업데이트
      if (Array.isArray(data) && data.length > 0) {
        // 현재 상태 참조 대신 함수형 업데이트 사용
        setNotes(prevNotes => {
          // 현재 화면에 표시된 노트가 없을 때만 API 데이터로 업데이트
          const currentNotes = Array.isArray(prevNotes) ? prevNotes : [];
          if (currentNotes.length === 0) {
            console.log('No notes displayed, updating UI with API data');
            // 전역 스토어 업데이트
            noteStore.setNotes(data);
            return data;
          } else {
            console.log('Notes already displayed, keeping current data');
            // 전역 스토어는 항상 최신 데이터로 업데이트
            noteStore.setNotes(data);
            return currentNotes;
          }
        });
        
        setError(null);
      } else {
        // API에서 가져온 데이터가 없는 경우 빈 배열로 설정 (함수형 업데이트)
        setNotes(prevNotes => {
          if (!Array.isArray(prevNotes) || prevNotes.length === 0) {
            console.log('No notes available from API');
            return [];
          }
          return prevNotes;
        });
      }
    } catch (err) {
      console.error('Error fetching notes from API:', err);
      
      // API 오류 발생 시에도 전역 스토어에 저장된 노트 활용
      const storedNotes = noteStore.getNotes();
      if (Array.isArray(storedNotes) && storedNotes.length > 0) {
        console.log('Using notes from global store after API error:', storedNotes.length);
        setNotes(storedNotes);
        setError(null);
      } else {
        setError('Failed to load notes. Please try again later.');
      }
    } finally {
      // 항상 로딩 상태 해제하도록 finally 블록 사용
      setLoading(false);
    }
  }, []); // 의존성 배열에서 notes 제거하여 무한 루프 방지


  // 컴포넌트 마운트 시 실행
  useEffect(() => {
    console.log('NoteList component mounted, loading notes...');
    // 로딩 상태 표시
    setLoading(true);
    
    // 데이터 로드 - 여기서 한 번만 호출
    fetchNotes();
    
    // 컴포넌트 언마운트 시 cleanup
    return () => {
      console.log('NoteList component unmounting');
      
      // 언마운트 전 현재 노트 데이터 저장 확인
      if (Array.isArray(notes) && notes.length > 0) {
        console.log('Saving notes before unmount:', notes.length);
        noteStore.setNotes(notes);
      }
    };
  }, [fetchNotes]); // notes 의존성 제거, fetchNotes만 유지

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
      console.log('Sending note data to API:', noteData); // 보내는 데이터 로깅
      const newNote = await noteService.createNote(noteData);
      console.log('Received note from API:', newNote); // 받은 응답 로깅
      
      // 제목이 누락된 경우 방어적 코드 추가
      if (!newNote.title && noteData.title) {
        console.warn('Title missing in API response. Adding title from input data.');
        newNote.title = noteData.title;
      }
      
      // 방어적 코드 추가
      const currentNotes = Array.isArray(notes) ? notes : [];
      const updatedNotes = [...currentNotes, newNote];
      
      setNotes(updatedNotes);
      // 전역 노트 스토어 업데이트
      noteStore.setNotes(updatedNotes);
      console.log('Updated global noteStore, length:', updatedNotes.length);
    } catch (err) {
      console.error('Error adding note:', err);
      setError('Failed to add note. Please try again.');
    }
  };

  // Handle updating an existing note
  const handleUpdateNote = async (noteData: NoteInput) => {
    if (!editNote) return;
    
    try {
      console.log('Sending update data to API:', noteData); // 보내는 데이터 로깅
      const updatedNote = await noteService.updateNote(editNote.id, noteData);
      console.log('Received updated note from API:', updatedNote); // 응답 로깅
      
      // 제목이 누락된 경우 방어적 코드 추가
      if (!updatedNote.title && noteData.title) {
        console.warn('Title missing in API response. Adding title from input data.');
        updatedNote.title = noteData.title;
      }
      
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
      // 전역 노트 스토어 업데이트
      noteStore.setNotes(updatedNotes);
      console.log('Updated global noteStore, length:', updatedNotes.length);
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
      // 전역 노트 스토어 업데이트
      noteStore.setNotes(updatedNotes);
      console.log('Updated global noteStore, length:', updatedNotes.length);
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
