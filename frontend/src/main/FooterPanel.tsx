import React from 'react';

import { Link } from 'react-router-dom';

const FooterPanel: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <div className="footer hstack py-3 px-2 text-secondary bg-body-tertiary rounded">
      <div className="p-2">
        <Link to="/about">About</Link>
      </div>
      <div className="p-2">
        <Link to="/contact">Contact</Link>
      </div>
      <div className="p-2 ms-auto text-end">
        <span className="text-nowrap">The J-Node Abstract System</span>
        {' - '}
        <span className="text-nowrap">
          © 2017-{year} <a href="https://www.neuroinf.jp/">INCF Japan Node</a>
        </span>
      </div>
    </div>
  );
};

export default FooterPanel;
