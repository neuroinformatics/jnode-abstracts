import { UserSimpleEntity } from './user';

export interface TopicsEntity {
  uuid: string;
  position: number;
  topic: string;
}

export interface AbstractGroupsEntity {
  uuid: string;
  name: string;
  prefix: number;
  shortName: string;
}

export interface ConferenceSimpleEntity {
  uuid: string;
  isOpen: boolean;
  isPublished: boolean;
  isActive: boolean;
  name: string;
  shortName: string;
  cite: string | null;
  startDate: string; // ISO8601
  endDate: string; // ISO8601
  deadline: string; // ISO8601
  logo: string | null;
  link: string | null;
  description: string;
  notice: string | null;
  info: string | null;
  banners: [];
  isOwner: boolean;
}

export interface ConferenceEntity extends ConferenceSimpleEntity {
  thumbnail: string | null;
  iosApp: string | null;
  hasPresentationPrefs: boolean;
  abstractMaxLength: number;
  abstractMaxFigures: number;
  geo: string | null;
  schedule: string | null;
  ctime: string; // ISO8601
  mtime: string; // ISO8601
  topics: TopicsEntity[];
  abstractGroups: AbstractGroupsEntity[];
  owners: UserSimpleEntity[] | null;
}
