"use client";

import {useState} from "react";
import {Box, Container, Typography, Fab, Alert} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import {useTasks} from "@/hooks/useTasks";
import {TaskCard} from "./TaskCard";
import TaskSkeleton from "./TaskSkeleton";
import EmptyState from "./EmptyState";
import AddTaskDialog from "./AddTaskDialog";
import EditTaskDialog from "./EditTaskDialog";
import type {Task} from "@/types/task";

/**
 * TaskList component - Main container for the task management interface
 * Handles fetching, displaying, and managing tasks with proper loading and error states
 */
export default function TaskList() {
  const {data: tasks, isLoading, isError, error} = useTasks();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const handleOpenAddDialog = () => {
    setIsAddDialogOpen(true);
  };

  const handleCloseAddDialog = () => {
    setIsAddDialogOpen(false);
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
  };

  const handleCloseEditDialog = () => {
    setEditingTask(null);
  };

  // Render loading state with skeleton loaders
  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{py: 4}}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          مدیریت تسک‌ها
        </Typography>
        <Box sx={{mt: 4}}>
          {[1, 2, 3].map((i) => (
            <TaskSkeleton key={i} />
          ))}
        </Box>
      </Container>
    );
  }

  // Render error state with Persian error message
  if (isError) {
    return (
      <Container maxWidth="md" sx={{py: 4}}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          مدیریت تسک‌ها
        </Typography>
        <Box sx={{mt: 4}}>
          <Alert severity="error" sx={{mb: 2}}>
            خطا در بارگذاری تسک‌ها. لطفا دوباره تلاش کنید.
            {error instanceof Error && (
              <Typography variant="body2" sx={{mt: 1}}>
                {error.message}
              </Typography>
            )}
          </Alert>
        </Box>
      </Container>
    );
  }

  // Render empty state when no tasks exist
  if (!tasks || tasks.length === 0) {
    return (
      <Container maxWidth="md" sx={{py: 4}}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          مدیریت تسک‌ها
        </Typography>
        <EmptyState />

        {/* Floating Action Button for adding tasks */}
        <Fab
          color="primary"
          aria-label="افزودن تسک"
          onClick={handleOpenAddDialog}
          sx={{
            position: "fixed",
            bottom: 24,
            left: 24,
          }}
        >
          <AddIcon />
        </Fab>

        {/* Add Task Dialog */}
        <AddTaskDialog open={isAddDialogOpen} onClose={handleCloseAddDialog} />
      </Container>
    );
  }

  // Render task list with proper spacing
  return (
    <Container maxWidth="md" sx={{py: 4}}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        مدیریت تسک‌ها
      </Typography>

      <Box sx={{mt: 4}}>
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onEdit={handleEdit} />
        ))}
      </Box>

      {/* Floating Action Button for adding tasks */}
      <Fab
        color="primary"
        aria-label="افزودن تسک"
        onClick={handleOpenAddDialog}
        sx={{
          position: "fixed",
          bottom: 24,
          left: 24,
        }}
      >
        <AddIcon />
      </Fab>

      {/* Add Task Dialog */}
      <AddTaskDialog open={isAddDialogOpen} onClose={handleCloseAddDialog} />

      {/* Edit Task Dialog */}
      {editingTask && (
        <EditTaskDialog
          open={!!editingTask}
          task={editingTask}
          onClose={handleCloseEditDialog}
        />
      )}
    </Container>
  );
}
