import classNames from 'classnames';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import GeneralPanel from '../../common/GeneralPanel';
import LoadingOverlay from '../../common/LoadingOverlay';
import { ApiAsyncStatus } from '../../entities/api';
import { showMessage } from '../common/commonSlice';
import {
  changePassword,
  selectIsPreparingUserInfo,
  selectPageActionState,
  selectUserInfo,
  unsetPageActionState,
} from './userSlice';
import { isValidPassword } from './userUtilities';

const ChangePasswordPanel: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const userInfo = useAppSelector(selectUserInfo);
  const isPreparingUserInfo = useAppSelector(selectIsPreparingUserInfo);
  const pageActionState = useAppSelector(selectPageActionState);

  const [oldPassword, setOldPassword] = React.useState<string>('');
  const [newPassword, setNewPassword] = React.useState<string>('');
  const [confirmPassword, setConfirmPassword] = React.useState<string>('');

  React.useEffect(() => {
    return () => {
      dispatch(unsetPageActionState());
    };
  }, [dispatch]);

  React.useEffect(() => {
    if (!isPreparingUserInfo && userInfo == null) {
      navigate('/');
    }
  }, [isPreparingUserInfo, navigate, userInfo]);

  React.useEffect(() => {
    if (pageActionState.status === ApiAsyncStatus.idle) {
      const message = 'Password successfully changed.';
      dispatch(showMessage({ variant: 'success', message }));
    } else if (pageActionState.status === ApiAsyncStatus.failed) {
      dispatch(showMessage({ variant: 'danger', message: pageActionState.error ?? '' }));
    }
  }, [dispatch, pageActionState]);

  const mismatchPassword = newPassword !== confirmPassword;
  const invalidPassword = newPassword.length > 0 && !isValidPassword(newPassword);
  const canUpdatePassword = mismatchPassword || invalidPassword;

  const title = 'Change Password';

  const onChangeOldPassword: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    e.target.value = e.target.value.trim();
    setOldPassword(e.target.value);
  };

  const onChangeNewPassword: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    e.target.value = e.target.value.trim();
    setNewPassword(e.target.value);
  };

  const onChangeConfirm = React.useCallback<React.ChangeEventHandler<HTMLInputElement>>((e) => {
    e.target.value = e.target.value.trim();
    setConfirmPassword(e.target.value);
  }, []);

  const onSubmitSave = React.useCallback<React.FormEventHandler<HTMLFormElement>>(
    (e) => {
      e.preventDefault();
      if (!canUpdatePassword && userInfo != null) {
        dispatch(changePassword({ uuid: userInfo.uuid, oldPassword: oldPassword, newPassword: newPassword })).then(
          (action) => {
            if (changePassword.fulfilled.match(action)) {
              setOldPassword('');
              setNewPassword('');
              setConfirmPassword('');
            }
          },
        );
      }
    },
    [canUpdatePassword, oldPassword, dispatch, newPassword, userInfo],
  );

  return (
    <GeneralPanel title={title} size={7}>
      {isPreparingUserInfo && <LoadingOverlay message="Loading..." />}
      {pageActionState.status === ApiAsyncStatus.loading && <LoadingOverlay message="Changing Password..." />}
      <fieldset>
        <form onSubmit={onSubmitSave} autoComplete="off">
          <div className="mb-3">
            <label htmlFor="old-password" className="form-label">
              Current Password <span className="text-danger">*</span>
            </label>
            <input
              id="old-password"
              className="form-control"
              type="password"
              value={oldPassword}
              placeholder="Enter Current Password"
              required
              onChange={onChangeOldPassword}
              autoComplete="off"
            />
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
              onChange={onChangeNewPassword}
              autoComplete="new-password"
            />
            <div className="invalid-feedback">
              Please enter at least 10 characters, needs at least one number and one symbol.
            </div>
          </div>
          <div className="mb-5">
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
              onChange={onChangeConfirm}
              autoComplete="off"
            />
            <div className="invalid-feedback">Please make sure your passwords match.</div>
          </div>
          <div className="mb-3">
            <div className="d-grid">
              <button className="btn btn-primary btn-lg" type="submit">
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </fieldset>
    </GeneralPanel>
  );
};

export default ChangePasswordPanel;
