import React from 'react';

import Markdown from 'react-markdown';
import JumbotronPanel from '../../common/JumbotronPanel';
import { ConferenceEntity } from '../../entities/conference';

interface Props {
  conference: ConferenceEntity;
}

const ConferenceNotice: React.FC<Props> = (props) => {
  const { conference } = props;

  if (conference.notice == null) {
    return null;
  }

  return (
    <JumbotronPanel>
      <Markdown className="mb-3">{conference.notice}</Markdown>
    </JumbotronPanel>
  );
};

export default ConferenceNotice;
