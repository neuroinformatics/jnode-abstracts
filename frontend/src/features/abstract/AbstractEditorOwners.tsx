import { faPlus, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { useAppDispatch } from '../../app/hooks';
import type { AbstractEntity } from '../../entities/abstract';
import { showMessage } from '../common/commonSlice';
import { exists, unsetPageActionState as unsetUserPageActionState } from '../user/userSlice';
import { updateAbstractOwners } from './abstractSlice';

interface Props {
  abstract: AbstractEntity;
  currentUserMail: string;
  isManager: boolean;
}

const AbstractEditorOwners: React.FC<Props> = (props) => {
  const { abstract, currentUserMail, isManager } = props;
  const dispatch = useAppDispatch();
  const [email, setEmail] = React.useState<string>('');
  const owners = abstract.owners.map((o) => o.mail).sort((a, b) => a.localeCompare(b));

  const onSubmitAdd: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const mail = email.trim();
    if (owners.includes(mail)) {
      setEmail('');
      return;
    }
    dispatch(exists({ email: mail })).then((action) => {
      if (exists.fulfilled.match(action)) {
        dispatch(updateAbstractOwners({ uuid: abstract.uuid, owners: [...owners, mail] }));
        setEmail('');
      } else {
        dispatch(showMessage({ variant: 'danger', message: action.payload ?? '' }));
      }
      dispatch(unsetUserPageActionState());
    });
  };

  const onClickRemove = (mail: string) => {
    dispatch(updateAbstractOwners({ uuid: abstract.uuid, owners: owners.filter((o) => o !== mail) }));
  };

  return (
    <section className="mb-4">
      <h4>Co-editors</h4>
      <p className="small text-secondary">
        Users who can edit and submit this abstract. They need an account on this site.
      </p>
      <ul>
        {owners.map((owner) => (
          <li className="my-1" key={owner}>
            {owner}{' '}
            {owners.length > 1 && (owner !== currentUserMail || isManager) && (
              <button
                type="button"
                className="btn btn-sm btn-outline-danger"
                aria-label={`Remove ${owner}`}
                onClick={() => onClickRemove(owner)}
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            )}
          </li>
        ))}
      </ul>
      <form onSubmit={onSubmitAdd}>
        <div className="row g-2 align-items-center">
          <div className="col-auto">
            <input
              className="form-control form-control-sm"
              type="email"
              placeholder="Email of the co-editor"
              aria-label="Email of the co-editor"
              size={32}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="col-auto">
            <button type="submit" className="btn btn-sm btn-outline-primary">
              <FontAwesomeIcon icon={faPlus} /> Add
            </button>
          </div>
        </div>
      </form>
    </section>
  );
};

export default AbstractEditorOwners;
