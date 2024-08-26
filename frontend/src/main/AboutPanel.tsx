import React from 'react';

import { Col, Row } from 'react-bootstrap';
import GeneralPage from '../common/GeneralPanel';

import JNodeLogo from '../assets/J-Node-logo.png';

const AboutPanel: React.FC = () => {
  const title = 'About';
  return (
    <GeneralPage title={title}>
      <Row className="mb-4">
        <Col md="8" className="d-flex align-items-center">
          <p>
            This Abstract System is hosted by the{' '}
            <a href="https://www.neuroinf.jp/" target="_blank">
              INCF Japan Node (J-Node)
            </a>
            .
          </p>
        </Col>
        <Col md="4">
          <img className="img-fluid" src={JNodeLogo}></img>
        </Col>
      </Row>
    </GeneralPage>
  );
};

export default AboutPanel;
