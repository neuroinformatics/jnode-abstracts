import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import GeneralPanel from '../../common/GeneralPanel';
import LoadingOverlay from '../../common/LoadingOverlay';
import PageNotFound from '../../common/PageNotFound';
import { isApiFailed } from '../../entities/api';
import {
  getConferenceDetail,
  selectConferenceInfo,
  selectGetDetailState as selectGetConferenceDetailState,
  unsetConferenceDetail,
} from '../conference/conferenceSlice';
import { selectIsPreparingUserInfo, selectUserInfo } from '../user/userSlice';
import AbstractEditor from './AbstractEditor';
import { getAbstractDetail, selectAbstractInfo, selectGetDetailState, unsetAbstractDetail } from './abstractSlice';

const AbstractEditorPanel: React.FC = () => {
  const { uuid } = useParams();

  const dispatch = useAppDispatch();
  const userInfo = useAppSelector(selectUserInfo);
  const isPreparingUserInfo = useAppSelector(selectIsPreparingUserInfo);
  const abstractInfo = useAppSelector(selectAbstractInfo);
  const detailState = useAppSelector(selectGetDetailState);
  const conferenceInfo = useAppSelector(selectConferenceInfo);
  const conferenceDetailState = useAppSelector(selectGetConferenceDetailState);
  // depend on the uuid only, as reloading the abstract would discard unsaved edits
  const userUuid = userInfo?.uuid ?? null;
  const conferenceUuid = abstractInfo != null && abstractInfo.uuid === uuid ? abstractInfo.conferenceUuid : null;

  React.useEffect(() => {
    if (uuid != null && userUuid != null) {
      dispatch(getAbstractDetail(uuid));
    }
    return () => {
      dispatch(unsetAbstractDetail());
    };
  }, [dispatch, uuid, userUuid]);

  React.useEffect(() => {
    if (conferenceUuid != null) {
      dispatch(getConferenceDetail(conferenceUuid));
    }
    return () => {
      dispatch(unsetConferenceDetail());
    };
  }, [dispatch, conferenceUuid]);

  if (!isPreparingUserInfo && userInfo == null) {
    return <Navigate to="/login" />;
  }
  if (isApiFailed(detailState) || isApiFailed(conferenceDetailState)) {
    return <PageNotFound />;
  }
  if (abstractInfo == null || conferenceInfo == null || conferenceInfo.uuid !== abstractInfo.conferenceUuid) {
    return <LoadingOverlay message="Loading..." />;
  }

  return (
    <GeneralPanel title={conferenceInfo.name} titleLinkTo={`/conference/${conferenceInfo.shortName}`}>
      <h3 className="mb-3">Edit abstract</h3>
      <AbstractEditor key={abstractInfo.uuid} conference={conferenceInfo} abstract={abstractInfo} />
    </GeneralPanel>
  );
};

export default AbstractEditorPanel;
