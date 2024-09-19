import React from 'react';

import { faPlus, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import _ from 'lodash';
import { UserSimpleEntity } from '../../entities/user';
import { DashboardConferenceTabProps } from './DashboardConferenceTab';

const DashboardConferenceTabOwner: React.FC<DashboardConferenceTabProps> = (props) => {
  const { conference } = props;

  const [owners, setOwners] = React.useState<UserSimpleEntity[]>(
    conference.owners != null ? _.cloneDeep(conference.owners) : [],
  );
  const [isChanged, setIsChanged] = React.useState<boolean>(false);
  const [email, setEmail] = React.useState<string>('');

  const onChangeEmail: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setEmail(e.target.value.trim());
    setIsChanged(true);
  };

  const onClickRemove = (idx: number): void => {
    setIsChanged(true);
    setOwners((prev) => prev.filter((_, pIdx) => pIdx !== idx));
  };

  const onSubmitAdd: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    setIsChanged(true);
    setOwners((prev) => [...prev, { uuid: null, mail: email }]);
    setEmail('');
  };

  const onSubmitOwner = React.useCallback<React.FormEventHandler<HTMLFormElement>>((e) => {
    e.preventDefault();
    // save
    setEmail('');
    setIsChanged(false);
  }, []);

  return (
    <div>
      <p>Here is the list of current owners:</p>
      <ul>
        {owners.map((owner, idx) => (
          <li className="my-1" key={idx}>
            <strong>{owner.mail}</strong>{' '}
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
