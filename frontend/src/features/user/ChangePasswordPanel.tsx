import React from 'react';

import classNames from 'classnames';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import AlertPanel from '../../common/AlertPanel';
import GeneralPanel from '../../common/GeneralPanel';
import LoadingOverlay from '../../common/LoadingOverlay';
import { ApiAsyncStatus } from '../../entities/api';
import {
  changePassword,
  selectChangePasswordState,
  selectIsPreparingUserInfo,
  selectUserInfo,
  unsetChangePassword,
} from './userSlice';

const ChangePasswordPanel: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const userInfo = useAppSelector(selectUserInfo);
  const isPreparingUserInfo = useAppSelector(selectIsPreparingUserInfo);
  const changePasswordState = useAppSelector(selectChangePasswordState);

  const [oldPassword, setOldPassword] = React.useState<string>('');
  const [newPassword, setNewPassword] = React.useState<string>('');
  const [confirmPassword, setConfirmPassword] = React.useState<string>('');

  React.useEffect(() => {
    if (!isPreparingUserInfo && userInfo == null) {
      navigate('/');
    }
    return () => {
      dispatch(unsetChangePassword());
    };
  }, [dispatch, isPreparingUserInfo, navigate, userInfo]);

  React.useEffect(() => {
    if (changePasswordState.status === ApiAsyncStatus.idle) {
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  }, [dispatch, changePasswordState]);

  const mismatchPassword = newPassword !== confirmPassword;
  const invalidPassword =
    newPassword.length > 0 &&
    (newPassword.length < 10 ||
      !/[a-z]/i.test(newPassword) ||
      !/\d/.test(newPassword) ||
      !/[.,/<>?!@#$%^&*()=`_+|~{};':"\-\\[\]]/.test(newPassword));
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
        dispatch(changePassword({ uuid: userInfo.uuid, oldPassword: oldPassword, newPassword: newPassword }));
      }
    },
    [canUpdatePassword, oldPassword, dispatch, newPassword, userInfo],
  );

  return (
    <GeneralPanel title={title} size={7}>
      {isPreparingUserInfo && <LoadingOverlay message="Loading..." />}
      {changePasswordState.status === ApiAsyncStatus.loading && <LoadingOverlay message="Changing Password..." />}
      {changePasswordState.status === ApiAsyncStatus.idle && (
        <AlertPanel variant="success">Password successfully changed.</AlertPanel>
      )}
      {changePasswordState.error != null && <AlertPanel variant="danger">{changePasswordState.error}</AlertPanel>}
      <fieldset>
        <form onSubmit={onSubmitSave} autoComplete="off">
          <div className="mb-3">
            <label className="form-label">
              Current Password <span className="text-danger">*</span>
            </label>
            <input
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
            <label className="form-label">
              New Password <span className="text-danger">*</span>
            </label>
            <input
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
            <label className="form-label">
              Confirm New Password <span className="text-danger">*</span>
            </label>
            <input
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
