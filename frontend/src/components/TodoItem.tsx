import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Checkbox, 
  IconButton, 
  Box, 
  Chip
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { Todo } from '@/services/todoService';
import { format } from 'date-fns';

interface TodoItemProps {
  todo: Todo;
  onEdit: (todo: Todo) => void;
  onDelete: (id: number) => void;
  onToggleComplete: (id: number, isCompleted: boolean) => void;
}

const TodoItem: React.FC<TodoItemProps> = ({ 
  todo, 
  onEdit, 
  onDelete, 
  onToggleComplete 
}) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No due date';
    return format(new Date(dateString), 'yyyy-MM-dd');
  };

  const isCompleted = todo.status === 'Completed';

  return (
    <Card 
      sx={{ 
        mb: 2, 
        opacity: isCompleted ? 0.7 : 1,
        border: isCompleted ? '1px solid #4caf50' : 'none',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}
    >
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <Checkbox
              checked={isCompleted}
              onChange={(e) => onToggleComplete(todo.id, e.target.checked)}
              color="primary"
            />
            <Box>
              <Typography 
                variant="h6" 
                sx={{ 
                  textDecoration: isCompleted ? 'line-through' : 'none',
                  color: isCompleted ? 'text.secondary' : 'text.primary' 
                }}
              >
                {todo.task}
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ 
                  textDecoration: isCompleted ? 'line-through' : 'none' 
                }}
              >
                Priority: {todo.priority}
              </Typography>
            </Box>
          </Box>
          <Box display="flex" alignItems="center">
            {todo.due_date && (
              <Chip 
                label={formatDate(todo.due_date)} 
                size="small" 
                color="info" 
                sx={{ mr: 1 }}
              />
            )}
            <IconButton 
              size="small" 
              onClick={() => onEdit(todo)} 
              color="primary"
            >
              <EditIcon />
            </IconButton>
            <IconButton 
              size="small" 
              onClick={() => onDelete(todo.id)} 
              color="error"
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TodoItem;
