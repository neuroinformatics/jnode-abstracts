import React from 'react';

import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import GeneralPanel from '../../common/GeneralPanel';
import LoadingOverlay from '../../common/LoadingOverlay';
import { ApiAsyncStatus, isApiPreparing } from '../../entities/api';
import { hideMessage, showMessage } from '../common/commonSlice';
import { logout, selectPageActionState, selectUserInfo, unsetPageActionState } from './userSlice';

const LogoutPanel: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const userInfo = useAppSelector(selectUserInfo);
  const pageActionState = useAppSelector(selectPageActionState);

  React.useEffect(() => {
    return () => {
      dispatch(unsetPageActionState());
    };
  }, [dispatch]);

  React.useEffect(() => {
    if (userInfo != null) {
      dispatch(logout());
    } else {
      dispatch(hideMessage());
      navigate('/');
    }
  }, [dispatch, navigate, userInfo]);

  React.useEffect(() => {
    if (pageActionState.status === ApiAsyncStatus.failed) {
      dispatch(showMessage({ variant: 'danger', message: pageActionState.error ?? '' }));
    }
  }, [dispatch, navigate, pageActionState]);

  const title = 'Sign out';

  return (
    <GeneralPanel title={title} size={7}>
      {isApiPreparing(pageActionState) && <LoadingOverlay message="Signing out.." />}
      <p className="lead">Signing out...</p>
    </GeneralPanel>
  );
};

export default LogoutPanel;
