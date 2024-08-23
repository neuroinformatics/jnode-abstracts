import React from 'react';

import { Button, Form, FormGroup, Row } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import HeaderTitle from '../../common/HeaderTitle';
import { login, selectUserInfo } from './userSlice';

const LoginPanel: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const userInfo = useAppSelector(selectUserInfo);

  const [username, setUsername] = React.useState<string>('');
  const [password, setPassword] = React.useState<string>('');

  const onClickLogin = React.useCallback<React.MouseEventHandler<HTMLButtonElement>>(() => {
    void dispatch(login({ username, password }));
    return false;
  }, [dispatch, password, username]);

  React.useEffect(() => {
    if (userInfo != null) {
      navigate('/');
    }
  }, [navigate, userInfo]);

  const title = 'Sign In';

  return (
    <Row className="login justify-content-center">
      <HeaderTitle title={title} />

      <fieldset className="col-md-7">
        <legend className="title mb-4 border-bottom">{title}</legend>
        <Form>
          <FormGroup className="mb-3" controlId="formGroupEmail">
            <Form.Control type="email" placeholder="Email" onChange={(e) => setUsername(e.target.value)} />
          </FormGroup>
          <FormGroup className="mb-3" controlId="formGroupPassword">
            <Form.Control type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
          </FormGroup>
          <div className="mb-3">
            <Link to="/forgotpassword">Forgot password?</Link> or <Link to="/signup">Create a new account</Link>
          </div>
          <FormGroup className="mb-3">
            <div className="d-grid">
              <Button variant="primary" size="lg" onClick={onClickLogin}>
                Sign in
              </Button>
            </div>
          </FormGroup>
        </Form>
      </fieldset>
    </Row>
  );
};

export default LoginPanel;
