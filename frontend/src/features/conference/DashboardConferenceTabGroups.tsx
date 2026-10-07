import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import React from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import AlertPanel from '../../common/AlertPanel';
import { ApiAsyncStatus } from '../../entities/api';
import type { AbstractGroupEntity } from '../../entities/conference';
import { showMessage } from '../common/commonSlice';
import {
  getConferenceDetail,
  selectPageActionState,
  unsetPageActionState,
  updateConferenceAbstractGroups,
} from './conferenceSlice';
import type { DashboardConferenceTabProps } from './DashboardConferenceTab';

// abstract group with a client-side key to identify table rows, since new groups have no uuid yet
type EditableAbstractGroup = AbstractGroupEntity & { key: string };

let newGroupKeySeq = 0;

// prefixes are stored in the upper 16 bits of the abstract sort ids, which must stay positive
const PREFIX_MAX = 0x7fff;

const DashboardConferenceTabGroups: React.FC<DashboardConferenceTabProps> = (props) => {
  const { conference } = props;

  const dispatch = useAppDispatch();
  const pageActionState = useAppSelector(selectPageActionState);

  const [abstractGroups, setAbstractGroups] = React.useState<EditableAbstractGroup[]>(() =>
    structuredClone(conference.abstractGroups).map((g) => ({ ...g, key: g.uuid ?? `new-${newGroupKeySeq++}` })),
  );
  const [isChanged, setIsChanged] = React.useState<boolean>(false);
  const [wasValidated, setWasValidated] = React.useState<boolean>(false);
  const [prefix, setPrefix] = React.useState<string>('');
  const [shortName, setShortName] = React.useState<string>('');
  const [name, setName] = React.useState<string>('');

  React.useEffect(() => {
    if (pageActionState.type === 'abstractGroups') {
      if (pageActionState.status === ApiAsyncStatus.idle) {
        const message = 'Groups successfully updated.';
        dispatch(showMessage({ variant: 'success', message }));
        dispatch(getConferenceDetail(conference.uuid));
        dispatch(unsetPageActionState());
      } else if (pageActionState.status === ApiAsyncStatus.failed) {
        dispatch(showMessage({ variant: 'danger', message: pageActionState.error ?? '' }));
        dispatch(unsetPageActionState());
      }
    }
  }, [conference.uuid, dispatch, pageActionState.error, pageActionState.status, pageActionState.type]);

  const validationResult = React.useMemo(() => {
    const prefixMap: number[] = [];
    const shortNameMap: string[] = [];
    const nameMap: string[] = [];
    const details = abstractGroups.map((obj) => {
      const isValidPrefix = prefixMap.find((m) => m === obj.prefix) == null;
      const isValidShortName = shortNameMap.find((m) => m === obj.shortName) == null;
      const isValidName = nameMap.find((m) => m === obj.name) == null;
      prefixMap.push(obj.prefix);
      shortNameMap.push(obj.shortName);
      nameMap.push(obj.name);
      return { isValidPrefix, isValidShortName, isValidName };
    });
    const isValid = details.find((r) => !r.isValidPrefix || !r.isValidShortName || !r.isValidName) == null;
    return { isValid, details };
  }, [abstractGroups]);

  const cleanup = React.useCallback(() => {
    const isDirty = abstractGroups.find(
      (obj) => obj.shortName !== obj.shortName.trim() || obj.name !== obj.name.trim(),
    );
    if (isDirty) {
      setAbstractGroups((prev) =>
        prev.map((obj) => {
          const shortName = obj.shortName.trim();
          const name = obj.name.trim();
          return { ...obj, shortName, name };
        }),
      );
    }
    return !isDirty;
  }, [abstractGroups]);

  const onChangePrefix = (idx: number, e: React.ChangeEvent<HTMLInputElement>): void => {
    setIsChanged(true);
    setWasValidated(false);
    if (/^\d+$/.test(e.target.value)) {
      const prefix = parseInt(e.target.value, 10);
      e.target.blur();
      setAbstractGroups((prev) => prev.map((obj, pIdx) => (pIdx === idx ? { ...obj, prefix } : obj)));
    }
  };
  const onChangeShortName = (idx: number, e: React.ChangeEvent<HTMLInputElement>): void => {
    const shortName = e.target.value;
    setIsChanged(true);
    setWasValidated(false);
    setAbstractGroups((prev) => prev.map((obj, pIdx) => (pIdx === idx ? { ...obj, shortName } : obj)));
  };
  const onChangeName = (idx: number, e: React.ChangeEvent<HTMLInputElement>): void => {
    const name = e.target.value;
    setIsChanged(true);
    setWasValidated(false);
    setAbstractGroups((prev) => prev.map((obj, pIdx) => (pIdx === idx ? { ...obj, name } : obj)));
  };
  const onClickRemove = (idx: number): void => {
    setIsChanged(true);
    setWasValidated(false);
    setAbstractGroups((prev) => prev.filter((_, pIdx) => pIdx !== idx));
  };

  const onChangeNewPrefix: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setPrefix(e.target.value);
  };
  const onChangeNewShortName: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setShortName(e.target.value);
  };
  const onChangeNewName: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setName(e.target.value);
  };
  const onSubmitCreate: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    setIsChanged(true);
    setWasValidated(false);
    setAbstractGroups((prev) => [
      ...prev,
      {
        key: `new-${newGroupKeySeq++}`,
        uuid: null,
        prefix: parseInt(prefix, 10),
        shortName: shortName.trim(),
        name: name.trim(),
      },
    ]);
    setPrefix('');
    setShortName('');
    setName('');
  };

  const onSubmitSave: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    setPrefix('');
    setShortName('');
    setName('');
    setWasValidated(true);
    if (cleanup() && validationResult.isValid) {
      dispatch(
        updateConferenceAbstractGroups({
          uuid: conference.uuid,
          abstractGroups: abstractGroups.map(({ key: _key, ...g }) => g),
        }),
      );
      setIsChanged(false);
    }
  };

  return (
    <div>
      <table className="table">
        <thead>
          <tr>
            <th className="col-3 col-sm-2">Prefix</th>
            <th className="col-3 col-sm-3">Short</th>
            <th className="col-5 col-sm-6">Long</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {abstractGroups.map((g, idx) => (
            <tr key={g.key} className="align-middle">
              <td>
                <input
                  form="groups"
                  className={classNames(
                    'form-control',
                    wasValidated && !validationResult.details[idx].isValidPrefix && 'is-invalid',
                  )}
                  type="number"
                  min={0}
                  max={PREFIX_MAX}
                  value={g.prefix}
                  required
                  onChange={(e) => onChangePrefix(idx, e)}
                />
              </td>
              <td>
                <input
                  form="groups"
                  className={classNames(
                    'form-control',
                    wasValidated && !validationResult.details[idx].isValidShortName && 'is-invalid',
                  )}
                  type="text"
                  maxLength={255}
                  value={g.shortName}
                  pattern="[a-zA-Z0-9_\-]+"
                  required
                  onChange={(e) => onChangeShortName(idx, e)}
                />
              </td>
              <td>
                <input
                  form="groups"
                  className={classNames(
                    'form-control',
                    wasValidated && !validationResult.details[idx].isValidName && 'is-invalid',
                  )}
                  type="text"
                  maxLength={255}
                  value={g.name}
                  required
                  onChange={(e) => onChangeName(idx, e)}
                />
              </td>
              <td>
                <button type="button" className="btn btn-danger btn-sm text-nowrap" onClick={() => onClickRemove(idx)}>
                  <FontAwesomeIcon icon={faTrash} /> Remove
                </button>
              </td>
            </tr>
          ))}
          <tr className="align-middle">
            <td>
              <input
                form="group"
                className="form-control"
                type="number"
                min={0}
                max={PREFIX_MAX}
                value={prefix}
                required
                onChange={onChangeNewPrefix}
              />
            </td>
            <td>
              <input
                form="group"
                className="form-control"
                type="text"
                maxLength={255}
                value={shortName}
                pattern="[a-zA-Z0-9_\-]+"
                required
                onChange={onChangeNewShortName}
              />
            </td>
            <td>
              <input
                form="group"
                className="form-control"
                type="text"
                maxLength={255}
                value={name}
                required
                onChange={onChangeNewName}
              />
            </td>
            <td>
              <form id="group" onSubmit={onSubmitCreate}>
                <button type="submit" className="btn btn-primary btn-sm text-nowrap">
                  <FontAwesomeIcon icon={faPlus} /> Create
                </button>
              </form>
            </td>
          </tr>
        </tbody>
      </table>

      {wasValidated && !validationResult.isValid && (
        <AlertPanel variant="danger">Please check values that does not conflict with others.</AlertPanel>
      )}
      <form id="groups" onSubmit={onSubmitSave}>
        <button type="submit" className="btn btn-success" disabled={!isChanged}>
          Save
        </button>
      </form>
    </div>
  );
};

export default DashboardConferenceTabGroups;
