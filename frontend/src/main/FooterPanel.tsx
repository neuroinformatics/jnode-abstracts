import React from 'react';

import { Stack } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const FooterPanel: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <Stack className="footer py-3 px-2 text-secondary bg-body-tertiary rounded" direction="horizontal">
      <div className="p-2">
        <Link to="/about">About</Link>
      </div>
      <div className="p-2">
        <Link to="/contact">Contact</Link>
      </div>
      <div className="p-2 ms-auto">
        The J-Node Abstract System &mdash; © 2017-{year} <a href="https://www.neuroinf.jp/">INCF Japan Node</a>
      </div>
    </Stack>
  );
};

export default FooterPanel;
