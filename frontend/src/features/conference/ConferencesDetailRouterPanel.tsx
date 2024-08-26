import React from 'react';

import { Route, Routes, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import LoadingOverlay from '../../common/LoadingOverlay';
import PageNotFound from '../../common/PageNotFound';
import { AsyncApiStatus } from '../../entities/api';
import ConferenceDetailPanel from './ConferenceDetailPanel';
import ConferenceListPanel from './ConferenceListPanel';
import {
  getConferenceDetail,
  selectConferenceInfo,
  selectGetDetailState,
  unsetConferenceDetail,
} from './conferenceSlice';

const ConferencesDetailPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const conferenceInfo = useAppSelector(selectConferenceInfo);
  const detailState = useAppSelector(selectGetDetailState);
  const { shortName } = useParams();

  React.useEffect(() => {
    if (shortName != null) {
      dispatch(getConferenceDetail({ shortName }));
    }
    return () => {
      dispatch(unsetConferenceDetail());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {detailState.status === AsyncApiStatus.loading && <LoadingOverlay message="Loading..." />}
      {conferenceInfo != null ? (
        <>
          <Routes>
            <Route path="/" element={<ConferenceDetailPanel conference={conferenceInfo} />} />
            <Route path="/abstracts" element={<ConferenceListPanel />} />
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
