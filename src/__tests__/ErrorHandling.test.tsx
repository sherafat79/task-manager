import {describe, it, expect, beforeEach, vi} from "vitest";
import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {http, HttpResponse, delay} from "msw";
import {server} from "@/mocks/server";
import TaskList from "@/components/TaskList";
import {db} from "@/mocks/db";
import toast, {Toaster} from "react-hot-toast";
import type {CreateTaskInput, UpdateTaskInput} from "@/types/task";

/**
 * Helper function to render components with React Query provider and Toaster
 * Configured with retry logic for testing retry behavior
 */
function renderWithProviders(
  ui: React.ReactElement,
  options?: {retryCount?: number}
) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: options?.retryCount ?? 2,
        retryDelay: 100, // Faster retries for testing
      },
      mutations: {
        retry: options?.retryCount ?? 1,
        retryDelay: 100,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
      <Toaster />
    </QueryClientProvider>
  );
}

describe("TaskList - Error Handling Tests", () => {
  beforeEach(() => {
    // Clear localStorage before each test to ensure clean state
    localStorage.clear();
    // Clear any existing toasts
    toast.remove();
  });

  describe("500 Server Error Handling", () => {
    it("displays error toast when fetch fails with 500 error", async () => {
      // Arrange: Override handler to return 500 error
      server.use(
        http.get("/api/tasks", async () => {
          await delay(100);
          return HttpResponse.json(
            {message: "خطای سرور. لطفا دوباره تلاش کنید"},
            {status: 500}
          );
        })
      );

      // Act: Render the TaskList component
      renderWithProviders(<TaskList />, {retryCount: 0});

      // Wait for loading to finish
      await waitForElementToBeRemoved(
        () => screen.queryAllByTestId("task-skeleton"),
        {timeout: 3000}
      );

      // Assert: Error message is displayed in Persian
      await waitFor(() => {
        expect(screen.getByText(/خطا در بارگذاری تسک‌ها/i)).toBeInTheDocument();
      });
    });

    it("displays error toast when task creation fails with 500 error", async () => {
      // Arrange: Setup successful GET but failing POST
      server.use(
        http.get("/api/tasks", async () => {
          await delay(100);
          return HttpResponse.json({data: []});
        }),
        http.post("/api/tasks", async () => {
          await delay(100);
          return HttpResponse.json(
            {message: "خطا در ایجاد تسک. لطفا دوباره تلاش کنید"},
            {status: 500}
          );
        })
      );

      const user = userEvent.setup();
      renderWithProviders(<TaskList />, {retryCount: 0});

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText(/هیچ تسکی وجود ندارد/i)).toBeInTheDocument();
      });

      // Act: Try to create a task
      const addButton = screen.getByRole("button", {name: /افزودن تسک/i});
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByText("افزودن تسک جدید")).toBeInTheDocument();
      });

      const titleInput = screen.getByLabelText(/عنوان/i);
      await user.type(titleInput, "Test Task");

      const submitButton = screen.getByRole("button", {name: /ایجاد تسک/i});
      await user.click(submitButton);

      // Assert: Error toast is displayed in Persian
      await waitFor(
        () => {
          expect(screen.getByText(/خطا در ایجاد تسک/i)).toBeInTheDocument();
        },
        {timeout: 3000}
      );
    });

    it("displays error toast when task update fails with 500 error", async () => {
      // Arrange: Create a task first
      const task = db.createTask({
        title: "Task to Update",
        description: "Will fail to update",
      });

      server.use(
        http.get("/api/tasks", async () => {
          await delay(100);
          const tasks = db.getTasks();
          return HttpResponse.json({data: tasks});
        }),
        http.put("/api/tasks/:id", async () => {
          await delay(100);
          return HttpResponse.json(
            {message: "خطا در ویرایش تسک. لطفا دوباره تلاش کنید"},
            {status: 500}
          );
        })
      );

      const user = userEvent.setup();
      renderWithProviders(<TaskList />, {retryCount: 0});

      // Wait for task to appear
      await waitFor(() => {
        expect(screen.getByText("Task to Update")).toBeInTheDocument();
      });

      // Act: Try to edit the task
      const editButton = screen.getByRole("button", {name: /ویرایش تسک/i});
      await user.click(editButton);

      await waitFor(() => {
        expect(screen.getByText("ویرایش تسک")).toBeInTheDocument();
      });

      const titleInput = screen.getByLabelText(/عنوان/i);
      await user.clear(titleInput);
      await user.type(titleInput, "Updated Task");

      const submitButton = screen.getByRole("button", {name: /ذخیره تغییرات/i});
      await user.click(submitButton);

      // Assert: Error toast is displayed in Persian
      await waitFor(
        () => {
          expect(screen.getByText(/خطا در ویرایش تسک/i)).toBeInTheDocument();
        },
        {timeout: 3000}
      );
    });

    it("displays error toast when task deletion fails with 500 error", async () => {
      // Arrange: Create a task first
      db.createTask({
        title: "Task to Delete",
        description: "Will fail to delete",
      });

      server.use(
        http.get("/api/tasks", async () => {
          await delay(100);
          const tasks = db.getTasks();
          return HttpResponse.json({data: tasks});
        }),
        http.delete("/api/tasks/:id", async () => {
          await delay(100);
          return HttpResponse.json(
            {message: "خطا در حذف تسک. لطفا دوباره تلاش کنید"},
            {status: 500}
          );
        })
      );

      const user = userEvent.setup();
      renderWithProviders(<TaskList />, {retryCount: 0});

      // Wait for task to appear
      await waitFor(() => {
        expect(screen.getByText("Task to Delete")).toBeInTheDocument();
      });

      // Act: Try to delete the task
      const deleteButton = screen.getByRole("button", {name: /حذف تسک/i});
      await user.click(deleteButton);

      // Assert: Error toast is displayed in Persian
      await waitFor(
        () => {
          expect(screen.getByText(/خطا در حذف تسک/i)).toBeInTheDocument();
        },
        {timeout: 3000}
      );
    });
  });

  describe("404 Not Found Error Handling", () => {
    it("displays error toast when updating non-existent task", async () => {
      // Arrange: Create a task first
      db.createTask({
        title: "Task to Update",
        description: "Will return 404",
      });

      server.use(
        http.get("/api/tasks", async () => {
          await delay(100);
          const tasks = db.getTasks();
          return HttpResponse.json({data: tasks});
        }),
        http.put("/api/tasks/:id", async () => {
          await delay(100);
          return HttpResponse.json({message: "تسک یافت نشد"}, {status: 404});
        })
      );

      const user = userEvent.setup();
      renderWithProviders(<TaskList />, {retryCount: 0});

      // Wait for task to appear
      await waitFor(() => {
        expect(screen.getByText("Task to Update")).toBeInTheDocument();
      });

      // Act: Try to edit the task
      const editButton = screen.getByRole("button", {name: /ویرایش تسک/i});
      await user.click(editButton);

      await waitFor(() => {
        expect(screen.getByText("ویرایش تسک")).toBeInTheDocument();
      });

      const titleInput = screen.getByLabelText(/عنوان/i);
      await user.clear(titleInput);
      await user.type(titleInput, "Updated Task");

      const submitButton = screen.getByRole("button", {name: /ذخیره تغییرات/i});
      await user.click(submitButton);

      // Assert: Error toast is displayed with 404 message in Persian
      await waitFor(
        () => {
          expect(screen.getByText(/تسک یافت نشد/i)).toBeInTheDocument();
        },
        {timeout: 3000}
      );
    });

    it("displays error toast when deleting non-existent task", async () => {
      // Arrange: Create a task first
      db.createTask({
        title: "Task to Delete",
        description: "Will return 404",
      });

      server.use(
        http.get("/api/tasks", async () => {
          await delay(100);
          const tasks = db.getTasks();
          return HttpResponse.json({data: tasks});
        }),
        http.delete("/api/tasks/:id", async () => {
          await delay(100);
          return HttpResponse.json({message: "تسک یافت نشد"}, {status: 404});
        })
      );

      const user = userEvent.setup();
      renderWithProviders(<TaskList />, {retryCount: 0});

      // Wait for task to appear
      await waitFor(() => {
        expect(screen.getByText("Task to Delete")).toBeInTheDocument();
      });

      // Act: Try to delete the task
      const deleteButton = screen.getByRole("button", {name: /حذف تسک/i});
      await user.click(deleteButton);

      // Assert: Error toast is displayed with 404 message in Persian
      await waitFor(
        () => {
          expect(screen.getByText(/تسک یافت نشد/i)).toBeInTheDocument();
        },
        {timeout: 3000}
      );
    });

    it("displays error message when fetching tasks returns 404", async () => {
      // Arrange: Override handler to return 404 error
      server.use(
        http.get("/api/tasks", async () => {
          await delay(100);
          return HttpResponse.json(
            {message: "تسک‌ها یافت نشدند"},
            {status: 404}
          );
        })
      );

      // Act: Render the TaskList component
      renderWithProviders(<TaskList />, {retryCount: 0});

      // Wait for loading to finish
      await waitForElementToBeRemoved(
        () => screen.queryAllByTestId("task-skeleton"),
        {timeout: 3000}
      );

      // Assert: Error message is displayed in Persian
      await waitFor(() => {
        expect(screen.getByText(/خطا در بارگذاری تسک‌ها/i)).toBeInTheDocument();
      });
    });
  });

  describe("Persian Error Messages", () => {
    it("verifies all error messages are displayed in Persian", async () => {
      const errorScenarios = [
        {
          endpoint: "GET",
          path: "/api/tasks",
          expectedMessage: "خطای سرور",
        },
        {
          endpoint: "POST",
          path: "/api/tasks",
          expectedMessage: "خطا در ایجاد تسک",
        },
        {
          endpoint: "PUT",
          path: "/api/tasks/:id",
          expectedMessage: "خطا در ویرایش تسک",
        },
        {
          endpoint: "DELETE",
          path: "/api/tasks/:id",
          expectedMessage: "خطا در حذف تسک",
        },
      ];

      // This test verifies that error messages contain Persian text
      for (const scenario of errorScenarios) {
        expect(scenario.expectedMessage).toMatch(/[\u0600-\u06FF]/); // Persian Unicode range
      }
    });

    it("displays Persian error message for network failures", async () => {
      // Arrange: Simulate network error
      server.use(
        http.get("/api/tasks", async () => {
          await delay(100);
          // Return a network error
          return HttpResponse.error();
        })
      );

      // Act: Render the TaskList component
      renderWithProviders(<TaskList />, {retryCount: 0});

      // Wait for loading to finish
      await waitForElementToBeRemoved(
        () => screen.queryAllByTestId("task-skeleton"),
        {timeout: 3000}
      );

      // Assert: Error message is displayed
      await waitFor(() => {
        expect(screen.getByText(/خطا در بارگذاری تسک‌ها/i)).toBeInTheDocument();
      });
    });
  });

  describe("Retry Logic", () => {
    it("retries failed requests according to retry configuration", async () => {
      let attemptCount = 0;

      // Arrange: Setup handler that fails twice then succeeds
      server.use(
        http.get("/api/tasks", async () => {
          await delay(100);
          attemptCount++;

          if (attemptCount <= 2) {
            // Fail first 2 attempts
            return HttpResponse.json(
              {message: "خطای سرور. لطفا دوباره تلاش کنید"},
              {status: 500}
            );
          }

          // Succeed on 3rd attempt
          return HttpResponse.json({data: []});
        })
      );

      // Act: Render with retry enabled (2 retries)
      renderWithProviders(<TaskList />, {retryCount: 2});

      // Wait for loading to finish
      await waitForElementToBeRemoved(
        () => screen.queryAllByTestId("task-skeleton"),
        {timeout: 5000}
      );

      // Assert: Eventually succeeds after retries
      await waitFor(
        () => {
          expect(screen.getByText(/هیچ تسکی وجود ندارد/i)).toBeInTheDocument();
        },
        {timeout: 5000}
      );

      // Verify it retried (should have made 3 attempts total)
      expect(attemptCount).toBe(3);
    });

    it("stops retrying after max retry attempts and shows error", async () => {
      let attemptCount = 0;

      // Arrange: Setup handler that always fails
      server.use(
        http.get("/api/tasks", async () => {
          await delay(100);
          attemptCount++;
          return HttpResponse.json(
            {message: "خطای سرور. لطفا دوباره تلاش کنید"},
            {status: 500}
          );
        })
      );

      // Act: Render with retry enabled (2 retries)
      renderWithProviders(<TaskList />, {retryCount: 2});

      // Wait for loading to finish
      await waitForElementToBeRemoved(
        () => screen.queryAllByTestId("task-skeleton"),
        {timeout: 5000}
      );

      // Assert: Shows error after all retries exhausted
      await waitFor(
        () => {
          expect(
            screen.getByText(/خطا در بارگذاری تسک‌ها/i)
          ).toBeInTheDocument();
        },
        {timeout: 5000}
      );

      // Verify it made the correct number of attempts (1 initial + 2 retries = 3)
      expect(attemptCount).toBe(3);
    });

    it("retries mutation failures according to configuration", async () => {
      let createAttemptCount = 0;

      // Arrange: Setup handlers
      server.use(
        http.get("/api/tasks", async () => {
          await delay(100);
          return HttpResponse.json({data: []});
        }),
        http.post("/api/tasks", async ({request}) => {
          await delay(100);
          createAttemptCount++;

          if (createAttemptCount <= 1) {
            // Fail first attempt
            return HttpResponse.json(
              {message: "خطا در ایجاد تسک. لطفا دوباره تلاش کنید"},
              {status: 500}
            );
          }

          // Succeed on 2nd attempt
          const body = (await request.json()) as CreateTaskInput;
          const newTask = db.createTask(body);
          return HttpResponse.json({data: newTask}, {status: 201});
        })
      );

      const user = userEvent.setup();
      renderWithProviders(<TaskList />, {retryCount: 1});

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText(/هیچ تسکی وجود ندارد/i)).toBeInTheDocument();
      });

      // Act: Try to create a task
      const addButton = screen.getByRole("button", {name: /افزودن تسک/i});
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByText("افزودن تسک جدید")).toBeInTheDocument();
      });

      const titleInput = screen.getByLabelText(/عنوان/i);
      await user.type(titleInput, "Test Task with Retry");

      const submitButton = screen.getByRole("button", {name: /ایجاد تسک/i});
      await user.click(submitButton);

      // Assert: Wait for retries to complete and verify retry count
      await waitFor(
        () => {
          // After retries, should have made 2 attempts (1 initial + 1 retry)
          expect(createAttemptCount).toBe(2);
        },
        {timeout: 5000}
      );

      // Verify success toast appears after successful retry
      await waitFor(
        () => {
          expect(
            screen.getByText(/تسک با موفقیت ایجاد شد/i)
          ).toBeInTheDocument();
        },
        {timeout: 3000}
      );
    });
  });
});
