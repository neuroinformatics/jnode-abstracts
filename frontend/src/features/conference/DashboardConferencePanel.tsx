import React from 'react';

import classNames from 'classnames';
import GeneralPanel from '../../common/GeneralPanel';
import HeaderTitle from '../../common/HeaderTitle';
import { ConferenceEntity } from '../../entities/conference';
import ConferenceNotice from './ConferenceNotice';
import { TABS } from './DashboardConferenceTab';
import DashboardConferenceTabGeneral from './DashboardConferenceTabGeneral';
import DashboardConferenceTabGroups from './DashboardConferenceTabGroups';
import DashboardConferenceTabInfo from './DashboardConferenceTabInfo';
import DashboardConferenceTabMaps from './DashboardConferenceTabMaps';
import DashboardConferenceTabOwner from './DashboardConferenceTabOwner';
import DashboardConferenceTabSchedule from './DashboardConferenceTabSchedule';

interface Props {
  conference: ConferenceEntity;
}

const DashboardConferencePanel: React.FC<Props> = (props) => {
  const { conference } = props;
  const [tab, setTab] = React.useState<TABS>('general');

  const tabs: { key: TABS; label: string; element: React.ReactNode }[] = [
    { key: 'general', label: 'General', element: <DashboardConferenceTabGeneral conference={conference} /> },
    { key: 'groups', label: 'Groups', element: <DashboardConferenceTabGroups conference={conference} /> },
    { key: 'maps', label: 'Maps', element: <DashboardConferenceTabMaps conference={conference} /> },
    { key: 'schedule', label: 'Schedule', element: <DashboardConferenceTabSchedule conference={conference} /> },
    { key: 'info', label: 'Info text', element: <DashboardConferenceTabInfo conference={conference} /> },
    { key: 'owner', label: 'Owner', element: <DashboardConferenceTabOwner conference={conference} /> },
  ];

  return (
    <div className="conference">
      <HeaderTitle title={conference.name} />
      <ConferenceNotice conference={conference} />
      <GeneralPanel title="Admin Panel">
        <ul className="nav nav-tabs mb-4">
          {tabs.map((t) => (
            <li key={t.key} className="nav-item">
              <button className={classNames('nav-link', { active: tab === t.key })} onClick={() => setTab(t.key)}>
                {t.label}
              </button>
            </li>
          ))}
        </ul>
        <div className="tab-content my-2">
          {tabs.map((t) => (
            <div key={t.key} className={classNames('tab-pane', 'fade', { show: tab === t.key, active: tab === t.key })}>
              {t.element}
            </div>
          ))}
        </div>
      </GeneralPanel>
    </div>
  );
};

export default DashboardConferencePanel;
