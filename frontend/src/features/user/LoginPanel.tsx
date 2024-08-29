import React from 'react';

import { faEnvelope, faKey } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import AlertPanel from '../../common/AlertPanel';
import GeneralPanel from '../../common/GeneralPanel';
import LoadingOverlay from '../../common/LoadingOverlay';
import { ApiAsyncStatus } from '../../entities/api';
import { login, selectLoginState, selectUserInfo } from './userSlice';

const LoginPanel: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const userInfo = useAppSelector(selectUserInfo);
  const loginState = useAppSelector(selectLoginState);

  const [username, setUsername] = React.useState<string>('');
  const [password, setPassword] = React.useState<string>('');

  const onSubmitLogin = React.useCallback<React.FormEventHandler<HTMLFormElement>>(
    (e) => {
      e.preventDefault();
      void dispatch(login({ username, password }));
    },
    [dispatch, password, username],
  );

  React.useEffect(() => {
    if (userInfo != null) {
      navigate(-1);
    }
  }, [navigate, userInfo]);

  const title = 'Sign In';

  return (
    <GeneralPanel title={title} size={7}>
      {loginState.status === ApiAsyncStatus.loading && <LoadingOverlay message="Signing in.." />}
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
          {loginState.error != null && <AlertPanel variant="danger">{loginState.error}</AlertPanel>}
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
