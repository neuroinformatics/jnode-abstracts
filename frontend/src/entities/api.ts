export const ApiAsyncStatus = {
  idle: 0,
  loading: 1,
  failed: 2,
} as const;
export type ApiAsyncStatuses = (typeof ApiAsyncStatus)[keyof typeof ApiAsyncStatus];

export interface ApiActionState {
  error: string | null;
  status: ApiAsyncStatuses;
}

export interface ApiExceptionResponse {
  timestamp: string; // ISO8601
  code: number;
  message: string;
  path: string;
}

export interface ApiAuthResponse {
  message: string;
}
