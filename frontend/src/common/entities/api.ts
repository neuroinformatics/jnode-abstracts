export const AsyncApiStatus = {
  initial: 0,
  idle: 1,
  loading: 2,
  failed: 3,
} as const;
export type AsyncApiStatuses = (typeof AsyncApiStatus)[keyof typeof AsyncApiStatus];

export interface DRFStandardizedErrors {
  type: 'validation_error' | 'client_error' | 'server_error';
  errors: {
    code: string;
    detail: string;
    attr: string | null;
  }[];
}
