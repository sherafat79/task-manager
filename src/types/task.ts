/**
 * Task entity representing a to-do item
 */
export interface Task {
  /** Unique identifier (UUID v4) */
  id: string;
  /** Task title (max 200 characters) */
  title: string;
  /** Task description (max 1000 characters) */
  description: string;
  /** Completion status */
  completed: boolean;
  /** ISO 8601 timestamp of creation */
  createdAt: string;
  /** ISO 8601 timestamp of last update */
  updatedAt: string;
}

/**
 * Input data for creating a new task
 */
export interface CreateTaskInput {
  /** Task title (required, max 200 characters) */
  title: string;
  /** Task description (optional, max 1000 characters) */
  description: string;
}

/**
 * Input data for updating an existing task
 * All fields are optional to support partial updates
 */
export interface UpdateTaskInput {
  /** Updated task title */
  title?: string;
  /** Updated task description */
  description?: string;
  /** Updated completion status */
  completed?: boolean;
}
