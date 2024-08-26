import React from 'react';

import Image from 'react-bootstrap/Image';
import { Link } from 'react-router-dom';
import HeaderTitle from '../../common/HeaderTitle';
import JumbotronPanel from '../../common/JumbotronPanel';
import { ConferenceSimpleEntity } from '../../entities/conference';

interface Props {
  conference: ConferenceSimpleEntity;
}

const ConferenceDetailPanel: React.FC<Props> = (props) => {
  const { conference } = props;

  const logo = conference.logo ?? '';

  return (
    <JumbotronPanel>
      <HeaderTitle title={conference.name} />
      <div className="conference">
        <p className="logo text-center">
          <Image src={logo} alt={conference.name} fluid rounded />
        </p>
        <h3 className="mb-3">
          <Link to={`/conferences/${conference.shortName}`}>{conference.name}</Link>
        </h3>
        <p className="mb-3">{conference.description}</p>
        <a className="btn btn-success btn-lg" href="#" role="button">
          本日登録
        </a>
      </div>
    </JumbotronPanel>
  );
};

export default ConferenceDetailPanel;
