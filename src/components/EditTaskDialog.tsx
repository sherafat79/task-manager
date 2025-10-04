"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import TaskForm from "./TaskForm";
import {useUpdateTask} from "@/hooks/useUpdateTask";
import type {Task, UpdateTaskInput} from "@/types/task";

interface EditTaskDialogProps {
  open: boolean;
  onClose: () => void;
  task: Task | null;
}

/**
 * Dialog component for editing existing tasks
 * Integrates TaskForm with pre-filled values and useUpdateTask mutation hook
 */
export default function EditTaskDialog({
  open,
  onClose,
  task,
}: EditTaskDialogProps) {
  const updateTaskMutation = useUpdateTask();

  const handleSubmit = (data: UpdateTaskInput) => {
    if (!task) return;

    updateTaskMutation.mutate(
      {
        id: task.id,
        input: {
          title: data.title,
          description: data.description,
        },
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  const handleClose = () => {
    if (!updateTaskMutation.isPending) {
      onClose();
    }
  };

  // Don't render if no task is provided
  if (!task) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 2,
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 1,
        }}
      >
        <Box component="span">ویرایش تسک</Box>
        <IconButton
          aria-label="بستن"
          onClick={handleClose}
          disabled={updateTaskMutation.isPending}
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <TaskForm
          initialValues={{
            title: task.title,
            description: task.description,
          }}
          onSubmit={handleSubmit}
          onCancel={handleClose}
          isLoading={updateTaskMutation.isPending}
          submitLabel="ذخیره تغییرات"
        />
      </DialogContent>
    </Dialog>
  );
}
