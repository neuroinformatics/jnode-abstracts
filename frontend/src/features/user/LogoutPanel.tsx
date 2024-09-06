import React from 'react';

import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import AlertPanel from '../../common/AlertPanel';
import GeneralPanel from '../../common/GeneralPanel';
import LoadingOverlay from '../../common/LoadingOverlay';
import { isApiPreparing } from '../../entities/api';
import { logout, selectLogoutState, selectUserInfo } from './userSlice';

const LogoutPanel: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const userInfo = useAppSelector(selectUserInfo);
  const logoutState = useAppSelector(selectLogoutState);

  React.useEffect(() => {
    if (userInfo != null) {
      dispatch(logout());
    } else {
      navigate('/');
    }
  }, [dispatch, navigate, userInfo]);

  const title = 'Sign out';

  return (
    <GeneralPanel title={title} size={7}>
      {isApiPreparing(logoutState) && <LoadingOverlay message="Signing out.." />}
      {logoutState.error != null && (
        <AlertPanel variant="danger" title="Error">
          {logoutState.error}
        </AlertPanel>
      )}
      <p className="lead">Signing out...</p>
    </GeneralPanel>
  );
};

export default LogoutPanel;
