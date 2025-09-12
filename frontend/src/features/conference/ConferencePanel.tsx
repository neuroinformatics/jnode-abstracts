import React from 'react';

import Markdown from 'react-markdown';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import HeaderTitle from '../../common/HeaderTitle';
import JumbotronPanel from '../../common/JumbotronPanel';
import { type ConferenceEntity } from '../../entities/conference';
import { selectUserInfo } from '../user/userSlice';
import ConferenceNotice from './ConferenceNotice';
import { formatDuration, getLogoUrl } from './conferenceUtilities';

interface Props {
  conference: ConferenceEntity;
}

const ConferencePanel: React.FC<Props> = (props) => {
  const { conference } = props;
  const userInfo = useAppSelector(selectUserInfo);

  const isAdmin = userInfo?.isAdmin ?? false;
  const logo = getLogoUrl(conference);

  return (
    <div className="conference">
      <HeaderTitle title={conference.name} />
      <ConferenceNotice conference={conference} />
      <JumbotronPanel>
        <div className="page-title my-4 border-bottom">
          <h2 className="mb-4">{conference.name}</h2>
        </div>
        {logo != null && (
          <p className="logo text-center">
            <img className="logo img-fluid rounded" src={logo} alt={conference.name} />
          </p>
        )}
        <div className="mb-3">
          <Markdown>{conference.description}</Markdown>
        </div>
        <p className="mb-3 fs-5">{formatDuration(conference)}</p>
        {conference.isOpen ? (
          <div className="mb-3">
            <p className="fs-5">
              Submission is <strong className="text-success">open</strong>!
            </p>
            <p>In order to submit an abstract please press the appropriate button below. or manage</p>
            <p>
              <a className="btn btn-success">Submit new Abstract</a> or manage{' '}
              <a className="btn btn-primary">Your Abstracts</a>
            </p>
          </div>
        ) : (
          <>
            {conference.isPublished ? (
              <div className="mb-3">
                <Link to={`/conference/${conference.shortName}/abstracts`} className="btn btn-primary">
                  Abstracts
                </Link>
              </div>
            ) : (
              <div className="mb-3">
                <p className="fs-5">
                  Submission is <strong className="text-danger">closed</strong>.
                  {conference.link && (
                    <>
                      <br />
                      Please check the{' '}
                      <a href={conference.link} target="_blank">
                        conference homepage
                      </a>{' '}
                      for details.
                    </>
                  )}
                </p>
              </div>
            )}
          </>
        )}
        {(isAdmin || conference.isOwner) && (
          <>
            <hr className="my-4" />
            <h3 className="mb-3">Administration</h3>
            <div className="mb-3">
              <Link to={`/dashboard/conference/${conference.uuid}`} className="btn btn-danger">
                Conference Settings
              </Link>{' '}
              <Link to={`/dashboard/conference/${conference.uuid}/abstracts`} className="btn btn-danger">
                Manage abstracts
              </Link>
            </div>
          </>
        )}
      </JumbotronPanel>
      {conference.info != null && (
        <JumbotronPanel>
          <div className="page-title my-3 border-bottom">
            <h2 className="mb-3">General Information</h2>
          </div>
          <div className="mb-3">
            <Markdown>{conference.info}</Markdown>
          </div>
        </JumbotronPanel>
      )}
    </div>
  );
};

export default ConferencePanel;
