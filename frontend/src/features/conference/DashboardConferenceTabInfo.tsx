import React from 'react';

import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { ApiAsyncStatus } from '../../entities/api';
import { showMessage } from '../common/commonSlice';
import { selectPageActionState, unsetPageActionState, updateConferenceInfo } from './conferenceSlice';
import type { DashboardConferenceTabProps } from './DashboardConferenceTab';

const DashboardConferenceTabInfo: React.FC<DashboardConferenceTabProps> = (props) => {
  const { conference } = props;

  const dispatch = useAppDispatch();
  const [info, setInfo] = React.useState<string>(conference.info ?? '');
  const [isChanged, setIsChanged] = React.useState<boolean>(false);
  const pageActionState = useAppSelector(selectPageActionState);

  React.useEffect(() => {
    if (pageActionState.type === 'info') {
      if (pageActionState.status === ApiAsyncStatus.idle) {
        const message = 'Info successfully updated.';
        dispatch(showMessage({ variant: 'success', message }));
        dispatch(unsetPageActionState());
      } else if (pageActionState.status === ApiAsyncStatus.failed) {
        dispatch(showMessage({ variant: 'danger', message: pageActionState.error ?? '' }));
        dispatch(unsetPageActionState());
      }
    }
  }, [dispatch, pageActionState.error, pageActionState.status, pageActionState.type]);

  const onChangeInfo: React.ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    setInfo(e.target.value);
    setIsChanged(true);
  };

  const onSubmitJson = React.useCallback<React.FormEventHandler<HTMLFormElement>>(
    (e) => {
      e.preventDefault();
      dispatch(updateConferenceInfo({ uuid: conference.uuid, info: info.trim() }));
      setIsChanged(false);
    },
    [conference.uuid, dispatch, info],
  );

  return (
    <div className="row">
      <form onSubmit={onSubmitJson}>
        <div>
          <textarea
            className="form-control"
            placeholder="Conference info data. Use markdown."
            rows={12}
            maxLength={10000}
            onChange={onChangeInfo}
            value={info}
          />
        </div>
        <div>
          <button type="submit" className="btn btn-success my-3" disabled={!isChanged}>
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default DashboardConferenceTabInfo;
