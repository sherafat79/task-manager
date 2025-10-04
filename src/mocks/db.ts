import type {Task, CreateTaskInput, UpdateTaskInput} from "@/types/task";

/**
 * MockDatabase class that simulates a backend database using localStorage
 * for persistent storage across page refreshes.
 */
class MockDatabase {
  private storageKey = "resilient-task-manager-tasks";

  /**
   * Retrieves all tasks from localStorage
   * @returns Array of tasks
   */
  getTasks(): Task[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Error reading tasks from localStorage:", error);
      return [];
    }
  }

  /**
   * Creates a new task with generated ID and timestamps
   * @param input - Task creation input (title and description)
   * @returns The newly created task
   */
  createTask(input: CreateTaskInput): Task {
    const tasks = this.getTasks();
    const now = new Date().toISOString();

    const newTask: Task = {
      id: crypto.randomUUID(),
      title: input.title,
      description: input.description,
      completed: false,
      createdAt: now,
      updatedAt: now,
    };

    tasks.push(newTask);
    this.saveTasks(tasks);

    return newTask;
  }

  /**
   * Updates an existing task by ID
   * @param id - Task ID to update
   * @param input - Partial task data to update
   * @returns The updated task or null if not found
   */
  updateTask(id: string, input: UpdateTaskInput): Task | null {
    const tasks = this.getTasks();
    const index = tasks.findIndex((t) => t.id === id);

    if (index === -1) {
      return null;
    }

    tasks[index] = {
      ...tasks[index],
      ...input,
      updatedAt: new Date().toISOString(),
    };

    this.saveTasks(tasks);
    return tasks[index];
  }

  /**
   * Deletes a task by ID
   * @param id - Task ID to delete
   * @returns true if task was deleted, false if not found
   */
  deleteTask(id: string): boolean {
    const tasks = this.getTasks();
    const filtered = tasks.filter((t) => t.id !== id);

    if (filtered.length === tasks.length) {
      return false;
    }

    this.saveTasks(filtered);
    return true;
  }

  /**
   * Persists tasks array to localStorage
   * @param tasks - Array of tasks to save
   */
  private saveTasks(tasks: Task[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(tasks));
    } catch (error) {
      console.error("Error saving tasks to localStorage:", error);
    }
  }
}

// Export singleton instance
export const db = new MockDatabase();
