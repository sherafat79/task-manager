import {http, HttpResponse, delay} from "msw";
import {db} from "./db";
import type {CreateTaskInput, UpdateTaskInput} from "@/types/task";

/**
 * Simulates random API errors with 10% probability
 * Returns either a 500 or 404 error randomly
 */
function shouldSimulateError(): {error: boolean; status?: number} {
  const random = Math.random();

  // 10% chance of error
  if (random < 0.1) {
    // 50/50 split between 500 and 404 errors
    const status = random < 0.05 ? 500 : 404;
    return {error: true, status};
  }

  return {error: false};
}

/**
 * MSW request handlers for the task management API
 * Simulates network latency and random errors for realistic testing
 */
export const handlers = [
  // GET /api/tasks - Fetch all tasks
  http.get("/api/tasks", async () => {
    // Simulate network latency
    await delay(500);

    // Check for random error simulation
    const errorCheck = shouldSimulateError();
    if (errorCheck.error) {
      const message =
        errorCheck.status === 500
          ? "خطای سرور. لطفا دوباره تلاش کنید"
          : "تسک‌ها یافت نشدند";

      return HttpResponse.json({message}, {status: errorCheck.status});
    }

    // Return all tasks
    const tasks = db.getTasks();
    return HttpResponse.json({data: tasks});
  }),

  // POST /api/tasks - Create a new task
  http.post("/api/tasks", async ({request}) => {
    // Simulate network latency
    await delay(500);

    // Check for random error simulation
    const errorCheck = shouldSimulateError();
    if (errorCheck.error) {
      const message =
        errorCheck.status === 500
          ? "خطا در ایجاد تسک. لطفا دوباره تلاش کنید"
          : "درخواست نامعتبر است";

      return HttpResponse.json({message}, {status: errorCheck.status});
    }

    // Parse request body
    const body = (await request.json()) as CreateTaskInput;

    // Validate input
    if (!body.title || body.title.trim().length === 0) {
      return HttpResponse.json(
        {message: "عنوان تسک الزامی است"},
        {status: 400}
      );
    }

    // Create task
    const newTask = db.createTask(body);
    return HttpResponse.json({data: newTask}, {status: 201});
  }),

  // PUT /api/tasks/:id - Update an existing task
  http.put("/api/tasks/:id", async ({request, params}) => {
    // Simulate network latency
    await delay(500);

    const {id} = params;

    // Check for random error simulation
    const errorCheck = shouldSimulateError();
    if (errorCheck.error) {
      const message =
        errorCheck.status === 500
          ? "خطا در ویرایش تسک. لطفا دوباره تلاش کنید"
          : "تسک یافت نشد";

      return HttpResponse.json({message}, {status: errorCheck.status});
    }

    // Parse request body
    const body = (await request.json()) as UpdateTaskInput;

    // Update task
    const updatedTask = db.updateTask(id as string, body);

    if (!updatedTask) {
      return HttpResponse.json({message: "تسک یافت نشد"}, {status: 404});
    }

    return HttpResponse.json({data: updatedTask});
  }),

  // DELETE /api/tasks/:id - Delete a task
  http.delete("/api/tasks/:id", async ({params}) => {
    // Simulate network latency
    await delay(500);

    const {id} = params;

    // Check for random error simulation
    const errorCheck = shouldSimulateError();
    if (errorCheck.error) {
      const message =
        errorCheck.status === 500
          ? "خطا در حذف تسک. لطفا دوباره تلاش کنید"
          : "تسک یافت نشد";

      return HttpResponse.json({message}, {status: errorCheck.status});
    }

    // Delete task
    const deleted = db.deleteTask(id as string);

    if (!deleted) {
      return HttpResponse.json({message: "تسک یافت نشد"}, {status: 404});
    }

    return HttpResponse.json({message: "تسک با موفقیت حذف شد"}, {status: 200});
  }),
];
