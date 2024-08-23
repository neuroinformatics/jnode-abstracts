import React from 'react';

import { Helmet } from 'react-helmet-async';
import { SITE_TITLE } from '../constants';

interface Props {
  title: string;
}

const HeaderTitle: React.FC<Props> = (props) => {
  const { title } = props;
  const label = (title !== '' ? title + ' - ' : '') + SITE_TITLE;
  return (
    <Helmet>
      <title>{label}</title>
    </Helmet>
  );
};

export default HeaderTitle;
