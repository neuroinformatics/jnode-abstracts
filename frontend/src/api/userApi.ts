import ky from 'ky';
import type { ApiSuccessResponse } from '../entities/api';
import type { UserEntity } from '../entities/user';

export const ApiUsersLogin = async (
  username: string,
  password: string,
  signal: AbortSignal,
): Promise<ApiSuccessResponse> => {
  // status code: 200
  const formData = new FormData();
  formData.append('username', username);
  formData.append('password', password);
  const response = await ky.post<ApiSuccessResponse>('/api/login', { body: formData, signal }).json();
  return response;
};

export const ApiUsersLogout = async (signal: AbortSignal): Promise<ApiSuccessResponse> => {
  // status code: 200
  const response = await ky.post<ApiSuccessResponse>('/api/logout', { signal }).json();
  return response;
};

export const ApiUsersCurrent = async (signal: AbortSignal): Promise<UserEntity> => {
  // status code: 200
  const response = await ky.get<UserEntity>('/api/users/current', { signal }).json();
  return response;
};

export const ApiUsersExists = async (email: string, signal: AbortSignal): Promise<ApiSuccessResponse> => {
  // status code: 200
  const searchParams = new URLSearchParams();
  searchParams.set('email', email);
  const response = await ky.get<ApiSuccessResponse>('/api/users/exists', { searchParams, signal }).json();
  return response;
};

export const ApiUsersRequestPasswordReset = async (email: string, signal: AbortSignal): Promise<ApiSuccessResponse> => {
  // status code: 200
  const formData = new FormData();
  formData.append('email', email);
  const response = await ky
    .post<ApiSuccessResponse>(`/api/users/password/reset/request`, { body: formData, signal })
    .json();
  return response;
};

export const ApiUsersResetPassword = async (token: string, signal: AbortSignal): Promise<ApiSuccessResponse> => {
  // status code: 200
  const formData = new FormData();
  formData.append('token', token);
  const response = await ky.post<ApiSuccessResponse>(`/api/users/password/reset`, { body: formData, signal }).json();
  return response;
};

export const ApiUsersChangePassword = async (
  uuid: string,
  oldPassword: string,
  newPassword: string,
  signal: AbortSignal,
): Promise<ApiSuccessResponse> => {
  // status code: 200
  const formData = new FormData();
  formData.append('oldPassword', oldPassword);
  formData.append('newPassword', newPassword);
  const response = await ky.put<ApiSuccessResponse>(`/api/users/${uuid}/password`, { body: formData, signal }).json();
  return response;
};

export const ApiUsersChangeEmail = async (
  uuid: string,
  email: string,
  password: string,
  signal: AbortSignal,
): Promise<ApiSuccessResponse> => {
  // status code: 200
  const formData = new FormData();
  formData.append('email', email);
  formData.append('password', password);
  const response = await ky.put<ApiSuccessResponse>(`/api/users/${uuid}/email`, { body: formData, signal }).json();
  return response;
};
