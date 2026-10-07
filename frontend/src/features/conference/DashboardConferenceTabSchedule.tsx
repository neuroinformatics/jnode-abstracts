import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import classNames from 'classnames';
import React from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import ScheduleJsonSchema from '../../assets/schema/ScheduleJSON.json';
import { ApiAsyncStatus } from '../../entities/api';
import { showMessage } from '../common/commonSlice';
import {
  getConferenceDetail,
  selectPageActionState,
  unsetPageActionState,
  updateConferenceSchedule,
} from './conferenceSlice';
import type { DashboardConferenceTabProps } from './DashboardConferenceTab';

const validateSchema = addFormats(new Ajv()).compile(ScheduleJsonSchema);

const validateJson = (text: string): boolean => {
  try {
    return validateSchema(JSON.parse(text));
  } catch {
    return false;
  }
};

const DashboardConferenceTabSchedule: React.FC<DashboardConferenceTabProps> = (props) => {
  const { conference } = props;

  const dispatch = useAppDispatch();
  const [schedule, setSchedule] = React.useState<string>(conference.schedule ?? '');
  const [wasValidated, setWasValidated] = React.useState<boolean>(false);
  const [isValidJson, setIsValidJson] = React.useState<boolean>(false);
  const [isChanged, setIsChanged] = React.useState<boolean>(false);
  const pageActionState = useAppSelector(selectPageActionState);

  React.useEffect(() => {
    if (pageActionState.type === 'schedule') {
      if (pageActionState.status === ApiAsyncStatus.idle) {
        const message = 'Schedule successfully updated.';
        dispatch(showMessage({ variant: 'success', message }));
        dispatch(getConferenceDetail(conference.uuid));
        dispatch(unsetPageActionState());
      } else if (pageActionState.status === ApiAsyncStatus.failed) {
        dispatch(showMessage({ variant: 'danger', message: pageActionState.error ?? '' }));
        dispatch(unsetPageActionState());
      }
    }
  }, [conference.uuid, dispatch, pageActionState.error, pageActionState.status, pageActionState.type]);

  const onChangeSchedule: React.ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    setSchedule(e.target.value);
    setWasValidated(false);
    setIsChanged(true);
  };

  const onSubmitJson = React.useCallback<React.FormEventHandler<HTMLFormElement>>(
    (e) => {
      e.preventDefault();
      const json = schedule.trim();
      setSchedule(json);
      setWasValidated(true);
      const isValid = json === '' || validateJson(json);
      setIsValidJson(isValid);
      if (isValid) {
        dispatch(updateConferenceSchedule({ uuid: conference.uuid, schedule: schedule.trim() }));
      }
      setIsChanged(false);
    },
    [conference.uuid, dispatch, schedule],
  );

  return (
    <div className="row">
      <form onSubmit={onSubmitJson}>
        <div>
          <textarea
            className={classNames('form-control', wasValidated && !isValidJson && 'is-invalid')}
            placeholder="Conference schedule information. Requires well-formed JSON."
            rows={12}
            maxLength={10000}
            onChange={onChangeSchedule}
            value={schedule}
          />
          <div className="invalid-feedback">Data is not formatted according to well-formed JSON.</div>
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

export default DashboardConferenceTabSchedule;
