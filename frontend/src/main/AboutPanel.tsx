import type React from 'react';
import JNodeLogo from '../assets/J-Node-logo.png';
import GeneralPage from '../common/GeneralPanel';

const AboutPanel: React.FC = () => {
  const title = 'About';
  return (
    <GeneralPage title={title}>
      <div className="row mb-4">
        <div className="col-md-8 d-flex align-items-center">
          <p>
            This Abstract System is hosted by the{' '}
            <a href="https://www.neuroinf.jp/" target="_blank" rel="noopener">
              INCF Japan Node (J-Node)
            </a>
            .
          </p>
        </div>
        <div className="col-md-4">
          <img className="img-fluid" src={JNodeLogo}></img>
        </div>
      </div>
    </GeneralPage>
  );
};

export default AboutPanel;
