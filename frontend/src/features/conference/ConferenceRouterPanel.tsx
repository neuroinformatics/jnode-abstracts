import React from 'react';

import { Route, Routes, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import LoadingOverlay from '../../common/LoadingOverlay';
import PageNotFound from '../../common/PageNotFound';
import { ApiAsyncStatus } from '../../entities/api';
import AbstractListPanel from './AbstractListPanel';
import ConferencePanel from './ConferencePanel';
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
      {(listState.status === ApiAsyncStatus.loading || detailState.status === ApiAsyncStatus.loading) && (
        <LoadingOverlay message="Loading..." />
      )}
      {(listState.status === ApiAsyncStatus.failed || detailState.status === ApiAsyncStatus.failed) && <PageNotFound />}
      {conferenceInfo != null && (
        <>
          <Routes>
            <Route path="/" element={<ConferencePanel conference={conferenceInfo} />} />
            <Route path="/schedule" element={<PageNotFound />} />
            <Route path="/abstracts" element={<AbstractListPanel conference={conferenceInfo} />} />
            <Route path="/locations" element={<PageNotFound />} />
            <Route path="/floorplans" element={<PageNotFound />} />
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </>
      )}
    </>
  );
};

export default ConferenceRouterPanel;
