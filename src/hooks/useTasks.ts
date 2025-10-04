import {useQuery} from "@tanstack/react-query";
import {fetchTasks} from "@/lib/api";

/**
 * React Query hook for fetching all tasks
 * Implements caching and automatic refetching on window focus
 */
export function useTasks() {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: fetchTasks,
    staleTime: 30000, // 30 seconds - data is considered fresh for this duration
    refetchOnWindowFocus: true, // Refetch when user returns to the tab
  });
}
