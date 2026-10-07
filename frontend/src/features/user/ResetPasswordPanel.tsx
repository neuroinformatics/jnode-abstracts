import classNames from 'classnames';
import React from 'react';

import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import AlertPanel from '../../common/AlertPanel';
import GeneralPanel from '../../common/GeneralPanel';
import LoadingOverlay from '../../common/LoadingOverlay';
import { ApiAsyncStatus } from '../../entities/api';
import { showMessage } from '../common/commonSlice';
import {
  resetPassword,
  selectIsPreparingUserInfo,
  selectPageActionState,
  selectUserInfo,
  unsetPageActionState,
} from './userSlice';
import { isValidPassword } from './userUtilities';

const ResetPasswordPanel: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const userInfo = useAppSelector(selectUserInfo);
  const isPreparingUserInfo = useAppSelector(selectIsPreparingUserInfo);
  const pageActionState = useAppSelector(selectPageActionState);

  const [searchParams] = useSearchParams();
  const [newPassword, setNewPassword] = React.useState<string>('');
  const [confirmPassword, setConfirmPassword] = React.useState<string>('');

  const token = searchParams.get('token') ?? '';
  const a = atob(token);
  const email = a.split(':', 1)[0];
  const invalidEmail = email.length > 0 && !/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(email);

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
      const message = 'Password was changed. Please log in with the new password.';
      dispatch(showMessage({ variant: 'success', message }));
      navigate('/login');
    } else if (pageActionState.status === ApiAsyncStatus.failed) {
      dispatch(showMessage({ variant: 'danger', message: pageActionState.error ?? '' }));
    }
  }, [dispatch, navigate, pageActionState]);

  const title = 'Reset Password';

  const mismatchPassword = newPassword !== confirmPassword;
  const invalidPassword = newPassword.length > 0 && !isValidPassword(newPassword);

  const onSubmitReset = React.useCallback<React.FormEventHandler<HTMLFormElement>>(
    (e) => {
      e.preventDefault();
      if (!invalidEmail && !invalidPassword && !mismatchPassword && userInfo == null) {
        dispatch(resetPassword({ token, newPassword }));
      }
    },
    [dispatch, token, newPassword, invalidEmail, invalidPassword, mismatchPassword, userInfo],
  );

  return (
    <GeneralPanel title={title} size={7}>
      {isPreparingUserInfo && <LoadingOverlay message="Loading..." />}
      {pageActionState.status === ApiAsyncStatus.loading && <LoadingOverlay message="Requesting..." />}
      {invalidEmail ? (
        <AlertPanel title="Error" variant="danger">
          Invalid reset <b>token</b> parameter found.
        </AlertPanel>
      ) : (
        <fieldset>
          <form onSubmit={onSubmitReset} autoComplete="off">
            <div className="mb-3">
              <p className="mb-0">
                Hello <b>{email}</b>, please choose a new password.
              </p>
            </div>
            <div className="mb-3">
              <label htmlFor="new-password" className="form-label">
                New Password <span className="text-danger">*</span>
              </label>
              <input
                id="new-password"
                className={classNames('form-control', { 'is-invalid': invalidPassword })}
                type="password"
                value={newPassword}
                placeholder="Enter New Password"
                required
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
              />
              <div className="invalid-feedback">
                Please enter at least 10 characters, needs at least one number and one symbol.
              </div>
            </div>
            <div className="mb-4">
              <label htmlFor="confirm-password" className="form-label">
                Confirm New Password <span className="text-danger">*</span>
              </label>
              <input
                id="confirm-password"
                className={classNames('form-control', { 'is-invalid': mismatchPassword })}
                type="password"
                value={confirmPassword}
                placeholder="Confirm New Password"
                required
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
              <div className="invalid-feedback">Please make sure your passwords match.</div>
            </div>
            <div className="mb-3">
              <div className="d-grid">
                <button className="btn btn-primary btn-lg" type="submit">
                  Set new password
                </button>
              </div>
            </div>
            <div className="mb-3">
              <p className="mb-0">If you did not request this, please ignore this message.</p>
            </div>
          </form>
        </fieldset>
      )}
    </GeneralPanel>
  );
};

export default ResetPasswordPanel;
