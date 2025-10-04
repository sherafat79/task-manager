/**
 * API error response structure
 * Used for consistent error handling across the application
 */
export interface ApiError {
  /** HTTP status code */
  status: number;
  /** Error message (in Persian for user-facing errors) */
  message: string;
  /** Optional error code for programmatic handling */
  code?: string;
}

/**
 * Generic API response wrapper
 * Provides consistent structure for successful API responses
 */
export interface ApiResponse<T> {
  /** Response data payload */
  data: T;
  /** Optional success message */
  message?: string;
}
