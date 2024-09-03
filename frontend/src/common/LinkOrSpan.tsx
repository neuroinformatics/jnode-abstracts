import React from 'react';

import { Link } from 'react-router-dom';

interface Props {
  className?: string;
  ariaLabel?: string;
  to?: string | null;
  href?: string | null;
  children: React.ReactNode;
}

const LinkOrSpan: React.FC<Props> = (props) => {
  const { className, ariaLabel, to, href, children } = props;
  if (to != null && to.length > 0) {
    return (
      <Link className={className} aria-label={ariaLabel} to={to}>
        {children}
      </Link>
    );
  } else if (href != null && href.length > 0) {
    return (
      <a className={className} aria-label={ariaLabel} href={href}>
        {children}
      </a>
    );
  }
  return (
    <span className={className} aria-label={ariaLabel}>
      {children}
    </span>
  );
};

export default LinkOrSpan;
