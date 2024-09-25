import React from 'react';

import Ajv from 'ajv';
import classNames from 'classnames';
import ScheduleJsonSchema from '../../assets/schema/ScheduleJSON.json';
import { DashboardConferenceTabProps } from './DashboardConferenceTab';

const DashboardConferenceTabSchedule: React.FC<DashboardConferenceTabProps> = (props) => {
  const { conference } = props;
  const [schedule, setSchedule] = React.useState<string>(conference.schedule ?? '');
  const [wasValidated, setWasValidated] = React.useState<boolean>(false);
  const [isValidJson, setIsValidJson] = React.useState<boolean>(false);
  const [isChanged, setIsChanged] = React.useState<boolean>(false);

  const validateJson = (text: string): boolean => {
    try {
      const ajv = new Ajv();
      return !!ajv.validate(ScheduleJsonSchema, JSON.parse(text));
    } catch {
      return false;
    }
  };

  const onChangeSchedule: React.ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    setSchedule(e.target.value);
    setWasValidated(false);
    setIsChanged(true);
  };

  const onSubmitJson = React.useCallback<React.FormEventHandler<HTMLFormElement>>(
    (e) => {
      e.preventDefault();
      const json = schedule.trim();
      setWasValidated(true);
      const isValid = json === '' || validateJson(json);
      setIsValidJson(isValid);
      if (isValid) {
        // save
      }
      setIsChanged(false);
    },
    [schedule],
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
