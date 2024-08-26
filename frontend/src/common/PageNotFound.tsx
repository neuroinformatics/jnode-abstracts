import React from 'react';

import AlertPanel from './AlertPanel';
import GeneralPanel from './GeneralPanel';

const PageNotFound: React.FC = () => {
  const title = 'Page Not Found';
  return (
    <GeneralPanel title={title}>
      <AlertPanel variant="danger">
        <span className="lead">The resource requested could not be found.</span>
      </AlertPanel>
    </GeneralPanel>
  );
};

export default PageNotFound;
