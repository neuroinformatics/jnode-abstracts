import React from 'react';

import AlertPanel from './AlertPanel';
import GeneralPanel from './GeneralPanel';

const ForbiddenAccess: React.FC = () => {
  const title = 'Access Denied';
  return (
    <GeneralPanel title={title}>
      <AlertPanel variant="danger">
        <span className="lead">Access to this resource on the server is denied.</span>
      </AlertPanel>
    </GeneralPanel>
  );
};

export default ForbiddenAccess;
