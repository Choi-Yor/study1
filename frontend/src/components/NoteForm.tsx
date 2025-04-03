import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from '@mui/material';
import { Note, NoteInput } from '@/services/noteService';

interface NoteFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (note: NoteInput) => void;
  initialData?: Note;
}

const NoteForm: React.FC<NoteFormProps> = ({
  open,
  onClose,
  onSubmit,
  initialData
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [errors, setErrors] = useState({ title: false, content: false });

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setContent(initialData.content);
    } else {
      // Reset form for new note
      setTitle('');
      setContent('');
    }
  }, [initialData, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    const newErrors = { title: false, content: false };
    let hasError = false;
    
    if (!title.trim()) {
      newErrors.title = true;
      hasError = true;
    }
    
    if (!content.trim()) {
      newErrors.content = true;
      hasError = true;
    }
    
    if (hasError) {
      setErrors(newErrors);
      return;
    }

    const noteData: NoteInput = {
      title,
      content
    };
    
    onSubmit(noteData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initialData ? 'Edit Note' : 'Add New Note'}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            label="Title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (e.target.value.trim()) setErrors({ ...errors, title: false });
            }}
            fullWidth
            required
            error={errors.title}
            helperText={errors.title ? 'Title is required' : ''}
            autoFocus
            margin="dense"
            sx={{ mb: 2 }}
          />
          <TextField
            label="Content"
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              if (e.target.value.trim()) setErrors({ ...errors, content: false });
            }}
            fullWidth
            required
            multiline
            rows={4}
            error={errors.content}
            helperText={errors.content ? 'Content is required' : ''}
            margin="dense"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="inherit">Cancel</Button>
          <Button type="submit" color="primary" variant="contained">
            {initialData ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default NoteForm;
