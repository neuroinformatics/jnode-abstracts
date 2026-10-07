import type React from 'react';

interface Props {
  children: React.ReactNode;
}

const JumbotronPanel: React.FC<Props> = (props) => {
  const { children } = props;

  return (
    <div className="jumbotron bg-body-tertiary p-3 px-sm-4 px-md-5 mb-4 rounded">
      <div className="px-sm-1 px-md-2">{children}</div>
    </div>
  );
};

export default JumbotronPanel;
