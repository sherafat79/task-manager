import {describe, it, expect, beforeEach} from "vitest";
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
import type {CreateTaskInput, UpdateTaskInput} from "@/types/task";

/**
 * Helper function to render components with React Query provider
 */
function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
}

/**
 * Override MSW handlers to disable random error simulation for happy path tests
 */
function setupSuccessHandlers() {
  server.use(
    http.get("/api/tasks", async () => {
      await delay(100); // Reduced delay for faster tests
      const tasks = db.getTasks();
      return HttpResponse.json({data: tasks});
    }),

    http.post("/api/tasks", async ({request}) => {
      await delay(100);
      const body = (await request.json()) as CreateTaskInput;
      const newTask = db.createTask(body);
      return HttpResponse.json({data: newTask}, {status: 201});
    }),

    http.put("/api/tasks/:id", async ({request, params}) => {
      await delay(100);
      const {id} = params;
      const body = (await request.json()) as UpdateTaskInput;
      const updatedTask = db.updateTask(id as string, body);

      if (!updatedTask) {
        return HttpResponse.json({message: "تسک یافت نشد"}, {status: 404});
      }

      return HttpResponse.json({data: updatedTask});
    }),

    http.delete("/api/tasks/:id", async ({params}) => {
      await delay(100);
      const {id} = params;
      const deleted = db.deleteTask(id as string);

      if (!deleted) {
        return HttpResponse.json({message: "تسک یافت نشد"}, {status: 404});
      }

      return HttpResponse.json(
        {message: "تسک با موفقیت حذف شد"},
        {status: 200}
      );
    })
  );
}

describe("TaskList - Happy Path Integration Tests", () => {
  beforeEach(() => {
    // Clear localStorage before each test to ensure clean state
    localStorage.clear();
    // Setup success handlers to disable random error simulation
    setupSuccessHandlers();
  });

  it("displays tasks correctly after successful API fetch", async () => {
    // Arrange: Create some test tasks in the mock database
    db.createTask({
      title: "Test Task 1",
      description: "First test task description",
    });
    db.createTask({
      title: "Test Task 2",
      description: "Second test task description",
    });

    // Act: Render the TaskList component
    renderWithProviders(<TaskList />);

    // Assert: Initially shows loading skeletons
    expect(screen.getAllByTestId("task-skeleton")).toHaveLength(3);

    // Wait for loading to finish and tasks to appear
    await waitForElementToBeRemoved(() =>
      screen.queryAllByTestId("task-skeleton")
    );

    // Assert: Tasks are displayed correctly
    expect(screen.getByText("Test Task 1")).toBeInTheDocument();
    expect(screen.getByText("First test task description")).toBeInTheDocument();
    expect(screen.getByText("Test Task 2")).toBeInTheDocument();
    expect(
      screen.getByText("Second test task description")
    ).toBeInTheDocument();
  });

  it("creates a new task successfully through form submission", async () => {
    // Arrange: Start with empty task list
    const user = userEvent.setup();
    renderWithProviders(<TaskList />);

    // Wait for initial load to complete (empty state)
    await waitFor(() => {
      expect(screen.getByText(/هیچ تسکی وجود ندارد/i)).toBeInTheDocument();
    });

    // Act: Click the add task button
    const addButton = screen.getByRole("button", {name: /افزودن تسک/i});
    await user.click(addButton);

    // Wait for dialog to open
    await waitFor(() => {
      expect(screen.getByText("افزودن تسک جدید")).toBeInTheDocument();
    });

    // Fill in the form
    const titleInput = screen.getByLabelText(/عنوان تسک/i);
    const descriptionInput = screen.getByLabelText(/توضیحات/i);

    await user.type(titleInput, "New Task from Test");
    await user.type(descriptionInput, "This is a test task description");

    // Submit the form
    const submitButton = screen.getByRole("button", {name: /ایجاد تسک/i});
    await user.click(submitButton);

    // Assert: Dialog closes and new task appears in the list
    await waitFor(() => {
      expect(screen.queryByText("افزودن تسک جدید")).not.toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText("New Task from Test")).toBeInTheDocument();
      expect(
        screen.getByText("This is a test task description")
      ).toBeInTheDocument();
    });
  });

  it("deletes a task and removes it from the list", async () => {
    // Arrange: Create a task to delete
    db.createTask({
      title: "Task to Delete",
      description: "This task will be deleted",
    });

    const user = userEvent.setup();
    renderWithProviders(<TaskList />);

    // Wait for task to appear
    await waitFor(() => {
      expect(screen.getByText("Task to Delete")).toBeInTheDocument();
    });

    // Act: Click the delete button
    const deleteButton = screen.getByRole("button", {name: /حذف تسک/i});
    await user.click(deleteButton);

    // Assert: Task is removed from the list
    await waitFor(() => {
      expect(screen.queryByText("Task to Delete")).not.toBeInTheDocument();
    });

    // Verify empty state is shown
    expect(screen.getByText(/هیچ تسکی وجود ندارد/i)).toBeInTheDocument();
  });

  it("toggles task completion status correctly", async () => {
    // Arrange: Create an incomplete task
    db.createTask({
      title: "Task to Toggle",
      description: "This task will be toggled",
    });

    const user = userEvent.setup();
    renderWithProviders(<TaskList />);

    // Wait for task to appear
    await waitFor(() => {
      expect(screen.getByText("Task to Toggle")).toBeInTheDocument();
    });

    // Get the checkbox (it should be unchecked initially)
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).not.toBeChecked();

    // Act: Toggle the task to completed
    await user.click(checkbox);

    // Assert: Checkbox becomes checked
    await waitFor(() => {
      expect(checkbox).toBeChecked();
    });

    // Act: Toggle back to incomplete
    await user.click(checkbox);

    // Assert: Checkbox becomes unchecked again
    await waitFor(() => {
      expect(checkbox).not.toBeChecked();
    });
  });
});
