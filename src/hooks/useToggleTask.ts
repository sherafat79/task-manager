import {useMutation, useQueryClient} from "@tanstack/react-query";
import toast from "react-hot-toast";
import {toggleTask} from "@/lib/api";
import type {ApiError} from "@/types/api";

interface ToggleTaskParams {
  id: string;
  completed: boolean;
}

/**
 * React Query mutation hook for toggling task completion status
 * Includes automatic query invalidation and toast notifications
 */
export function useToggleTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({id, completed}: ToggleTaskParams) =>
      toggleTask(id, completed),
    onSuccess: () => {
      // Invalidate and refetch tasks to show the updated completion status
      queryClient.invalidateQueries({queryKey: ["tasks"]});
      toast.success("وضعیت تسک با موفقیت تغییر کرد");
    },
    onError: (error: ApiError) => {
      toast.error(
        error.message || "خطا در تغییر وضعیت تسک. لطفا دوباره تلاش کنید"
      );
    },
  });
}
