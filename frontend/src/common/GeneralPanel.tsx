import React from 'react';

import { Col, Container, Row } from 'react-bootstrap';
import HeaderTitle from './HeaderTitle';

interface Props {
  title: string;
  size?: number;
  children: React.ReactNode;
}

const GeneralPanel: React.FC<Props> = (props) => {
  const { title, size = 12, children } = props;
  return (
    <Container>
      <Row className="justify-content-center">
        <Col md={size} className="page-header my-3">
          <HeaderTitle title={title} />
          <h1>{title}</h1>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col md={size} className="page-body my-3 ">
          {children}
        </Col>
      </Row>
    </Container>
  );
};

export default GeneralPanel;
