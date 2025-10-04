import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import TaskList from "@/components/TaskList";

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
