import {useMutation, useQueryClient} from "@tanstack/react-query";
import toast from "react-hot-toast";
import {createTask} from "@/lib/api";
import type {CreateTaskInput} from "@/types/task";
import type {ApiError} from "@/types/api";

/**
 * React Query mutation hook for creating a new task
 * Includes automatic query invalidation and toast notifications
 */
export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTaskInput) => createTask(input),
    onSuccess: () => {
      // Invalidate and refetch tasks to show the new task
      queryClient.invalidateQueries({queryKey: ["tasks"]});
      toast.success("تسک با موفقیت ایجاد شد");
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "خطا در ایجاد تسک. لطفا دوباره تلاش کنید");
    },
  });
}
