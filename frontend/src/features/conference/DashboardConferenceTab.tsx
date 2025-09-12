import type { ConferenceEntity } from '../../entities/conference';

export const TABS = ['general', 'groups', 'maps', 'schedule', 'info', 'owner'] as const;
export type TAB = (typeof TABS)[number];

export interface DashboardConferenceTabProps {
  conference: ConferenceEntity;
}
