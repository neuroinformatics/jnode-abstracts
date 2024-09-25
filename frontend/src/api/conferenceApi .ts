import ky from 'ky';
import { AbstractSimpleEntity } from '../entities/abstract';
import { ApiSuccessResponse } from '../entities/api';
import { ConferenceEntity, ConferenceSimpleEntity } from '../entities/conference';

export const ApiConferenceList = async (
  shortName: string | null,
  signal: AbortSignal,
): Promise<ConferenceSimpleEntity[]> => {
  // status code: 200
  const searchParams = new URLSearchParams();
  if (shortName != null) {
    searchParams.set('shortName', shortName);
  }
  const response = await ky.get<ConferenceSimpleEntity[]>('/api/conferences', { searchParams, signal }).json();
  return response;
};

export const ApiConferenceRetrieve = async (uuid: string, signal: AbortSignal): Promise<ConferenceEntity> => {
  // status code: 200
  const response = await ky.get<ConferenceEntity>(`/api/conferences/${uuid}`, { signal }).json();
  return response;
};

export const ApiConferenceAbstractList = async (uuid: string, signal: AbortSignal): Promise<AbstractSimpleEntity[]> => {
  // status code: 200
  const response = await ky.get<AbstractSimpleEntity[]>(`/api/conferences/${uuid}/abstracts`, { signal }).json();
  return response;
};

export const ApiConferenceOwnersUpdate = async (
  uuid: string,
  owners: string[],
  signal: AbortSignal,
): Promise<ApiSuccessResponse> => {
  // status code: 200
  const formData = new FormData();
  owners.forEach((owner) => {
    formData.append(`owners`, owner);
  });
  const response = await ky
    .put<ApiSuccessResponse>(`/api/conferences/${uuid}/owners`, { body: formData, signal })
    .json();
  return response;
};
