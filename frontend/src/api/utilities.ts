import { HTTPError } from 'ky';
import { ApiExceptionResponse } from '../entities/api';

export const getApiErrorMessage = (e: unknown): string => {
  const error = e as Error | HTTPError<ApiExceptionResponse>;
  if (error.name === 'AbortError') {
    return 'Request cancelled by the user';
  }
  return error.message;
};

export const getApiErrorStatusCode = (e: unknown): number => {
  const error = e as Error | HTTPError;
  if (error.name === 'AbortError') {
    return 0;
  }
  return error instanceof HTTPError ? error.response?.status ?? -1 : -1;
};
