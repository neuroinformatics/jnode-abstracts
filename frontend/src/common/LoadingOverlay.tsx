import React from 'react';

import { Spinner } from 'react-bootstrap';

interface Props {
  message: string;
}

const LoadingOverlay: React.FC<Props> = (props) => {
  const { message } = props;
  return (
    <div className="loading-overlay">
      <div className="inner">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">{message}</span>
        </Spinner>
        <div className="message">{message}</div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
