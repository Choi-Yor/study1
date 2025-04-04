import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Box,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Todo, TodoInput } from '@/services/todoService';

interface TodoFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (todo: TodoInput) => void;
  initialData?: Todo;
}

const TodoForm: React.FC<TodoFormProps> = ({
  open,
  onClose,
  onSubmit,
  initialData
}) => {
  const [task, setTask] = useState('');
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [status, setStatus] = useState<'Pending' | 'Completed'>('Pending');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [errors, setErrors] = useState({ task: false });

  useEffect(() => {
    if (initialData) {
      setTask(initialData.task);
      setPriority(initialData.priority);
      setStatus(initialData.status);
      setDueDate(initialData.due_date ? new Date(initialData.due_date) : null);
    } else {
      // Reset form for new todo
      setTask('');
      setPriority('Medium');
      setStatus('Pending');
      setDueDate(null);
    }
  }, [initialData, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    if (!task.trim()) {
      setErrors({ task: true });
      return;
    }

    // 날짜를 선택한 날짜 그대로 저장하기 위한 수정
    // toISOString()은 UTC 기준으로 변환하므로 타임존 차이로 인해 날짜가 하루 전으로 변경될 수 있음
    // 선택한 날짜 그대로 YYYY-MM-DD 형식으로 변환
    let formattedDate = null;
    if (dueDate) {
      const year = dueDate.getFullYear();
      const month = String(dueDate.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 +1
      const day = String(dueDate.getDate()).padStart(2, '0');
      formattedDate = `${year}-${month}-${day}`;
    }
    
    const todoData: TodoInput = {
      task,
      priority,
      status,
      due_date: formattedDate
    };
    
    onSubmit(todoData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initialData ? 'Edit Todo' : 'Add New Todo'}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Task"
              value={task}
              onChange={(e) => {
                setTask(e.target.value);
                if (e.target.value.trim()) setErrors({ task: false });
              }}
              fullWidth
              required
              error={errors.task}
              helperText={errors.task ? 'Task is required' : ''}
              autoFocus
            />
            
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={priority}
                label="Priority"
                onChange={(e) => setPriority(e.target.value as 'High' | 'Medium' | 'Low')}
              >
                <MenuItem value="High">High</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="Low">Low</MenuItem>
              </Select>
            </FormControl>
            
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Due Date (Optional)"
                value={dueDate}
                onChange={(newValue) => setDueDate(newValue)}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={status === 'Completed'}
                  onChange={(e) => setStatus(e.target.checked ? 'Completed' : 'Pending')}
                  color="primary"
                />
              }
              label="Completed"
            />
          </Box>
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

export default TodoForm;
