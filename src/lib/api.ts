import type {Task, CreateTaskInput, UpdateTaskInput} from "@/types/task";
import type {ApiError} from "@/types/api";

const API_BASE_URL = "/api/tasks";

/**
 * Custom error class for API errors
 */
class ApiRequestError extends Error implements ApiError {
  status: number;
  code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.code = code;
  }
}

/**
 * Helper function to handle API responses and errors
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: "خطا در برقراری ارتباط با سرور",
    }));

    throw new ApiRequestError(
      response.status,
      errorData.message || `خطای ${response.status}`,
      errorData.code
    );
  }

  const data = await response.json();
  return data.data !== undefined ? data.data : data;
}

/**
 * Fetch all tasks from the API
 */
export async function fetchTasks(): Promise<Task[]> {
  try {
    const response = await fetch(API_BASE_URL);
    return await handleResponse<Task[]>(response);
  } catch (error) {
    if (error instanceof ApiRequestError) {
      throw error;
    }
    throw new ApiRequestError(
      500,
      "خطا در دریافت لیست تسک‌ها. لطفا دوباره تلاش کنید"
    );
  }
}

/**
 * Create a new task
 */
export async function createTask(input: CreateTaskInput): Promise<Task> {
  try {
    const response = await fetch(API_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });
    return await handleResponse<Task>(response);
  } catch (error) {
    if (error instanceof ApiRequestError) {
      throw error;
    }
    throw new ApiRequestError(500, "خطا در ایجاد تسک. لطفا دوباره تلاش کنید");
  }
}

/**
 * Update an existing task
 */
export async function updateTask(
  id: string,
  input: UpdateTaskInput
): Promise<Task> {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });
    return await handleResponse<Task>(response);
  } catch (error) {
    if (error instanceof ApiRequestError) {
      throw error;
    }
    throw new ApiRequestError(500, "خطا در ویرایش تسک. لطفا دوباره تلاش کنید");
  }
}

/**
 * Delete a task
 */
export async function deleteTask(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: "DELETE",
    });
    await handleResponse<void>(response);
  } catch (error) {
    if (error instanceof ApiRequestError) {
      throw error;
    }
    throw new ApiRequestError(500, "خطا در حذف تسک. لطفا دوباره تلاش کنید");
  }
}

/**
 * Toggle task completion status
 */
export async function toggleTask(
  id: string,
  completed: boolean
): Promise<Task> {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({completed}),
    });
    return await handleResponse<Task>(response);
  } catch (error) {
    if (error instanceof ApiRequestError) {
      throw error;
    }
    throw new ApiRequestError(
      500,
      "خطا در تغییر وضعیت تسک. لطفا دوباره تلاش کنید"
    );
  }
}
