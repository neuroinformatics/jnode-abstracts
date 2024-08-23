import React from 'react';

import { Card, CardBody, CardHeader } from 'react-bootstrap';
import HeaderTitle from './HeaderTitle';

const PageNotFound: React.FC = () => {
  const title = 'Page Not Found';
  return (
    <Card>
      <HeaderTitle title={title} />
      <CardHeader>{title}</CardHeader>
      <CardBody>The resource requested could not be found.</CardBody>
    </Card>
  );
};

export default PageNotFound;
