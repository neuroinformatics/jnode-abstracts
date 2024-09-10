import React from 'react';

import { faEnvelope, faKey } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import GeneralPanel from '../../common/GeneralPanel';
import LoadingOverlay from '../../common/LoadingOverlay';
import { ApiAsyncStatus } from '../../entities/api';
import { hideMessage, showMessage } from '../common/commonSlice';
import { login, selectPageActionState, selectUserInfo, unsetPageActionState } from './userSlice';

const LoginPanel: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const userInfo = useAppSelector(selectUserInfo);
  const pageActionState = useAppSelector(selectPageActionState);

  const [username, setUsername] = React.useState<string>('');
  const [password, setPassword] = React.useState<string>('');

  React.useEffect(() => {
    return () => {
      dispatch(unsetPageActionState());
    };
  }, [dispatch]);

  React.useEffect(() => {
    if (userInfo != null) {
      dispatch(hideMessage());
      navigate('/');
    }
  }, [dispatch, navigate, userInfo]);

  React.useEffect(() => {
    if (pageActionState.status === ApiAsyncStatus.failed) {
      dispatch(showMessage({ variant: 'danger', message: pageActionState.error ?? '' }));
    }
  }, [dispatch, navigate, pageActionState]);

  const onSubmitLogin = React.useCallback<React.FormEventHandler<HTMLFormElement>>(
    (e) => {
      e.preventDefault();
      dispatch(login({ username, password }));
    },
    [dispatch, password, username],
  );

  const title = 'Sign In';

  return (
    <GeneralPanel title={title} size={7}>
      {pageActionState.status === ApiAsyncStatus.loading && <LoadingOverlay message="Signing in.." />}
      <fieldset>
        <form onSubmit={onSubmitLogin}>
          <div className="input-group mb-4">
            <span className="input-group-text">
              <FontAwesomeIcon icon={faEnvelope} />
            </span>
            <input
              className="form-control"
              type="email"
              placeholder="Email"
              required
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="input-group mb-4">
            <span className="input-group-text">
              <FontAwesomeIcon icon={faKey} />
            </span>
            <input
              className="form-control"
              type="password"
              placeholder="Password"
              required
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <Link to="/forgotpassword">Forgot password?</Link> or <Link to="/signup">Create a new account</Link>
          </div>
          <div className="mb-3">
            <div className="d-grid">
              <button className="btn btn-primary btn-lg" type="submit">
                Sign in
              </button>
            </div>
          </div>
        </form>
      </fieldset>
    </GeneralPanel>
  );
};

export default LoginPanel;
