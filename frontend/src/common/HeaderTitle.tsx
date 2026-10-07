import type React from 'react';

import { SITE_TITLE } from '../constants';

interface Props {
  title: string;
}

const HeaderTitle: React.FC<Props> = (props) => {
  const { title } = props;
  const label = (title !== '' ? `${title} - ` : '') + SITE_TITLE;
  return <title>{label}</title>;
};

export default HeaderTitle;
