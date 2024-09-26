import React from 'react';

import Ajv from 'ajv';
import classNames from 'classnames';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import GeoJsonSchema from '../../assets/schema/GeoJSON.json';
import { ApiAsyncStatus } from '../../entities/api';
import { showMessage } from '../common/commonSlice';
import { selectPageActionState, unsetPageActionState, updateConferenceGeo } from './conferenceSlice';
import { DashboardConferenceTabProps } from './DashboardConferenceTab';

const DashboardConferenceTabMaps: React.FC<DashboardConferenceTabProps> = (props) => {
  const { conference } = props;

  const dispatch = useAppDispatch();
  const [maps, setMaps] = React.useState<string>(conference.geo ?? '');
  const [wasValidated, setWasValidated] = React.useState<boolean>(false);
  const [isValidJson, setIsValidJson] = React.useState<boolean>(false);
  const [isChanged, setIsChanged] = React.useState<boolean>(false);
  const pageActionState = useAppSelector(selectPageActionState);

  React.useEffect(() => {
    if (pageActionState.type === 'geo') {
      if (pageActionState.status === ApiAsyncStatus.idle) {
        const message = 'Maps successfully updated.';
        dispatch(showMessage({ variant: 'success', message }));
        dispatch(unsetPageActionState());
        setIsChanged(false);
      } else if (pageActionState.status === ApiAsyncStatus.failed) {
        dispatch(showMessage({ variant: 'danger', message: pageActionState.error ?? '' }));
        dispatch(unsetPageActionState());
      }
    }
  }, [dispatch, pageActionState.error, pageActionState.status, pageActionState.type]);

  const validateJson = (text: string): boolean => {
    try {
      const ajv = new Ajv();
      return !!ajv.validate(GeoJsonSchema, JSON.parse(text));
    } catch {
      return false;
    }
  };

  const onChangeMaps: React.ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    setMaps(e.target.value);
    setWasValidated(false);
    setIsChanged(true);
  };

  const onSubmitJson = React.useCallback<React.FormEventHandler<HTMLFormElement>>(
    (e) => {
      e.preventDefault();
      const json = maps.trim();
      setMaps(json);
      setWasValidated(true);
      const isValid = json === '' || validateJson(json);
      setIsValidJson(isValid);
      if (isValid) {
        dispatch(updateConferenceGeo({ uuid: conference.uuid, geo: maps.trim() }));
      }
      setIsChanged(false);
    },
    [conference.uuid, dispatch, maps],
  );

  return (
    <div className="row">
      <form onSubmit={onSubmitJson}>
        <div className="mb-3">
          <textarea
            className={classNames('form-control', wasValidated && !isValidJson && 'is-invalid')}
            placeholder="Conference geo information in GeoJSON format. 'name', 'description' and 'floorplans' can be included in the `properties`."
            rows={12}
            maxLength={10000}
            onChange={onChangeMaps}
            value={maps}
          />
          <div className="invalid-feedback">Data is not formatted according to GeoJson.</div>
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

export default DashboardConferenceTabMaps;
