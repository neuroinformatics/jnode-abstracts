import { arrayIncludes } from '../common/utilities';

export const ApiAsyncStatus = {
  initializing: 0,
  idle: 1,
  loading: 2,
  failed: 3,
} as const;
export type ApiAsyncStatuses = (typeof ApiAsyncStatus)[keyof typeof ApiAsyncStatus];

export interface ApiActionState {
  type: string | null;
  error: string | null;
  status: ApiAsyncStatuses;
}

export interface ApiExceptionResponse {
  timestamp: string; // ISO8601
  code: number;
  message: string;
  path: string;
}

export interface ApiSuccessResponse {
  message: string;
}

export const isApiPreparing = (state: ApiActionState) => {
  return arrayIncludes([ApiAsyncStatus.initializing, ApiAsyncStatus.loading], state.status);
};

export const isApiFailed = (state: ApiActionState) => {
  return state.status === ApiAsyncStatus.failed;
};
