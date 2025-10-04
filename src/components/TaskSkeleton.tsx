import {Card, CardContent, CardActions, Skeleton, Box} from "@mui/material";

/**
 * TaskSkeleton component - Loading placeholder for task cards
 * Displays animated skeleton loaders that match the TaskCard layout
 */
export default function TaskSkeleton() {
  return (
    <Card
      sx={{
        mb: 2,
        boxShadow: 2,
      }}
      data-testid="task-skeleton"
    >
      <CardContent>
        <Box sx={{display: "flex", alignItems: "center", mb: 1}}>
          <Skeleton variant="circular" width={24} height={24} sx={{ml: 1}} />
          <Skeleton variant="text" width="60%" height={32} sx={{mr: 2}} />
        </Box>
        <Skeleton variant="text" width="90%" height={20} />
        <Skeleton variant="text" width="75%" height={20} />
        <Box sx={{display: "flex", gap: 1, mt: 2}}>
          <Skeleton variant="text" width={100} height={16} />
          <Skeleton variant="text" width={100} height={16} />
        </Box>
      </CardContent>
      <CardActions sx={{justifyContent: "flex-start", px: 2, pb: 2}}>
        <Skeleton
          variant="rectangular"
          width={70}
          height={36}
          sx={{borderRadius: 1}}
        />
        <Skeleton
          variant="rectangular"
          width={70}
          height={36}
          sx={{borderRadius: 1}}
        />
      </CardActions>
    </Card>
  );
}
