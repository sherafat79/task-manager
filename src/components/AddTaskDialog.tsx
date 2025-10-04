"use client";

import {useState} from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import TaskForm from "./TaskForm";
import {useCreateTask} from "@/hooks/useCreateTask";
import type {CreateTaskInput, UpdateTaskInput} from "@/types/task";

interface AddTaskDialogProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Dialog component for adding new tasks
 * Integrates TaskForm with useCreateTask mutation hook
 */
export default function AddTaskDialog({open, onClose}: AddTaskDialogProps) {
  const createTaskMutation = useCreateTask();
  const [key, setKey] = useState(0);

  const handleSubmit = (data: CreateTaskInput | UpdateTaskInput) => {
    // Type assertion is safe here since we're only creating tasks in this dialog
    createTaskMutation.mutate(data as CreateTaskInput, {
      onSuccess: () => {
        // Reset form by changing key
        setKey((prev) => prev + 1);
        onClose();
      },
    });
  };

  const handleClose = () => {
    if (!createTaskMutation.isPending) {
      // Reset form on close
      setKey((prev) => prev + 1);
      onClose();
    }
  };

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
        <Box component="span">افزودن تسک جدید</Box>
        <IconButton
          aria-label="بستن"
          onClick={handleClose}
          disabled={createTaskMutation.isPending}
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <TaskForm
          key={key}
          onSubmit={handleSubmit}
          onCancel={handleClose}
          isLoading={createTaskMutation.isPending}
          submitLabel="ایجاد تسک"
        />
      </DialogContent>
    </Dialog>
  );
}
