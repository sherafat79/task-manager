import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import TaskList from "@/components/TaskList";

/**
 * Home page component - Main entry point for the task manager application
 * Renders the TaskList component within a centered container
 */
export default function Home() {
  return (
    <Container maxWidth="md">
      <Box sx={{py: 4}}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          مدیریت وظایف
        </Typography>
        <TaskList />
      </Box>
    </Container>
  );
}
