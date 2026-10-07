import type { ApiSuccessResponse } from '../entities/api';
import type { UserEntity } from '../entities/user';
import api from './client';

export const ApiUsersLogin = async (
  username: string,
  password: string,
  signal: AbortSignal,
): Promise<ApiSuccessResponse> => {
  // status code: 200
  const formData = new FormData();
  formData.append('username', username);
  formData.append('password', password);
  const response = await api.post<ApiSuccessResponse>('/api/login', { body: formData, signal }).json();
  return response;
};

export const ApiUsersLogout = async (signal: AbortSignal): Promise<ApiSuccessResponse> => {
  // status code: 200
  const response = await api.post<ApiSuccessResponse>('/api/logout', { signal }).json();
  return response;
};

export const ApiUsersCurrent = async (signal: AbortSignal): Promise<UserEntity> => {
  // status code: 200
  const response = await api.get<UserEntity>('/api/users/current', { signal }).json();
  return response;
};

export const ApiUsersExists = async (email: string, signal: AbortSignal): Promise<ApiSuccessResponse> => {
  // status code: 200
  const searchParams = new URLSearchParams();
  searchParams.set('email', email);
  const response = await api.get<ApiSuccessResponse>('/api/users/exists', { searchParams, signal }).json();
  return response;
};

export const ApiUsersRequestPasswordReset = async (email: string, signal: AbortSignal): Promise<ApiSuccessResponse> => {
  // status code: 200
  const formData = new FormData();
  formData.append('email', email);
  const response = await api
    .post<ApiSuccessResponse>(`/api/users/password/reset/request`, { body: formData, signal })
    .json();
  return response;
};

export const ApiUsersResetPassword = async (token: string, signal: AbortSignal): Promise<ApiSuccessResponse> => {
  // status code: 200
  const formData = new FormData();
  formData.append('token', token);
  const response = await api.post<ApiSuccessResponse>(`/api/users/password/reset`, { body: formData, signal }).json();
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
  const response = await api.put<ApiSuccessResponse>(`/api/users/${uuid}/password`, { body: formData, signal }).json();
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
  const response = await api.put<ApiSuccessResponse>(`/api/users/${uuid}/email`, { body: formData, signal }).json();
  return response;
};

export const ApiUsersList = async (signal: AbortSignal): Promise<UserEntity[]> => {
  // status code: 200
  const response = await api.get<UserEntity[]>('/api/users', { signal }).json();
  return response;
};

export const ApiUsersCreate = async (
  email: string,
  firstName: string,
  lastName: string,
  signal: AbortSignal,
): Promise<UserEntity> => {
  // status code: 200
  const formData = new FormData();
  formData.append('email', email);
  formData.append('firstName', firstName);
  formData.append('lastName', lastName);
  const response = await api.post<UserEntity>('/api/users', { body: formData, signal }).json();
  return response;
};

export const ApiUsersUpdate = async (
  uuid: string,
  firstName: string,
  lastName: string,
  isActive: boolean,
  signal: AbortSignal,
): Promise<UserEntity> => {
  // status code: 200
  const formData = new FormData();
  formData.append('firstName', firstName);
  formData.append('lastName', lastName);
  formData.append('isActive', isActive ? '1' : '0');
  const response = await api.put<UserEntity>(`/api/users/${uuid}`, { body: formData, signal }).json();
  return response;
};
