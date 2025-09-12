import type { UserSimpleEntity } from './user';

export interface AuthorEntity {
  uuid: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  mail: string | null;
  position: number;
  affiliationUuids: string[];
}

export interface AffiliationEntity {
  uuid: string;
  address: string | null;
  section: string | null;
  department: string | null;
  country: string | null;
  position: number;
}

export interface FigureEntity {
  uuid: string;
  caption: string;
  position: number;
}

export interface ReferenceEntity {
  uuid: string;
  text: string | null;
  doi: string | null;
  link: string | null;
  position: number;
}

export const StateLogStates = [
  'InPreparation',
  'Submitted',
  'InReview',
  'Accepted',
  'Rejected',
  'InRevision',
  'Withdrawn',
] as const;
export type StateLogState = (typeof StateLogStates)[number];

export interface StateLogEntity {
  uuid: string;
  editor: string;
  note: string | null;
  state: StateLogState;
  timestamp: string; // ISO8601
}

export interface AbstractSimpleEntity {
  uuid: string;
  title: string;
  text: string;
  doi: string | null;
  acknowledgements: string | null;
  conflictOfInterest: string | null;
  isTalk: boolean;
  reasonForTalk: string | null;
  sortId: number;
  state: StateLogState;
  topic: string;
  conferenceUuid: string;
  authors: AuthorEntity[];
  affiliations: AffiliationEntity[];
  figures: FigureEntity[];
  references: ReferenceEntity[];
  abstractGroupUuid: string | null;
}

export interface AbstractEntity extends AbstractSimpleEntity {
  ctime: string; // ISO8601
  mtime: string; // ISO8601
  stateLogs: StateLogEntity[];
  owners: UserSimpleEntity[];
}
