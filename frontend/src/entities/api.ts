export const AsyncApiStatus = {
  initial: 0,
  idle: 1,
  loading: 2,
  failed: 3,
} as const;
export type AsyncApiStatuses = (typeof AsyncApiStatus)[keyof typeof AsyncApiStatus];

export interface ActionState {
  error: string | null;
  status: AsyncApiStatuses;
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
