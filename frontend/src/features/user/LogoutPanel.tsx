import React from 'react';

import { Button, Form, FormGroup, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import HeaderTitle from '../../common/HeaderTitle';
import { logout, selectUserInfo } from './userSlice';

const LogoutPanel: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const userInfo = useAppSelector(selectUserInfo);

  const onClickLogout = React.useCallback<React.MouseEventHandler<HTMLButtonElement>>(() => {
    void dispatch(logout());
  }, [dispatch]);

  React.useEffect(() => {
    if (userInfo == null) {
      navigate('/');
    }
  }, [navigate, userInfo]);

  const title = 'Sign Out';

  return (
    <Row className="login justify-content-center">
      <HeaderTitle title={title} />

      <fieldset className="col-md-7">
        <legend className="title mb-4 border-bottom">{title}</legend>
        <Form>
          <FormGroup className="mb-3">
            <div className="d-grid">
              <Button variant="primary" size="lg" onClick={onClickLogout}>
                Sign out
              </Button>
            </div>
          </FormGroup>
        </Form>
      </fieldset>
    </Row>
  );
};

export default LogoutPanel;
