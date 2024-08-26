import React from 'react';

import { Image } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import HeaderTitle from '../../common/HeaderTitle';
import JumbotronPanel from '../../common/JumbotronPanel';
import LoadingOverlay from '../../common/LoadingOverlay';
import { AsyncApiStatus } from '../../entities/api';
import { ConferenceSimpleEntity } from '../../entities/conference';
import { getConferenceList, selectConferencesInfo, selectGetListState } from './conferenceSlice';

interface ConferenceListItemProps {
  conference: ConferenceSimpleEntity;
}

const ConferenceListItem: React.FC<ConferenceListItemProps> = (props) => {
  const { conference } = props;

  const logo = conference.logo ?? '';

  return (
    <JumbotronPanel>
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

const ConferenceListPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const conferencesInfo = useAppSelector(selectConferencesInfo);
  const getListState = useAppSelector(selectGetListState);

  React.useEffect(() => {
    dispatch(getConferenceList());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const title = 'Conferences';

  return (
    <>
      <HeaderTitle title={title} />
      {getListState.status === AsyncApiStatus.loading && <LoadingOverlay message="Loading.." />}
      {conferencesInfo != null &&
        conferencesInfo.map((conference) => <ConferenceListItem key={conference.uuid} conference={conference} />)}
    </>
  );
};

export default ConferenceListPanel;
