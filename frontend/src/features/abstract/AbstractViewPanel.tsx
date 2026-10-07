import dayjs from 'dayjs';
import React from 'react';
import { Badge } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import GeneralPanel from '../../common/GeneralPanel';
import LoadingOverlay from '../../common/LoadingOverlay';
import PageNotFound from '../../common/PageNotFound';
import type { AbstractEntity } from '../../entities/abstract';
import { isApiFailed, isApiPreparing } from '../../entities/api';
import AbstractPanel from '../conference/AbstractPanel';
import {
  getConferenceDetail,
  selectConferenceInfo,
  selectGetDetailState as selectGetConferenceDetailState,
  unsetConferenceDetail,
} from '../conference/conferenceSlice';
import { getAbstractDetail, selectAbstractInfo, selectGetDetailState, unsetAbstractDetail } from './abstractSlice';
import { formatStateName, STATE_VARIANTS } from './abstractUtilities';

interface StateLogPanelProps {
  abstract: AbstractEntity;
}

const StateLogPanel: React.FC<StateLogPanelProps> = (props) => {
  const { abstract } = props;
  if (abstract.stateLogs.length === 0) {
    return null;
  }
  return (
    <div className="state-log mb-4 d-print-none">
      <h5>
        State: <Badge bg={STATE_VARIANTS[abstract.state]}>{formatStateName(abstract.state)}</Badge>
      </h5>
      <table className="table table-sm">
        <thead>
          <tr>
            <th>Date</th>
            <th>State</th>
            <th>Editor</th>
            <th>Note</th>
          </tr>
        </thead>
        <tbody>
          {abstract.stateLogs.map((log) => (
            <tr key={log.uuid}>
              {/* timestamps are sent in UTC without an offset, as the server runs in UTC */}
              <td className="text-nowrap">{dayjs(`${log.timestamp}Z`).format('YYYY-MM-DD HH:mm')}</td>
              <td className="text-nowrap">{formatStateName(log.state)}</td>
              <td className="text-nowrap">{log.editor}</td>
              <td className="text-break">{log.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const AbstractViewPanel: React.FC = () => {
  const { uuid } = useParams();

  const dispatch = useAppDispatch();
  const abstractInfo = useAppSelector(selectAbstractInfo);
  const detailState = useAppSelector(selectGetDetailState);
  const conferenceInfo = useAppSelector(selectConferenceInfo);
  const conferenceDetailState = useAppSelector(selectGetConferenceDetailState);
  const conferenceUuid = abstractInfo != null && abstractInfo.uuid === uuid ? abstractInfo.conferenceUuid : null;

  React.useEffect(() => {
    if (uuid != null) {
      dispatch(getAbstractDetail(uuid));
    }
    return () => {
      dispatch(unsetAbstractDetail());
    };
  }, [dispatch, uuid]);

  React.useEffect(() => {
    if (conferenceUuid != null) {
      dispatch(getConferenceDetail(conferenceUuid));
    }
    return () => {
      dispatch(unsetConferenceDetail());
    };
  }, [dispatch, conferenceUuid]);

  if (isApiFailed(detailState) || isApiFailed(conferenceDetailState)) {
    return <PageNotFound />;
  }
  if (abstractInfo == null || conferenceInfo == null || conferenceInfo.uuid !== abstractInfo.conferenceUuid) {
    return isApiPreparing(detailState) || isApiPreparing(conferenceDetailState) ? (
      <LoadingOverlay message="Loading..." />
    ) : null;
  }

  return (
    <div className="abstract-view">
      <GeneralPanel title={conferenceInfo.name} titleLinkTo={`/conference/${conferenceInfo.shortName}`}>
        <StateLogPanel abstract={abstractInfo} />
        <AbstractPanel conference={conferenceInfo} abstract={abstractInfo} />
      </GeneralPanel>
    </div>
  );
};

export default AbstractViewPanel;
