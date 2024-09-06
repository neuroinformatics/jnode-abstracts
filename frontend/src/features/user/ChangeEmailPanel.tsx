import React from 'react';

import classNames from 'classnames';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import AlertPanel from '../../common/AlertPanel';
import GeneralPanel from '../../common/GeneralPanel';
import LoadingOverlay from '../../common/LoadingOverlay';
import { ApiAsyncStatus } from '../../entities/api';
import {
  changeEmail,
  selectChangeEmailState,
  selectIsPreparingUserInfo,
  selectUserInfo,
  unsetChangeEmail,
} from './userSlice';

const ChangeEmailPanel: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const userInfo = useAppSelector(selectUserInfo);
  const isPreparingUserInfo = useAppSelector(selectIsPreparingUserInfo);
  const changeEmailState = useAppSelector(selectChangeEmailState);

  const [newEmail, setNewEmail] = React.useState<string>('');
  const [confirmEmail, setConfirmEmail] = React.useState<string>('');
  const [password, setPassword] = React.useState<string>('');

  React.useEffect(() => {
    if (!isPreparingUserInfo && userInfo == null) {
      navigate('/');
    }
    return () => {
      dispatch(unsetChangeEmail());
    };
  }, [dispatch, isPreparingUserInfo, navigate, userInfo]);

  React.useEffect(() => {
    if (changeEmailState.status === ApiAsyncStatus.idle) {
      setNewEmail('');
      setConfirmEmail('');
      setPassword('');
    }
  }, [dispatch, changeEmailState]);

  const mismatchEmail = newEmail !== confirmEmail;
  const invalidEmail = newEmail.length > 0 && !/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(newEmail);
  const canUpdateEmail = mismatchEmail || invalidEmail;

  const title = 'Change E-Mail';

  const onChangeNewEmail: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    e.target.value = e.target.value.trim();
    setNewEmail(e.target.value);
  };

  const onChangeConfirmEmail: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    e.target.value = e.target.value.trim();
    setConfirmEmail(e.target.value);
  };

  const onChangePassword = React.useCallback<React.ChangeEventHandler<HTMLInputElement>>((e) => {
    e.target.value = e.target.value.trim();
    setPassword(e.target.value);
  }, []);

  const onSubmitSave = React.useCallback<React.FormEventHandler<HTMLFormElement>>(
    (e) => {
      e.preventDefault();
      if (!canUpdateEmail && userInfo != null) {
        dispatch(changeEmail({ uuid: userInfo.uuid, email: newEmail, password: password }));
      }
    },
    [canUpdateEmail, dispatch, newEmail, password, userInfo],
  );

  return (
    <GeneralPanel title={title} size={7}>
      {isPreparingUserInfo && <LoadingOverlay message="Loading..." />}
      {changeEmailState.status === ApiAsyncStatus.loading && <LoadingOverlay message="Changing E-Mail Address..." />}
      {changeEmailState.status === ApiAsyncStatus.idle && (
        <AlertPanel variant="success">E-Mail address successfully changed.</AlertPanel>
      )}
      {changeEmailState.error != null && <AlertPanel variant="danger">{changeEmailState.error}</AlertPanel>}
      <fieldset>
        <form onSubmit={onSubmitSave} autoComplete="off">
          <div className="mb-3">
            <label className="form-label">
              New E-Mail Address <span className="text-danger">*</span>
            </label>
            <input
              className={classNames('form-control', { 'is-invalid': invalidEmail })}
              type="email"
              value={newEmail}
              placeholder="Enter New E-Mail Address"
              required
              onChange={onChangeNewEmail}
              autoComplete="off"
            />
            <div className="invalid-feedback">Please enter the valid e-mail address string.</div>
          </div>
          <div className="mb-3">
            <label className="form-label">
              Confirm E-Mail Address <span className="text-danger">*</span>
            </label>
            <input
              className={classNames('form-control', { 'is-invalid': mismatchEmail })}
              type="email"
              value={confirmEmail}
              placeholder="Confirm New E-Mail Address"
              required
              onChange={onChangeConfirmEmail}
              autoComplete="off"
            />
            <div className="invalid-feedback">Please make sure new e-mail address match.</div>
          </div>
          <div className="mb-5">
            <label className="form-label">
              Current Password <span className="text-danger">*</span>
            </label>
            <input
              className="form-control"
              type="password"
              value={password}
              placeholder="Enter Your Current Password"
              required
              onChange={onChangePassword}
              autoComplete="off"
            />
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

export default ChangeEmailPanel;
