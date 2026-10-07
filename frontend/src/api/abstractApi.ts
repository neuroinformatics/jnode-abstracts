import type { AbstractEntity, StateLogState } from '../entities/abstract';
import api from './client';

export const ApiAbstractRetrieve = async (uuid: string, signal: AbortSignal): Promise<AbstractEntity> => {
  // status code: 200
  const response = await api.get<AbstractEntity>(`/api/abstracts/${uuid}`, { signal }).json();
  return response;
};

export const ApiAbstractStateUpdate = async (
  uuid: string,
  state: StateLogState,
  note: string,
  signal: AbortSignal,
): Promise<AbstractEntity> => {
  // status code: 200
  const formData = new FormData();
  formData.append('state', state);
  if (note.length > 0) {
    formData.append('note', note);
  }
  const response = await api.put<AbstractEntity>(`/api/abstracts/${uuid}/state`, { body: formData, signal }).json();
  return response;
};

export const ApiAbstractPublicationUpdate = async (
  uuid: string,
  abstractGroupUuid: string | null,
  num: number,
  doi: string,
  signal: AbortSignal,
): Promise<AbstractEntity> => {
  // status code: 200
  const formData = new FormData();
  if (abstractGroupUuid != null) {
    formData.append('abstractGroupUuid', abstractGroupUuid);
  }
  formData.append('number', String(num));
  if (doi.length > 0) {
    formData.append('doi', doi);
  }
  const response = await api
    .put<AbstractEntity>(`/api/abstracts/${uuid}/publication`, { body: formData, signal })
    .json();
  return response;
};
