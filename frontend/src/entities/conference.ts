import type { UserSimpleEntity } from './user';

export interface BannerEntity {
  uuid: string;
  type: 'thumbnail' | 'logo';
}
export interface TopicEntity {
  uuid: string;
  position: number;
  topic: string;
}

export interface AbstractGroupEntity {
  uuid: string | null;
  prefix: number;
  shortName: string;
  name: string;
}

export interface ConferenceSimpleEntity {
  uuid: string;
  isOpen: boolean;
  isPublished: boolean;
  isActive: boolean;
  name: string;
  shortName: string;
  conferenceGroup: string | null;
  cite: string | null;
  startDate: string; // ISO8601
  endDate: string; // ISO8601
  deadline: string; // ISO8601
  logo: string | null;
  thumbnail: string | null;
  link: string | null;
  description: string;
  banners: BannerEntity[];
  isOwner: boolean;
}

export interface ConferenceEntity extends ConferenceSimpleEntity {
  iosApp: string | null;
  notice: string | null;
  hasPresentationPrefs: boolean;
  abstractMaxLength: number;
  abstractMaxFigures: number;
  geo: string | null;
  schedule: string | null;
  topics: TopicEntity[];
  abstractGroups: AbstractGroupEntity[];
  info: string | null;
  owners: UserSimpleEntity[] | null;
  ctime: string; // ISO8601
  mtime: string; // ISO8601
}
