import dayjs from 'dayjs';
import React from 'react';
import { Badge } from 'react-bootstrap';
import { Link, Navigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import GeneralPanel from '../../common/GeneralPanel';
import LoadingOverlay from '../../common/LoadingOverlay';
import type { AbstractEntity } from '../../entities/abstract';
import { isApiPreparing } from '../../entities/api';
import { selectConferencesInfo } from '../conference/conferenceSlice';
import { selectIsPreparingUserInfo, selectUserInfo } from '../user/userSlice';
import { getOwnAbstracts, selectGetOwnAbstractsState, selectOwnAbstractsInfo } from './abstractSlice';
import { formatStateName, STATE_VARIANTS } from './abstractUtilities';

const MyAbstractsPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const userInfo = useAppSelector(selectUserInfo);
  const isPreparingUserInfo = useAppSelector(selectIsPreparingUserInfo);
  const abstractsInfo = useAppSelector(selectOwnAbstractsInfo);
  const abstractsState = useAppSelector(selectGetOwnAbstractsState);
  const conferencesInfo = useAppSelector(selectConferencesInfo);

  const userUuid = userInfo?.uuid ?? null;

  React.useEffect(() => {
    if (userUuid != null) {
      dispatch(getOwnAbstracts());
    }
  }, [dispatch, userUuid]);

  if (userInfo == null) {
    return isPreparingUserInfo ? null : <Navigate to="/login" />;
  }

  // group the abstracts by conference, keeping the order of the list (newest conferences first)
  const groups: { conferenceUuid: string; abstracts: AbstractEntity[] }[] = [];
  abstractsInfo.allIds.forEach((uuid) => {
    const abstract = abstractsInfo.byId[uuid];
    const group = groups.find((g) => g.conferenceUuid === abstract.conferenceUuid);
    if (group != null) {
      group.abstracts.push(abstract);
    } else {
      groups.push({ conferenceUuid: abstract.conferenceUuid, abstracts: [abstract] });
    }
  });
  const openConferences = conferencesInfo.allIds
    .map((uuid) => conferencesInfo.byId[uuid])
    .filter((conference) => conference.isOpen);

  return (
    <GeneralPanel title="My Abstracts">
      {isApiPreparing(abstractsState) && <LoadingOverlay message="Loading..." />}
      {openConferences.length > 0 && (
        <div className="mb-4">
          <h5>Open for submission</h5>
          <ul className="list-unstyled">
            {openConferences.map((conference) => (
              <li key={conference.uuid} className="mb-1">
                <Link to={`/conference/${conference.shortName}`}>{conference.name}</Link>{' '}
                <Link to={`/conference/${conference.shortName}/submission`} className="btn btn-sm btn-success ms-2">
                  Submit new abstract
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      {abstractsInfo.allIds.length === 0 && !isApiPreparing(abstractsState) && <p>You have no abstracts yet.</p>}
      {groups.map((group) => {
        const conference = conferencesInfo.byId[group.conferenceUuid];
        return (
          <div key={group.conferenceUuid} className="mb-4">
            <h5>
              {conference != null ? (
                <Link to={`/conference/${conference.shortName}`}>{conference.name}</Link>
              ) : (
                'Unknown conference'
              )}
            </h5>
            <div className="table-responsive">
              <table className="table table-sm align-middle">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>State</th>
                    <th>Last modified</th>
                    <th>
                      <span className="visually-hidden">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {group.abstracts.map((abstract) => (
                    <tr key={abstract.uuid}>
                      <td>
                        <Link to={`/myabstracts/${abstract.uuid}/edit`}>{abstract.title || '(untitled)'}</Link>
                      </td>
                      <td>
                        <Badge bg={STATE_VARIANTS[abstract.state]}>{formatStateName(abstract.state)}</Badge>
                      </td>
                      {/* timestamps are sent in UTC without an offset, as the server runs in UTC */}
                      <td className="text-nowrap">{dayjs(`${abstract.mtime}Z`).format('YYYY-MM-DD HH:mm')}</td>
                      <td className="text-end text-nowrap">
                        <Link to={`/myabstracts/${abstract.uuid}/edit`} className="btn btn-sm btn-outline-primary me-1">
                          Open
                        </Link>
                        <Link to={`/abstracts/${abstract.uuid}`} className="btn btn-sm btn-outline-secondary">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </GeneralPanel>
  );
};

export default MyAbstractsPanel;
