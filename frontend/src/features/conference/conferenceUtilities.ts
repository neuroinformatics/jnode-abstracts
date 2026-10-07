import dayjs from 'dayjs';
import type { AbstractSimpleEntity, AffiliationEntity, AuthorEntity, FigureEntity } from '../../entities/abstract';
import type { AbstractGroupEntity, ConferenceEntity, ConferenceSimpleEntity } from '../../entities/conference';

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

export const getBannerUrl = (uuid: string): string => {
  return `/api/banners/${uuid}/image`;
};

export const getLogoUuid = (conference: ConferenceSimpleEntity): string | null => {
  const banner = conference.banners.filter((banner) => banner.type === 'logo');
  return banner.length === 1 ? banner[0].uuid : null;
};

export const getLogoUrl = (conference: ConferenceSimpleEntity): string | null => {
  const uuid = getLogoUuid(conference);
  return uuid != null ? getBannerUrl(uuid) : conference.logo;
};

export const getThumbnailUuid = (conference: ConferenceSimpleEntity): string | null => {
  const banner = conference.banners.filter((banner) => banner.type === 'thumbnail');
  return banner.length === 1 ? banner[0].uuid : null;
};

export const getThumbnailUrl = (conference: ConferenceSimpleEntity): string | null => {
  const uuid = getThumbnailUuid(conference);
  return uuid != null ? getBannerUrl(uuid) : conference.thumbnail;
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

export const getAbstractUrl = (conference: ConferenceEntity, abstract: AbstractSimpleEntity): string => {
  return abstract != null ? `/conference/${conference.shortName}/abstracts#/uuid/${abstract.uuid}` : '';
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

export const formatAbstractAuthorsCitation = (abstract: AbstractSimpleEntity): string => {
  return abstract.authors.map((author) => formatAuthorCitation(author)).join(', ');
};

export const formatAuthorName = (author: AuthorEntity): string => {
  return `${author.firstName} ${author.middleName ? `${author.middleName} ` : ''}${author.lastName}`;
};

export const formatAuthorAffiliations = (author: AuthorEntity, affiliations: AffiliationEntity[]): string => {
  const positions = author.affiliationUuids
    .map((uuid) => (affiliations.find((a) => a.uuid === uuid)?.position ?? -1) + 1)
    .filter((p) => p > 0)
    .sort();
  return positions.join(', ');
};

export const formatAffiliation = (affiliation: AffiliationEntity): string => {
  return [affiliation.department, affiliation.section, affiliation.address, affiliation.country]
    .filter((a) => a != null)
    .join(', ');
};

export const getFigureUrl = (figure: FigureEntity): string => {
  return `/api/figures/${figure.uuid}/image`;
};

export const formatAbstractCopyright = (conference: ConferenceEntity, abstract: AbstractSimpleEntity): string => {
  const year = dayjs(conference.startDate).year();
  return `© (${year}) ${formatAbstractAuthorsCitation(abstract)}`;
};

export const formatAbstractCitation = (conference: ConferenceEntity, abstract: AbstractSimpleEntity): string => {
  const year = dayjs(conference.startDate).year();
  return `${formatAbstractAuthorsCitation(abstract)} (${year}) ${abstract.title}. ${conference.name}.${
    abstract.doi != null ? ` https://doi.org/${abstract.doi}` : ''
  }`;
};
