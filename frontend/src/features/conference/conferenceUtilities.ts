import dayjs from 'dayjs';
import { ConferenceSimpleEntity } from '../../entities/conference';

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
