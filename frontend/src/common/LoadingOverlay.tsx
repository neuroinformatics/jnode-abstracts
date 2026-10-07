import type React from 'react';

interface Props {
  message: string;
}

const LoadingOverlay: React.FC<Props> = (props) => {
  const { message } = props;
  return (
    <div className="loading-overlay">
      <div className="inner">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">{message}</span>
        </div>
        <div className="message">{message}</div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
