import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import ForbiddenAccess from '../../common/ForbiddenAccess';
import GeneralPanel from '../../common/GeneralPanel';
import LoadingOverlay from '../../common/LoadingOverlay';
import { ApiAsyncStatus } from '../../entities/api';
import { showMessage } from '../common/commonSlice';
import { selectUserInfo } from '../user/userSlice';
import { createConference, getConferenceList, selectPageActionState, unsetPageActionState } from './conferenceSlice';

// only the dates are entered, as on the conference settings page
const toDateTime = (date: string): string => `${date}T00:00:00`;

const DashboardConferenceCreatePanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const userInfo = useAppSelector(selectUserInfo);
  const pageActionState = useAppSelector(selectPageActionState);
  const [name, setName] = React.useState<string>('');
  const [shortName, setShortName] = React.useState<string>('');
  const [startDate, setStartDate] = React.useState<string>('');
  const [endDate, setEndDate] = React.useState<string>('');
  const [deadline, setDeadline] = React.useState<string>('');

  React.useEffect(() => {
    if (pageActionState.type === 'create' && pageActionState.status === ApiAsyncStatus.failed) {
      dispatch(showMessage({ variant: 'danger', message: pageActionState.error ?? '' }));
      dispatch(unsetPageActionState());
    }
  }, [dispatch, pageActionState.error, pageActionState.status, pageActionState.type]);

  const onSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    dispatch(
      createConference({
        name: name.trim(),
        shortName: shortName.trim(),
        startDate: toDateTime(startDate),
        endDate: toDateTime(endDate),
        deadline: toDateTime(deadline),
      }),
    ).then((action) => {
      if (createConference.fulfilled.match(action)) {
        const { uuid } = action.payload;
        dispatch(unsetPageActionState());
        dispatch(showMessage({ variant: 'success', message: 'Conference successfully created.' }));
        // the dashboard looks up the conference in the list, so reload it first
        dispatch(getConferenceList()).then(() => navigate(`/dashboard/conference/${uuid}`));
      }
    });
  };

  if (userInfo == null || !userInfo.isAdmin) {
    return <ForbiddenAccess />;
  }

  return (
    <GeneralPanel title="Create Conference" size={8}>
      {pageActionState.type === 'create' && pageActionState.status === ApiAsyncStatus.loading && (
        <LoadingOverlay message="Creating Conference..." />
      )}
      <p>
        The conference is created closed and unpublished, with you as its owner. Fill in the other settings on the
        conference settings page afterwards.
      </p>
      <form onSubmit={onSubmit}>
        <div className="row mb-3">
          <label htmlFor="name" className="col-sm-3 col-form-label">
            Name
          </label>
          <div className="col-sm-9">
            <input
              id="name"
              className="form-control"
              type="text"
              placeholder="Name of the conference"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="row mb-3">
          <label htmlFor="shortName" className="col-sm-3 col-form-label">
            Short name
          </label>
          <div className="col-sm-9">
            <input
              id="shortName"
              className="form-control"
              type="text"
              placeholder="e.g. JNNS2027, used in the conference URL"
              pattern="[A-Za-z0-9_\-]+"
              title="Letters, digits, hyphens and underscores"
              value={shortName}
              onChange={(e) => setShortName(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="row mb-3">
          <label htmlFor="startDate" className="col-sm-3 col-form-label">
            Start date
          </label>
          <div className="col-sm-9">
            <input
              id="startDate"
              className="form-control"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="row mb-3">
          <label htmlFor="endDate" className="col-sm-3 col-form-label">
            End date
          </label>
          <div className="col-sm-9">
            <input
              id="endDate"
              className="form-control"
              type="date"
              min={startDate}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="row mb-3">
          <label htmlFor="deadline" className="col-sm-3 col-form-label">
            Submission deadline
          </label>
          <div className="col-sm-9">
            <input
              id="deadline"
              className="form-control"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              required
            />
          </div>
        </div>
        <button type="submit" className="btn btn-success">
          Create
        </button>
      </form>
    </GeneralPanel>
  );
};

export default DashboardConferenceCreatePanel;
