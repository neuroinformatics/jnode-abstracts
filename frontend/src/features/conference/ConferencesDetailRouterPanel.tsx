import React from 'react';

import { Route, Routes, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import LoadingOverlay from '../../common/LoadingOverlay';
import PageNotFound from '../../common/PageNotFound';
import { ApiAsyncStatus } from '../../entities/api';
import ConferenceDetailPanel from './ConferenceDetailPanel';
import {
  getConferenceDetail,
  selectConferenceInfo,
  selectConferencesInfo,
  selectGetDetailState,
  unsetConferenceDetail,
} from './conferenceSlice';

const ConferencesDetailPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const conferenceInfo = useAppSelector(selectConferenceInfo);
  const conferencesInfo = useAppSelector(selectConferencesInfo);
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

  if (uuid == null) {
    return <PageNotFound />;
  }

  return (
    <>
      {detailState.status === ApiAsyncStatus.loading && <LoadingOverlay message="Loading..." />}
      {conferenceInfo != null ? (
        <>
          <Routes>
            <Route path="/" element={<ConferenceDetailPanel conference={conferenceInfo} />} />
            <Route path="/schedule" element={<PageNotFound />} />
            <Route path="/abstracts" element={<PageNotFound />} />
            <Route path="/locations" element={<PageNotFound />} />
            <Route path="/floorplans" element={<PageNotFound />} />
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </>
      ) : (
        <PageNotFound />
      )}
    </>
  );
};

export default ConferencesDetailPanel;
