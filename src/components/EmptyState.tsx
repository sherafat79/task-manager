import {Box, Typography} from "@mui/material";
import InboxIcon from "@mui/icons-material/Inbox";

export default function EmptyState() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "400px",
        gap: 2,
      }}
    >
      <InboxIcon
        sx={{
          fontSize: 80,
          color: "text.secondary",
          opacity: 0.5,
        }}
      />
      <Typography variant="h6" color="text.secondary" align="center">
        هیچ تسکی وجود ندارد
      </Typography>
      <Typography variant="body2" color="text.secondary" align="center">
        برای شروع، یک تسک جدید اضافه کنید
      </Typography>
    </Box>
  );
}
