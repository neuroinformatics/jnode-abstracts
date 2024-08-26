import React from 'react';

import { faEnvelope, faKey } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Form, FormGroup, InputGroup } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import AlertPanel from '../../common/AlertPanel';
import GeneralPanel from '../../common/GeneralPanel';
import LoadingOverlay from '../../common/LoadingOverlay';
import { AsyncApiStatus } from '../../entities/api';
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
      navigate('/');
    }
  }, [navigate, userInfo]);

  const title = 'Sign In';

  return (
    <GeneralPanel title={title} size={7}>
      {loginState.status === AsyncApiStatus.loading && <LoadingOverlay message="Signing in.." />}
      <fieldset>
        <Form onSubmit={onSubmitLogin}>
          <InputGroup className="mb-4">
            <InputGroup.Text>
              <FontAwesomeIcon icon={faEnvelope} />
            </InputGroup.Text>
            <Form.Control type="email" placeholder="Email" required onChange={(e) => setUsername(e.target.value)} />
          </InputGroup>
          <InputGroup className="mb-4">
            <InputGroup.Text>
              <FontAwesomeIcon icon={faKey} />
            </InputGroup.Text>
            <Form.Control
              type="password"
              placeholder="Password"
              required
              onChange={(e) => setPassword(e.target.value)}
            />
          </InputGroup>
          {loginState.error != null && <AlertPanel variant="danger">{loginState.error}</AlertPanel>}
          <div className="mb-3">
            <Link to="/forgotpassword">Forgot password?</Link> or <Link to="/signup">Create a new account</Link>
          </div>
          <FormGroup className="mb-3">
            <div className="d-grid">
              <Button type="submit" variant="primary" size="lg">
                Sign in
              </Button>
            </div>
          </FormGroup>
        </Form>
      </fieldset>
    </GeneralPanel>
  );
};

export default LoginPanel;
