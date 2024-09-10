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

const ResetPasswordPanel: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const userInfo = useAppSelector(selectUserInfo);
  const isPreparingUserInfo = useAppSelector(selectIsPreparingUserInfo);
  const pageActionState = useAppSelector(selectPageActionState);

  const [searchParams] = useSearchParams();

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
      const message =
        "Password was reset and sent to you by email. If you don't get it in a few moments, please check your spam folder.";
      dispatch(showMessage({ variant: 'success', message }));
      navigate('/login');
    } else if (pageActionState.status === ApiAsyncStatus.failed) {
      dispatch(showMessage({ variant: 'danger', message: pageActionState.error ?? '' }));
    }
  }, [dispatch, navigate, pageActionState]);

  const title = 'Reset Password';

  const onSubmitReset = React.useCallback<React.FormEventHandler<HTMLFormElement>>(
    (e) => {
      e.preventDefault();
      if (!invalidEmail && userInfo == null) {
        dispatch(resetPassword({ token }));
      }
    },
    [dispatch, token, invalidEmail, userInfo],
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
        <>
          <fieldset>
            <form onSubmit={onSubmitReset} autoComplete="off">
              <div className="mb-3">
                <label className="form-label">
                  Hello <b>{email}</b>, do you really want to reset your password?
                </label>
              </div>
              <div className="mb-3">
                <div className="d-grid">
                  <button className="btn btn-primary btn-lg" type="submit">
                    Reset and send new password
                  </button>
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">If you did not request this, please ignore this message.</label>
              </div>
            </form>
          </fieldset>
        </>
      )}
    </GeneralPanel>
  );
};

export default ResetPasswordPanel;
