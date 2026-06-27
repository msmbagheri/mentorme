export interface ApiSuccess<T> {
  status: "success";
  data: T;
}

export interface ApiErrorDetail {
  path?: string;
  message: string;
}

export interface ApiError {
  status: "error";
  error: {
    code: string;
    message: string;
    timestamp: string;
    details: ApiErrorDetail[];
  };
}

export type ApiResult<T> = ApiSuccess<T> | ApiError;
