import type { ConfigEntity } from '../entities/config';
import api from './client';

export const ApiConfigRetrieve = async (signal: AbortSignal): Promise<ConfigEntity> => {
  // status code: 200
  const response = await api.get<ConfigEntity>('/api/config', { signal }).json();
  return response;
};
