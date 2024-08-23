import ky from 'ky';
import { ApiAuthResponse } from '../entities/api';
import { UserEntity } from '../entities/users';

export const ApiUsersLogin = async (
  username: string,
  password: string,
  signal: AbortSignal,
): Promise<ApiAuthResponse> => {
  // status code: 200
  const formData = new FormData();
  formData.append('username', username);
  formData.append('password', password);
  const response = await ky.post<ApiAuthResponse>('/api/login', { body: formData, signal }).json();
  return response;
};

export const ApiUsersLogout = async (signal: AbortSignal): Promise<ApiAuthResponse> => {
  // status code: 200
  const response = await ky.post<ApiAuthResponse>('/api/logout', { signal }).json();
  return response;
};

export const ApiUsersCurrent = async (signal: AbortSignal): Promise<UserEntity> => {
  // status code: 200
  const response = await ky.get<UserEntity>('/api/users/current', { signal }).json();
  return response;
};
