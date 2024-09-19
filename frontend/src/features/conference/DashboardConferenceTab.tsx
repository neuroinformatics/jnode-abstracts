import { ConferenceEntity } from '../../entities/conference';

export type TABS = 'general' | 'groups' | 'maps' | 'schedule' | 'info' | 'owner';

export interface DashboardConferenceTabProps {
  conference: ConferenceEntity;
}
