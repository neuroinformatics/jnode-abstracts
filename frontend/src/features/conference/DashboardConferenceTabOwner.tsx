import React from 'react';

import { faPlus, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import LoadingOverlay from '../../common/LoadingOverlay';
import { ApiAsyncStatus } from '../../entities/api';
import { showMessage } from '../common/commonSlice';
import {
  exists,
  selectPageActionState as selectUserPageActionState,
  unsetPageActionState as unsetUserPageActionState,
} from '../user/userSlice';
import { DashboardConferenceTabProps } from './DashboardConferenceTab';
import { selectPageActionState, unsetPageActionState, updateConferenceOwners } from './conferenceSlice';

const DashboardConferenceTabOwner: React.FC<DashboardConferenceTabProps> = (props) => {
  const { conference } = props;

  const dispatch = useAppDispatch();
  const [owners, setOwners] = React.useState<string[]>(
    conference.owners != null ? conference.owners.map((o) => o.mail).sort((a, b) => a.localeCompare(b)) : [],
  );
  const [isChanged, setIsChanged] = React.useState<boolean>(false);
  const [email, setEmail] = React.useState<string>('');
  const userPageActionState = useAppSelector(selectUserPageActionState);
  const pageActionState = useAppSelector(selectPageActionState);

  React.useEffect(() => {
    if (userPageActionState.status === ApiAsyncStatus.idle) {
      const data = email.trim();
      setOwners((prev) => [...prev, data].sort((a, b) => a.localeCompare(b)));
      dispatch(unsetUserPageActionState());
      setEmail('');
      setIsChanged(true);
    } else if (userPageActionState.status === ApiAsyncStatus.failed) {
      dispatch(showMessage({ variant: 'danger', message: userPageActionState.error ?? '' }));
      dispatch(unsetUserPageActionState());
      setEmail('');
    }
  }, [dispatch, email, userPageActionState.error, userPageActionState.status]);

  React.useEffect(() => {
    if (pageActionState.type === 'owners') {
      if (pageActionState.status === ApiAsyncStatus.idle) {
        const message = 'Owners successfully updated.';
        dispatch(showMessage({ variant: 'success', message }));
        dispatch(unsetPageActionState());
        setEmail('');
        setIsChanged(false);
      } else if (pageActionState.status === ApiAsyncStatus.failed) {
        dispatch(showMessage({ variant: 'danger', message: pageActionState.error ?? '' }));
        dispatch(unsetPageActionState());
        setEmail('');
      }
    }
  }, [dispatch, pageActionState.error, pageActionState.status, pageActionState.type]);

  const onChangeEmail: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setEmail(e.target.value.trim());
  };

  const onClickRemove = (idx: number): void => {
    setIsChanged(true);
    setOwners((prev) => prev.filter((_, pIdx) => pIdx !== idx));
  };

  const onSubmitAdd = React.useCallback<React.FormEventHandler<HTMLFormElement>>(
    (e) => {
      e.preventDefault();
      const data = email.trim();
      dispatch(exists({ email: data }));
    },
    [dispatch, email],
  );

  const onSubmitOwner = React.useCallback<React.FormEventHandler<HTMLFormElement>>(
    (e) => {
      e.preventDefault();
      dispatch(updateConferenceOwners({ uuid: conference.uuid, owners }));
    },
    [conference.uuid, dispatch, owners],
  );

  return (
    <div>
      {pageActionState.type === 'owners' && pageActionState.status === ApiAsyncStatus.loading && (
        <LoadingOverlay message="Updating Owners..." />
      )}
      <p>Here is the list of current owners:</p>
      <ul>
        {owners.map((owner, idx) => (
          <li className="my-1" key={idx}>
            <strong>{owner}</strong>{' '}
            <button className="btn btn-sm btn-danger" onClick={() => onClickRemove(idx)}>
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </li>
        ))}
      </ul>
      <div className="d-flex flex-wrap align-items-center">
        <div className="row g-2 align-items-center">
          <div className="col-auto">Add owner by e-mail:</div>
          <div className="col-auto">
            <input
              form="owner"
              className="form-control"
              type="email"
              placeholder="enter a valid e-mail here"
              size={32}
              value={email}
              onChange={onChangeEmail}
              required
            />
          </div>
          <div className="col-auto">
            <form id="owner" onSubmit={onSubmitAdd}>
              <button className="btn btn-primary text-nowrap">
                <FontAwesomeIcon icon={faPlus} /> Add
              </button>
            </form>
          </div>
          <div className="col-auto">and after</div>
          <div className="col-auto">
            <form onSubmit={onSubmitOwner}>
              <button type="submit" className="btn btn-success text-nowrap" disabled={!isChanged}>
                Save changes
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardConferenceTabOwner;
