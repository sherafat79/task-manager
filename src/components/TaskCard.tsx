import {useState} from "react";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Checkbox,
  IconButton,
  Box,
  CircularProgress,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import type {Task} from "@/types/task";
import {useToggleTask} from "@/hooks/useToggleTask";
import {useDeleteTask} from "@/hooks/useDeleteTask";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
}

/**
 * TaskCard component displays a single task with actions
 * Supports completion toggle, edit, and delete operations
 * Shows loading states during async operations
 */
export function TaskCard({task, onEdit}: TaskCardProps) {
  const toggleMutation = useToggleTask();
  const deleteMutation = useDeleteTask();
  const [isTogglingId, setIsTogglingId] = useState<string | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  const handleToggle = async () => {
    setIsTogglingId(task.id);
    try {
      await toggleMutation.mutateAsync({
        id: task.id,
        completed: !task.completed,
      });
    } finally {
      setIsTogglingId(null);
    }
  };

  const handleDelete = async () => {
    setIsDeletingId(task.id);
    try {
      await deleteMutation.mutateAsync(task.id);
    } finally {
      setIsDeletingId(null);
    }
  };

  const handleEdit = () => {
    onEdit(task);
  };

  const isToggling = isTogglingId === task.id;
  const isDeleting = isDeletingId === task.id;

  // Format timestamps for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <Card
      sx={{
        mb: 2,
        opacity: task.completed ? 0.7 : 1,
        transition: "opacity 0.2s",
      }}
      elevation={2}
    >
      <CardContent>
        <Box display="flex" alignItems="flex-start" gap={1}>
          <Checkbox
            checked={task.completed}
            onChange={handleToggle}
            disabled={isToggling || isDeleting}
            sx={{mt: -1}}
          />
          <Box flex={1}>
            <Typography
              variant="h6"
              component="h3"
              sx={{
                textDecoration: task.completed ? "line-through" : "none",
                wordBreak: "break-word",
              }}
            >
              {task.title}
            </Typography>
            {task.description && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 1,
                  textDecoration: task.completed ? "line-through" : "none",
                  wordBreak: "break-word",
                }}
              >
                {task.description}
              </Typography>
            )}
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{mt: 1, display: "block"}}
            >
              ایجاد شده: {formatDate(task.createdAt)}
            </Typography>
            {task.updatedAt !== task.createdAt && (
              <Typography variant="caption" color="text.secondary">
                به‌روزرسانی: {formatDate(task.updatedAt)}
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
      <CardActions sx={{justifyContent: "flex-start", px: 2, pb: 2}}>
        <IconButton
          aria-label="ویرایش تسک"
          onClick={handleEdit}
          disabled={isToggling || isDeleting}
          color="primary"
          size="small"
        >
          <EditIcon />
        </IconButton>
        <IconButton
          aria-label="حذف تسک"
          onClick={handleDelete}
          disabled={isToggling || isDeleting}
          color="error"
          size="small"
        >
          {isDeleting ? (
            <CircularProgress size={20} color="error" />
          ) : (
            <DeleteIcon />
          )}
        </IconButton>
      </CardActions>
    </Card>
  );
}
