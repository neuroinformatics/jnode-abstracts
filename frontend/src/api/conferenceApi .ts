import type { AbstractSimpleEntity } from '../entities/abstract';
import type { ApiSuccessResponse } from '../entities/api';
import type {
  AbstractGroupEntity,
  ConferenceEntity,
  ConferenceSimpleEntity,
  TopicEntity,
} from '../entities/conference';
import api from './client';

export const ApiConferenceList = async (
  shortName: string | null,
  signal: AbortSignal,
): Promise<ConferenceSimpleEntity[]> => {
  // status code: 200
  const searchParams = new URLSearchParams();
  if (shortName != null) {
    searchParams.set('shortName', shortName);
  }
  const response = await api.get<ConferenceSimpleEntity[]>('/api/conferences', { searchParams, signal }).json();
  return response;
};

export const ApiConferenceRetrieve = async (uuid: string, signal: AbortSignal): Promise<ConferenceEntity> => {
  // status code: 200
  const response = await api.get<ConferenceEntity>(`/api/conferences/${uuid}`, { signal }).json();
  return response;
};

export const ApiConferenceAbstractList = async (uuid: string, signal: AbortSignal): Promise<AbstractSimpleEntity[]> => {
  // status code: 200
  const response = await api.get<AbstractSimpleEntity[]>(`/api/conferences/${uuid}/abstracts`, { signal }).json();
  return response;
};

export const ApiConferenceUpdate = async (
  uuid: string,
  isOpen: boolean,
  isPublished: boolean,
  isActive: boolean,
  name: string,
  shortName: string,
  conferenceGroup: string,
  cite: string,
  startDate: string,
  endDate: string,
  deadline: string,
  logoUuid: string | null,
  logoFile: File | null,
  logoLink: string,
  thumbnailUuid: string | null,
  thumbnailFile: File | null,
  thumbnailLink: string,
  iosApp: string,
  link: string,
  description: string,
  notice: string,
  hasPresentationPrefs: boolean,
  topics: TopicEntity[],
  abstractMaxLength: number,
  abstractMaxFigures: number,
  signal: AbortSignal,
): Promise<ApiSuccessResponse> => {
  // status code: 200
  const formData = new FormData();
  formData.append('isOpen', isOpen ? '1' : '0');
  formData.append('isPublished', isPublished ? '1' : '0');
  formData.append('isActive', isActive ? '1' : '0');
  formData.append('name', name);
  formData.append('shortName', shortName);
  if (conferenceGroup.length > 0) {
    formData.append('conferenceGroup', conferenceGroup);
  }
  if (cite.length > 0) {
    formData.append('cite', cite);
  }
  formData.append('startDate', startDate);
  formData.append('endDate', endDate);
  formData.append('deadline', deadline);
  if (logoUuid != null) {
    formData.append('logoUuid', logoUuid);
  }
  if (logoFile != null) {
    formData.append('logoFile', logoFile);
  }
  if (logoLink.length > 0) {
    formData.append('logoLink', logoLink);
  }
  if (thumbnailUuid != null) {
    formData.append('thumbnailUuid', thumbnailUuid);
  }
  if (thumbnailFile != null) {
    formData.append('thumbnailFile', thumbnailFile);
  }
  if (thumbnailLink.length > 0) {
    formData.append('thumbnailLink', thumbnailLink);
  }
  if (iosApp.length > 0) {
    formData.append('iosApp', iosApp);
  }
  if (link.length > 0) {
    formData.append('link', link);
  }
  if (description.length > 0) {
    formData.append('description', description);
  }
  if (notice.length > 0) {
    formData.append('notice', notice);
  }
  formData.append('hasPresentationPrefs', hasPresentationPrefs ? '1' : '0');
  topics.forEach((topic, idx) => {
    if (topic.uuid.length > 0) {
      formData.append(`topics[${idx}].uuid`, topic.uuid);
    }
    formData.append(`topics[${idx}].position`, String(topic.position));
    formData.append(`topics[${idx}].topic`, topic.topic);
  });
  formData.append('abstractMaxLength', String(abstractMaxLength));
  formData.append('abstractMaxFigures', String(abstractMaxFigures));
  const response = await api.put<ApiSuccessResponse>(`/api/conferences/${uuid}`, { body: formData, signal }).json();
  return response;
};

export interface ApiConferenceAbstractGroupsUpdateParams {
  uuid: string;
  abstractGroups: AbstractGroupEntity[];
}
export const ApiConferenceAbstractGroupsUpdate = async (
  params: ApiConferenceAbstractGroupsUpdateParams,
  signal: AbortSignal,
): Promise<ApiSuccessResponse> => {
  // status code: 200
  const { uuid, abstractGroups } = params;
  const formData = new FormData();
  abstractGroups.forEach((abstractGroup, idx) => {
    if (abstractGroup.uuid != null) {
      formData.append(`abstractGroups[${idx}].uuid`, abstractGroup.uuid);
    }
    formData.append(`abstractGroups[${idx}].name`, abstractGroup.name);
    formData.append(`abstractGroups[${idx}].prefix`, String(abstractGroup.prefix));
    formData.append(`abstractGroups[${idx}].shortName`, abstractGroup.shortName);
  });
  const response = await api
    .put<ApiSuccessResponse>(`/api/conferences/${uuid}/abstractGroups`, { body: formData, signal })
    .json();
  return response;
};

export const ApiConferenceGeoUpdate = async (
  uuid: string,
  geo: string,
  signal: AbortSignal,
): Promise<ApiSuccessResponse> => {
  // status code: 200
  const formData = new FormData();
  formData.append('geo', geo);
  const response = await api.put<ApiSuccessResponse>(`/api/conferences/${uuid}/geo`, { body: formData, signal }).json();
  return response;
};

export const ApiConferenceScheduleUpdate = async (
  uuid: string,
  schedule: string,
  signal: AbortSignal,
): Promise<ApiSuccessResponse> => {
  // status code: 200
  const formData = new FormData();
  formData.append('schedule', schedule);
  const response = await api
    .put<ApiSuccessResponse>(`/api/conferences/${uuid}/schedule`, { body: formData, signal })
    .json();
  return response;
};

export const ApiConferenceInfoUpdate = async (
  uuid: string,
  info: string,
  signal: AbortSignal,
): Promise<ApiSuccessResponse> => {
  // status code: 200
  const formData = new FormData();
  formData.append('info', info);
  const response = await api
    .put<ApiSuccessResponse>(`/api/conferences/${uuid}/info`, { body: formData, signal })
    .json();
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
    formData.append('owners', owner);
  });
  const response = await api
    .put<ApiSuccessResponse>(`/api/conferences/${uuid}/owners`, { body: formData, signal })
    .json();
  return response;
};
