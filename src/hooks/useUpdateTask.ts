import {useMutation, useQueryClient} from "@tanstack/react-query";
import toast from "react-hot-toast";
import {updateTask} from "@/lib/api";
import type {UpdateTaskInput} from "@/types/task";
import type {ApiError} from "@/types/api";

interface UpdateTaskParams {
  id: string;
  input: UpdateTaskInput;
}

/**
 * React Query mutation hook for updating an existing task
 * Includes automatic query invalidation and toast notifications
 */
export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({id, input}: UpdateTaskParams) => updateTask(id, input),
    onSuccess: () => {
      // Invalidate and refetch tasks to show the updated task
      queryClient.invalidateQueries({queryKey: ["tasks"]});
      toast.success("تسک با موفقیت ویرایش شد");
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "خطا در ویرایش تسک. لطفا دوباره تلاش کنید");
    },
  });
}
