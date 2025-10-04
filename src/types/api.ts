export interface ApiError {
  status: number;
  message: string;
  code?: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}
