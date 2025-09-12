import React from 'react';

import Markdown from 'react-markdown';
import JumbotronPanel from '../../common/JumbotronPanel';
import { type ConferenceEntity } from '../../entities/conference';

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
      <div className="mb-3">
        <Markdown>{conference.notice}</Markdown>
      </div>
    </JumbotronPanel>
  );
};

export default ConferenceNotice;
