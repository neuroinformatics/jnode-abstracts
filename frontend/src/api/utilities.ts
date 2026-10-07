import { HTTPError } from 'ky';
import type { ApiExceptionResponse } from '../entities/api';

export const getApiErrorMessage = async (e: unknown): Promise<string> => {
  const error = e as Error | HTTPError;
  if (error.name === 'AbortError') {
    return 'Request cancelled by the user';
  }
  if (error instanceof HTTPError) {
    // ky reads the error body into `data`, so the response body is already consumed
    const data = error.data as ApiExceptionResponse | undefined;
    return data?.message ?? error.message;
  }
  return error.message;
};

export const getApiErrorStatusCode = (e: unknown): number => {
  const error = e as Error | HTTPError;
  if (error.name === 'AbortError') {
    return 0;
  }
  if (error instanceof HTTPError) {
    return error.response.status;
  }
  return -1;
};
