import React from 'react';

import { Route, Routes, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import ForbiddenAccess from '../../common/ForbiddenAccess';
import LoadingOverlay from '../../common/LoadingOverlay';
import PageNotFound from '../../common/PageNotFound';
import { isApiFailed, isApiPreparing } from '../../entities/api';
import { selectUserInfo } from '../user/userSlice';
import {
  getConferenceDetail,
  selectConferenceInfo,
  selectConferencesInfo,
  selectGetDetailState,
  selectGetListState,
  unsetConferenceDetail,
} from './conferenceSlice';
import DashboardConferencePanel from './DashboardConferencePanel';

const DashboardConferenceRouterPanel: React.FC = () => {
  const { uuid } = useParams();

  const dispatch = useAppDispatch();
  const userInfo = useAppSelector(selectUserInfo);
  const conferencesInfo = useAppSelector(selectConferencesInfo);
  const conferenceInfo = useAppSelector(selectConferenceInfo);
  const listState = useAppSelector(selectGetListState);
  const detailState = useAppSelector(selectGetDetailState);

  const conferenceUuid = uuid != null ? (conferencesInfo.allIds.includes(uuid) ? uuid : null) : null;
  const isAdmin = userInfo?.isAdmin ?? false;

  React.useEffect(() => {
    if (conferenceUuid != null) {
      dispatch(getConferenceDetail(conferenceUuid));
    }
    return () => {
      dispatch(unsetConferenceDetail());
    };
  }, [conferenceUuid, dispatch]);

  if (isApiPreparing(listState) || (conferenceUuid != null && isApiPreparing(detailState))) {
    return <LoadingOverlay message="Loading..." />;
  }
  if (isApiFailed(listState) || isApiFailed(detailState) || conferenceInfo == null) {
    return <PageNotFound />;
  }
  if (!isAdmin && !conferenceInfo.isOwner) {
    return <ForbiddenAccess />;
  }

  return (
    <Routes>
      <Route path="/" element={<DashboardConferencePanel conference={conferenceInfo} />} />
      {/* <Route path="/abstracts" element={<AbstractListPanel conference={conferenceInfo} />} /> */}
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

export default DashboardConferenceRouterPanel;
