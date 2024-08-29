import dayjs from 'dayjs';
import { AbstractSimpleEntity, AuthorEntity, FigureEntity } from '../../entities/abstract';
import { AbstractGroupEntity, ConferenceEntity, ConferenceSimpleEntity } from '../../entities/conference';

export const formatDuration = (conference: ConferenceSimpleEntity): string => {
  const { startDate, endDate } = conference;
  if (startDate == null || endDate == null) {
    return '';
  }
  const start = dayjs(startDate);
  const end = dayjs(endDate);
  if (start.year() === end.year()) {
    if (start.month() === end.month()) {
      if (start.date() === end.date()) {
        return start.format('D MMMM YYYY');
      } else {
        return `${start.format('MMMM D')} - ${end.format('D, YYYY')}`;
      }
    } else {
      return `${start.format('MMMM, D')} - ${end.format('MMMM, D, YYYY')}`;
    }
  } else {
    return `${start.format('MMMM, D, YYYY')} - ${end.format('MMMM, D, YYYY')}`;
  }
};

const getBannerUrl = (uuid: string): string => {
  return `/api/banners/${uuid}/image`;
};

export const getLogoUrl = (conference: ConferenceSimpleEntity): string | null => {
  const banner = conference.banners.filter((banner) => banner.type === 'logo');
  return banner.length === 1 ? getBannerUrl(banner[0].uuid) : conference.logo;
};

export const getThumbnailUrl = (conference: ConferenceSimpleEntity): string | null => {
  const banner = conference.banners.filter((banner) => banner.type === 'thumbnail');
  return banner.length === 1 ? getBannerUrl(banner[0].uuid) : conference.thumbnail;
};

export const getAbstractGroup = (conference: ConferenceEntity, uuid: string | null): AbstractGroupEntity | null => {
  return conference.abstractGroups.find((abstractGroup) => abstractGroup.uuid === uuid) ?? null;
};

export const getAbstractId = (conference: ConferenceEntity, abstract: AbstractSimpleEntity): string | null => {
  const gId = (abstract.sortId & 0xffff0000) >> 16;
  const aId = abstract.sortId & 0x0000ffff;
  const abstractGroup = getAbstractGroup(conference, abstract.abstractGroupUuid);
  const shortName = abstractGroup?.prefix === gId ? abstractGroup.shortName : null;
  return shortName != null ? `${shortName} ${aId}` : null;
};

export const formatAuthorCitation = (author: AuthorEntity): string => {
  const makeInitials = (name: string | null): string => {
    return (
      name
        ?.split(' ')
        .map((x) => x[0])
        .join('') ?? ''
    );
  };
  return `${author.lastName} ${makeInitials(author.firstName)}${makeInitials(author.middleName)}`;
};

export const getFigureUrl = (figure: FigureEntity): string | null => {
  return `/api/figures/${figure.uuid}/image`;
};
