import React from 'react';

import Markdown from 'react-markdown';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import HeaderTitle from '../../common/HeaderTitle';
import JumbotronPanel from '../../common/JumbotronPanel';
import LoadingOverlay from '../../common/LoadingOverlay';
import { ApiAsyncStatus } from '../../entities/api';
import { ConferenceSimpleEntity } from '../../entities/conference';
import { selectConferencesInfo, selectGetListState } from './conferenceSlice';
import { formatDuration, getLogoUrl, getThumbnailUrl } from './conferenceUtilities';

interface ConferenceListItemProps {
  conference: ConferenceSimpleEntity;
}

const ConferenceListActiveItem: React.FC<ConferenceListItemProps> = (props) => {
  const { conference } = props;

  const logo = getLogoUrl(conference);
  const url = `/conferences/${conference.shortName}`;

  return (
    <JumbotronPanel>
      <div className="conference">
        {logo != null && (
          <p className="text-center">
            <img className="logo img-fluid rounded" src={logo} alt={conference.name} />
          </p>
        )}
        <h3 className="mb-3">
          <Link to={`${url}`}>{conference.name}</Link>
        </h3>
        <Markdown className="mb-3">{conference.description}</Markdown>
        <p className="mb-3 fs-5">{formatDuration(conference)}</p>
        {conference.isOwner && (
          <div className="mb-2">
            <Link to={`/dashboard/conference/${conference.uuid}`} className="btn btn-danger">
              Conference Settings
            </Link>{' '}
            <Link to={`/dashboard/conference/${conference.uuid}/abstracts`} className="btn btn-danger">
              Manage abstracts
            </Link>
          </div>
        )}
      </div>
    </JumbotronPanel>
  );
};

const ConferenceListInActiveItem: React.FC<ConferenceListItemProps> = (props) => {
  const { conference } = props;

  const thumbnail = getThumbnailUrl(conference);
  const url = `/conferences/${conference.shortName}`;

  return (
    <div className="conference">
      <div className="media d-flex">
        {thumbnail != null && (
          <Link className="media-object mb-2" to={url}>
            <img className="thumbnail img-fluid rounded" src={thumbnail} alt={conference.name} />
          </Link>
        )}
        <div className="media-body">
          <h4 className="media-heading mb-2">
            <Link to={`${url}/abstracts`}>{conference.name}</Link>
          </h4>
          <p className="mb-2">{formatDuration(conference)}</p>
        </div>
      </div>
      {conference.isOwner && (
        <div className="mb-2">
          <Link to={`/dashboard/conference/${conference.uuid}`} className="btn btn-danger">
            Conference Settings
          </Link>{' '}
          <Link to={`/dashboard/conference/${conference.uuid}/abstracts`} className="btn btn-danger">
            Manage abstracts
          </Link>
        </div>
      )}
    </div>
  );
};

const ConferenceListOtherItem: React.FC<ConferenceListItemProps> = (props) => {
  const { conference } = props;

  const thumbnail = getThumbnailUrl(conference);
  const url = `/conferences/${conference.shortName}`;

  return (
    <div className="conference">
      <div className="media unpublished d-flex">
        {thumbnail != null && (
          <Link className="media-object mb-2" to={url}>
            <img className="thumbnail img-fluid rounded" src={thumbnail} alt={conference.name} />
          </Link>
        )}
        <div className="media-body">
          <h4 className="media-heading mb-2">
            <Link to={url}>{conference.name}</Link>
          </h4>
          <p className="mb-2">{formatDuration(conference)}</p>
        </div>
      </div>
      {conference.isOwner && (
        <div className="mb-2">
          <Link to={`/dashboard/conference/${conference.uuid}`} className="btn btn-danger">
            Conference Settings
          </Link>
        </div>
      )}
    </div>
  );
};

const ConferenceListPanel: React.FC = () => {
  const conferencesInfo = useAppSelector(selectConferencesInfo);
  const getListState = useAppSelector(selectGetListState);

  const title = 'Conferences';
  const isAdmin = false;

  const actives = conferencesInfo.allIds.filter((uuid) => conferencesInfo.byId[uuid].isActive);
  const inActives = conferencesInfo.allIds.filter(
    (uuid) => !conferencesInfo.byId[uuid].isActive && conferencesInfo.byId[uuid].isPublished,
  );
  const others = conferencesInfo.allIds.filter(
    (uuid) =>
      !conferencesInfo.byId[uuid].isActive &&
      !conferencesInfo.byId[uuid].isPublished &&
      (conferencesInfo.byId[uuid].isOwner || isAdmin),
  );

  return (
    <>
      <HeaderTitle title={title} />
      {getListState.status === ApiAsyncStatus.loading && <LoadingOverlay message="Loading.." />}
      {actives.map((uuid) => (
        <ConferenceListActiveItem key={uuid} conference={conferencesInfo.byId[uuid]} />
      ))}
      {inActives.map((uuid) => (
        <ConferenceListInActiveItem key={uuid} conference={conferencesInfo.byId[uuid]} />
      ))}
      {others.length > 0 && (
        <>
          <hr />
          <h3 className="mb-3">Unpublished conferences</h3>
          {others.map((uuid) => (
            <ConferenceListOtherItem key={uuid} conference={conferencesInfo.byId[uuid]} />
          ))}
        </>
      )}
    </>
  );
};

export default ConferenceListPanel;
