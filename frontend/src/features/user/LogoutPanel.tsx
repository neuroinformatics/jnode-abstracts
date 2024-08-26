import React from 'react';

import { Button, Form, FormGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import AlertPanel from '../../common/AlertPanel';
import GeneralPanel from '../../common/GeneralPanel';
import LoadingOverlay from '../../common/LoadingOverlay';
import { AsyncApiStatus } from '../../entities/api';
import { logout, selectLogoutState, selectUserInfo } from './userSlice';

const LogoutPanel: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const userInfo = useAppSelector(selectUserInfo);
  const logoutState = useAppSelector(selectLogoutState);

  const onClickLogout = React.useCallback<React.MouseEventHandler<HTMLButtonElement>>(() => {
    void dispatch(logout());
  }, [dispatch]);

  React.useEffect(() => {
    if (userInfo == null) {
      navigate('/');
    }
  }, [navigate, userInfo]);

  const title = 'Sign out';

  return (
    <GeneralPanel title={title} size={7}>
      {logoutState.status === AsyncApiStatus.loading && <LoadingOverlay message="Signing out.." />}
      <fieldset>
        <Form>
          <FormGroup className="mb-3">
            {logoutState.error != null && (
              <AlertPanel variant="danger" title="Error" dismissible={true}>
                {logoutState.error}
              </AlertPanel>
            )}
            <div className="d-grid">
              <Button variant="primary" size="lg" onClick={onClickLogout}>
                Sign out
              </Button>
            </div>
          </FormGroup>
        </Form>
      </fieldset>
    </GeneralPanel>
  );
};

export default LogoutPanel;
