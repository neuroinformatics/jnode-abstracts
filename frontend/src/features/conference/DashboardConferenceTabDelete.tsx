import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import LoadingOverlay from '../../common/LoadingOverlay';
import { ApiAsyncStatus } from '../../entities/api';
import { showMessage } from '../common/commonSlice';
import { deleteConference, getConferenceList, selectPageActionState, unsetPageActionState } from './conferenceSlice';
import type { DashboardConferenceTabProps } from './DashboardConferenceTab';

const DashboardConferenceTabDelete: React.FC<DashboardConferenceTabProps> = (props) => {
  const { conference } = props;

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const pageActionState = useAppSelector(selectPageActionState);
  const [confirmation, setConfirmation] = React.useState<string>('');

  React.useEffect(() => {
    if (pageActionState.type === 'delete' && pageActionState.status === ApiAsyncStatus.failed) {
      dispatch(showMessage({ variant: 'danger', message: pageActionState.error ?? '' }));
      dispatch(unsetPageActionState());
    }
  }, [dispatch, pageActionState.error, pageActionState.status, pageActionState.type]);

  const onSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    dispatch(deleteConference(conference.uuid)).then((action) => {
      if (deleteConference.fulfilled.match(action)) {
        dispatch(unsetPageActionState());
        dispatch(showMessage({ variant: 'success', message: 'Conference successfully deleted.' }));
        dispatch(getConferenceList());
        navigate('/conferences');
      }
    });
  };

  return (
    <div>
      {pageActionState.type === 'delete' && pageActionState.status === ApiAsyncStatus.loading && (
        <LoadingOverlay message="Deleting Conference..." />
      )}
      <p className="text-danger fw-bold">
        Deleting the conference also deletes all of its abstracts, figures and banners. This cannot be undone.
      </p>
      <form onSubmit={onSubmit}>
        <div className="row g-2 align-items-center">
          <div className="col-auto">
            <label htmlFor="delete-confirmation" className="col-form-label">
              Type <strong>{conference.shortName}</strong> to confirm:
            </label>
          </div>
          <div className="col-auto">
            <input
              id="delete-confirmation"
              className="form-control"
              type="text"
              autoComplete="off"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
            />
          </div>
          <div className="col-auto">
            <button type="submit" className="btn btn-danger" disabled={confirmation !== conference.shortName}>
              Delete conference
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default DashboardConferenceTabDelete;
