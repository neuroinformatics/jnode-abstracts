import type { AbstractEntity, StateLogState } from '../entities/abstract';
import type { ApiSuccessResponse } from '../entities/api';
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

// content of an abstract sent as JSON; authors refer to affiliations by index
export interface AbstractEditParams {
  title: string;
  text: string;
  topic: string | null;
  acknowledgements: string | null;
  conflictOfInterest: string | null;
  isTalk: boolean;
  reasonForTalk: string | null;
  abstractGroupUuid: string | null;
  authors: {
    firstName: string;
    middleName: string;
    lastName: string;
    mail: string;
    affiliations: number[];
  }[];
  affiliations: { department: string; section: string; address: string; country: string }[];
  references: { text: string; doi: string; link: string }[];
}

export const ApiAbstractOwnList = async (signal: AbortSignal): Promise<AbstractEntity[]> => {
  // status code: 200
  const response = await api.get<AbstractEntity[]>('/api/users/current/abstracts', { signal }).json();
  return response;
};

export const ApiAbstractCreate = async (
  conferenceUuid: string,
  content: AbstractEditParams,
  signal: AbortSignal,
): Promise<AbstractEntity> => {
  // status code: 200
  const response = await api
    .post<AbstractEntity>(`/api/conferences/${conferenceUuid}/abstracts`, { json: content, signal })
    .json();
  return response;
};

export const ApiAbstractUpdate = async (
  uuid: string,
  content: AbstractEditParams,
  signal: AbortSignal,
): Promise<AbstractEntity> => {
  // status code: 200
  const response = await api.put<AbstractEntity>(`/api/abstracts/${uuid}`, { json: content, signal }).json();
  return response;
};

export const ApiAbstractDelete = async (uuid: string, signal: AbortSignal): Promise<ApiSuccessResponse> => {
  // status code: 200
  const response = await api.delete<ApiSuccessResponse>(`/api/abstracts/${uuid}`, { signal }).json();
  return response;
};

export const ApiAbstractOwnersUpdate = async (
  uuid: string,
  owners: string[],
  signal: AbortSignal,
): Promise<AbstractEntity> => {
  // status code: 200
  const formData = new FormData();
  owners.forEach((owner) => {
    formData.append('owners', owner);
  });
  const response = await api.put<AbstractEntity>(`/api/abstracts/${uuid}/owners`, { body: formData, signal }).json();
  return response;
};

export const ApiAbstractFigureUpload = async (
  uuid: string,
  file: File,
  caption: string,
  signal: AbortSignal,
): Promise<AbstractEntity> => {
  // status code: 200
  const formData = new FormData();
  formData.append('file', file);
  formData.append('caption', caption);
  const response = await api.post<AbstractEntity>(`/api/abstracts/${uuid}/figures`, { body: formData, signal }).json();
  return response;
};

export const ApiFigureUpdate = async (uuid: string, caption: string, signal: AbortSignal): Promise<AbstractEntity> => {
  // status code: 200
  const formData = new FormData();
  formData.append('caption', caption);
  const response = await api.put<AbstractEntity>(`/api/figures/${uuid}`, { body: formData, signal }).json();
  return response;
};

export const ApiFigureDelete = async (uuid: string, signal: AbortSignal): Promise<AbstractEntity> => {
  // status code: 200
  const response = await api.delete<AbstractEntity>(`/api/figures/${uuid}`, { signal }).json();
  return response;
};
