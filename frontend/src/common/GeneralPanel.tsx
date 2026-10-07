import type React from 'react';

import { Link } from 'react-router-dom';
import HeaderTitle from './HeaderTitle';

interface Props {
  title: string;
  titleLinkTo?: string;
  size?: number;
  children: React.ReactNode;
}

const GeneralPanel: React.FC<Props> = (props) => {
  const { title, titleLinkTo, size = 12, children } = props;
  return (
    <div className="mx-3">
      <div className="row justify-content-center">
        <div className={`page-header col-md-${size} my-3`}>
          <HeaderTitle title={title} />
          {titleLinkTo != null ? (
            <Link to={titleLinkTo}>
              <h1>{title}</h1>
            </Link>
          ) : (
            <h1>{title}</h1>
          )}
        </div>
      </div>
      <div className="row justify-content-center">
        <div className={`page-body col-md-${size} my-3`}>{children}</div>
      </div>
    </div>
  );
};

export default GeneralPanel;
