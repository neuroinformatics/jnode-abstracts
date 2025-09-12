import React from 'react';

import GeneralPanel from '../../common/GeneralPanel';
import type { ConferenceEntity } from '../../entities/conference';
import ConferenceScheduler from './ConferenceSchedular';
import type { ScheduleJSON_Entities } from './scheduler';

interface Props {
  conference: ConferenceEntity;
}

const ConferenceSchedulePanel: React.FC<Props> = (props) => {
  const { conference } = props;

  if (conference.schedule == null) {
    return null;
  }
  const entities: ScheduleJSON_Entities = JSON.parse(conference.schedule);
  return (
    <GeneralPanel title="Schedule">
      <ConferenceScheduler entities={entities}></ConferenceScheduler>
    </GeneralPanel>
  );
};

export default ConferenceSchedulePanel;
