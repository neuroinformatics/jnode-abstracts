import React from 'react';

import { Route, Routes, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import LoadingOverlay from '../../common/LoadingOverlay';
import PageNotFound from '../../common/PageNotFound';
import { isApiFailed, isApiPreparing } from '../../entities/api';
import AbstractSubmissionPanel from '../abstract/AbstractSubmissionPanel';
import AbstractListPanel from './AbstractListPanel';
import ConferenceFloorplansPanel from './ConferenceFloorplansPanel';
import ConferenceLocationsPanel from './ConferenceLocationsPanel';
import ConferencePanel from './ConferencePanel';
import ConferenceSchedulePanel from './ConferenceSchedulePanel';
import {
  getConferenceDetail,
  selectConferenceInfo,
  selectConferencesInfo,
  selectGetDetailState,
  selectGetListState,
  unsetConferenceDetail,
} from './conferenceSlice';

const ConferenceRouterPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const conferencesInfo = useAppSelector(selectConferencesInfo);
  const conferenceInfo = useAppSelector(selectConferenceInfo);
  const listState = useAppSelector(selectGetListState);
  const detailState = useAppSelector(selectGetDetailState);
  const { shortName } = useParams();

  const uuid = conferencesInfo.allIds.find((uuid) => conferencesInfo.byId[uuid].shortName === shortName);

  React.useEffect(() => {
    if (uuid != null) {
      dispatch(getConferenceDetail(uuid));
    }
    return () => {
      dispatch(unsetConferenceDetail());
    };
  }, [dispatch, uuid]);

  return (
    <>
      {(isApiPreparing(listState) || (uuid != null && isApiPreparing(detailState))) && (
        <LoadingOverlay message="Loading..." />
      )}
      {(isApiFailed(listState) || uuid == null || isApiFailed(detailState)) && <PageNotFound />}
      {conferenceInfo != null && (
        <Routes>
          <Route path="/" element={<ConferencePanel conference={conferenceInfo} />} />
          <Route path="/schedule" element={<ConferenceSchedulePanel conference={conferenceInfo} />} />
          <Route path="/abstracts" element={<AbstractListPanel conference={conferenceInfo} />} />
          <Route path="/submission" element={<AbstractSubmissionPanel conference={conferenceInfo} />} />
          <Route path="/locations" element={<ConferenceLocationsPanel conference={conferenceInfo} />} />
          <Route path="/floorplans" element={<ConferenceFloorplansPanel conference={conferenceInfo} />} />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      )}
    </>
  );
};

export default ConferenceRouterPanel;
