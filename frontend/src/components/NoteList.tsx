import React, { useState, useEffect } from 'react';
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

  // Fetch notes from API
  const fetchNotes = async () => {
    if (noteStore.initialized && noteStore.notes.length > 0) {
      setNotes(noteStore.notes);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await noteService.getAllNotes();
      setNotes(data);
      noteStore.notes = data;
      noteStore.initialized = true;
      setError(null);
    } catch (err) {
      console.error('Error fetching notes:', err);
      setError('Failed to load notes. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  // Filter notes based on search term
  useEffect(() => {
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
      const updatedNotes = [...notes, newNote];
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
      
      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : filteredNotes.length > 0 ? (
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
