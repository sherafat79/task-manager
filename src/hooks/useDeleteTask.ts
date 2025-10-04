import {useMutation, useQueryClient} from "@tanstack/react-query";
import toast from "react-hot-toast";
import {deleteTask} from "@/lib/api";
import type {ApiError} from "@/types/api";

/**
 * React Query mutation hook for deleting a task
 * Includes automatic query invalidation and toast notifications
 */
export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTask(id),
    onSuccess: () => {
      // Invalidate and refetch tasks to remove the deleted task from the list
      queryClient.invalidateQueries({queryKey: ["tasks"]});
      toast.success("تسک با موفقیت حذف شد");
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "خطا در حذف تسک. لطفا دوباره تلاش کنید");
    },
  });
}
