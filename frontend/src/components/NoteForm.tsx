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
  const [content, setContent] = useState('');
  const [errors, setErrors] = useState({ content: false });

  useEffect(() => {
    if (initialData) {
      setContent(initialData.content);
    } else {
      // Reset form for new note
      setContent('');
    }
  }, [initialData, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    if (!content.trim()) {
      setErrors({ content: true });
      return;
    }

    const noteData: NoteInput = {
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
            label="Content"
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              if (e.target.value.trim()) setErrors({ content: false });
            }}
            fullWidth
            required
            multiline
            rows={6}
            error={errors.content}
            helperText={errors.content ? 'Content is required' : ''}
            autoFocus
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
