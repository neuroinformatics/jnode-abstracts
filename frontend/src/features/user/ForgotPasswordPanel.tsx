import React from 'react';

import classNames from 'classnames';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import GeneralPanel from '../../common/GeneralPanel';
import LoadingOverlay from '../../common/LoadingOverlay';
import { ApiAsyncStatus } from '../../entities/api';
import { showMessage } from '../common/commonSlice';
import {
  requestPasswordReset,
  selectIsPreparingUserInfo,
  selectPageActionState,
  selectUserInfo,
  unsetPageActionState,
} from './userSlice';

const ForgotPasswordPanel: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const userInfo = useAppSelector(selectUserInfo);
  const isPreparingUserInfo = useAppSelector(selectIsPreparingUserInfo);
  const pageActionState = useAppSelector(selectPageActionState);

  const [email, setEmail] = React.useState<string>('');

  React.useEffect(() => {
    return () => {
      dispatch(unsetPageActionState());
    };
  }, [dispatch]);

  React.useEffect(() => {
    if (!isPreparingUserInfo && userInfo != null) {
      navigate('/');
    }
  }, [isPreparingUserInfo, navigate, userInfo]);

  React.useEffect(() => {
    if (pageActionState.status === ApiAsyncStatus.idle) {
      setEmail('');
      const message =
        "A URL to reset your password has been sent to you by email. If you don't get it in a few moments, please check your spam folder.";
      dispatch(showMessage({ variant: 'success', message }));
    } else if (pageActionState.status === ApiAsyncStatus.failed) {
      dispatch(showMessage({ variant: 'danger', message: pageActionState.error ?? '' }));
    }
  }, [dispatch, navigate, pageActionState]);

  const invalidEmail = email.length > 0 && !/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(email);

  const title = 'Reset Password';

  const onChangeEmail: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    e.target.value = e.target.value.trim();
    setEmail(e.target.value);
  };

  const onSubmitReset = React.useCallback<React.FormEventHandler<HTMLFormElement>>(
    (e) => {
      e.preventDefault();
      if (!invalidEmail && userInfo == null) {
        dispatch(requestPasswordReset({ email }));
      }
    },
    [dispatch, email, invalidEmail, userInfo],
  );

  return (
    <GeneralPanel title={title} size={7}>
      {isPreparingUserInfo && <LoadingOverlay message="Loading..." />}
      {pageActionState.status === ApiAsyncStatus.loading && <LoadingOverlay message="Requesting..." />}
      <fieldset>
        <form onSubmit={onSubmitReset} autoComplete="off">
          <div className="mb-5">
            <label className="form-label">Enter email address </label>
            <input
              className={classNames('form-control', { 'is-invalid': invalidEmail })}
              type="email"
              value={email}
              placeholder="your@email.com"
              required
              onChange={onChangeEmail}
              autoComplete="off"
            />
            <div className="invalid-feedback">Please enter the valid e-mail address string.</div>
          </div>
          <div className="mb-3">
            <div className="d-grid">
              <button className="btn btn-primary btn-lg" type="submit">
                Request to reset password
              </button>
            </div>
          </div>
        </form>
      </fieldset>
    </GeneralPanel>
  );
};

export default ForgotPasswordPanel;
