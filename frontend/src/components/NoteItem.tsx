import React from 'react';
import { 
  Paper, 
  Typography, 
  Box, 
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon 
} from '@mui/icons-material';
import { Note } from '@/services/noteService';
import { format } from 'date-fns';

interface NoteItemProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: number) => void;
}

const NoteItem: React.FC<NoteItemProps> = ({ note, onEdit, onDelete }) => {
  // Format the created_at date
  const formattedDate = React.useMemo(() => {
    try {
      return format(new Date(note.created_at), 'yyyy-MM-dd HH:mm');
    } catch (e) {
      return 'Invalid date';
    }
  }, [note.created_at]);

  return (
    <Paper 
      elevation={2}
      sx={{ 
        p: 2, 
        mb: 2, 
        position: 'relative',
        '&:hover .note-actions': {
          display: 'flex'
        }
      }}
    >
      <Box 
        className="note-actions" 
        sx={{ 
          position: 'absolute', 
          right: 8, 
          top: 8, 
          display: 'none',
          gap: 1
        }}
      >
        <Tooltip title="Edit">
          <IconButton 
            size="small" 
            color="primary" 
            onClick={() => onEdit(note)}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Delete">
          <IconButton 
            size="small" 
            color="error" 
            onClick={() => onDelete(note.id)}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <Typography 
        variant="body1" 
        component="div" 
        sx={{ 
          whiteSpace: 'pre-wrap',
          mb: 2
        }}
      >
        {note.content}
      </Typography>
      
      <Typography 
        variant="caption" 
        color="text.secondary"
      >
        Created: {formattedDate}
      </Typography>
    </Paper>
  );
};

export default NoteItem;
