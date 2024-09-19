import React from 'react';

import { DashboardConferenceTabProps } from './DashboardConferenceTab';

const DashboardConferenceTabGeneral: React.FC<DashboardConferenceTabProps> = (props) => {
  const { conference } = props;
  return <div className="row">General: {conference.name}</div>;
};

export default DashboardConferenceTabGeneral;
