import React from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import GeneralPanel from '../../common/GeneralPanel';
import LoadingOverlay from '../../common/LoadingOverlay';
import PageNotFound from '../../common/PageNotFound';
import { isApiFailed, isApiPreparing } from '../../entities/api';
import AbstractPanel from '../conference/AbstractPanel';
import {
  getConferenceDetail,
  selectConferenceInfo,
  selectGetDetailState as selectGetConferenceDetailState,
  unsetConferenceDetail,
} from '../conference/conferenceSlice';
import AbstractStateLogPanel from './AbstractStateLogPanel';
import { getAbstractDetail, selectAbstractInfo, selectGetDetailState, unsetAbstractDetail } from './abstractSlice';
import FavoriteButton from './FavoriteButton';

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
        <AbstractStateLogPanel abstract={abstractInfo} />
        {conferenceInfo.isPublished && abstractInfo.state === 'Accepted' && (
          <FavoriteButton abstract={abstractInfo} className="float-end fs-4" />
        )}
        <AbstractPanel conference={conferenceInfo} abstract={abstractInfo} />
      </GeneralPanel>
    </div>
  );
};

export default AbstractViewPanel;
