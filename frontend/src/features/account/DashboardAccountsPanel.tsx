import dayjs from 'dayjs';
import React from 'react';
import { Badge, Button, Form, Modal } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import ForbiddenAccess from '../../common/ForbiddenAccess';
import GeneralPanel from '../../common/GeneralPanel';
import LoadingOverlay from '../../common/LoadingOverlay';
import { ApiAsyncStatus, isApiPreparing } from '../../entities/api';
import type { UserEntity } from '../../entities/user';
import { showMessage } from '../common/commonSlice';
import { selectUserInfo } from '../user/userSlice';
import {
  createAccount,
  getAccountList,
  selectAccountsInfo,
  selectGetListState,
  selectPageActionState,
  unsetPageActionState,
  updateAccount,
} from './accountSlice';

const CreateAccountForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const [email, setEmail] = React.useState<string>('');
  const [firstName, setFirstName] = React.useState<string>('');
  const [lastName, setLastName] = React.useState<string>('');

  const onSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    dispatch(createAccount({ email: email.trim(), firstName: firstName.trim(), lastName: lastName.trim() })).then(
      (action) => {
        if (createAccount.fulfilled.match(action)) {
          setEmail('');
          setFirstName('');
          setLastName('');
        }
      },
    );
  };

  return (
    <form className="mb-4" onSubmit={onSubmit}>
      <h5>Create account</h5>
      <p className="text-secondary">A generated password is sent to the new user by email.</p>
      <div className="row g-2 align-items-center">
        <div className="col-md-4">
          <input
            className="form-control"
            type="email"
            placeholder="Email"
            aria-label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="col-md-3">
          <input
            className="form-control"
            type="text"
            placeholder="First name"
            aria-label="First name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>
        <div className="col-md-3">
          <input
            className="form-control"
            type="text"
            placeholder="Last name"
            aria-label="Last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>
        <div className="col-md-2">
          <button type="submit" className="btn btn-success w-100">
            Create
          </button>
        </div>
      </div>
    </form>
  );
};

interface EditAccountModalProps {
  account: UserEntity | null;
  onHide: () => void;
}

const EditAccountModal: React.FC<EditAccountModalProps> = (props) => {
  const { account, onHide } = props;
  const dispatch = useAppDispatch();
  const [firstName, setFirstName] = React.useState<string>(account?.firstName ?? '');
  const [lastName, setLastName] = React.useState<string>(account?.lastName ?? '');
  const [isActive, setIsActive] = React.useState<boolean>(account?.isActive ?? true);

  const onSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    if (account != null) {
      dispatch(updateAccount({ uuid: account.uuid, firstName: firstName.trim(), lastName: lastName.trim(), isActive }));
      onHide();
    }
  };

  return (
    <Modal show={account != null} onHide={onHide}>
      <Form onSubmit={onSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>Edit account</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="fw-bold">{account?.mail}</p>
          <Form.Group className="mb-3" controlId="edit-account-first-name">
            <Form.Label>First name</Form.Label>
            <Form.Control type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
          </Form.Group>
          <Form.Group className="mb-3" controlId="edit-account-last-name">
            <Form.Label>Last name</Form.Label>
            <Form.Control type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
          </Form.Group>
          <Form.Check
            id="edit-account-active"
            type="switch"
            label="Active (inactive accounts cannot log in)"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Save
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

const DashboardAccountsPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const userInfo = useAppSelector(selectUserInfo);
  const accountsInfo = useAppSelector(selectAccountsInfo);
  const listState = useAppSelector(selectGetListState);
  const pageActionState = useAppSelector(selectPageActionState);
  const [keyword, setKeyword] = React.useState<string>('');
  const [editAccount, setEditAccount] = React.useState<UserEntity | null>(null);
  const isAdmin = userInfo?.isAdmin ?? false;

  React.useEffect(() => {
    if (isAdmin) {
      dispatch(getAccountList());
    }
  }, [dispatch, isAdmin]);

  React.useEffect(() => {
    if (pageActionState.type === 'create' || pageActionState.type === 'update') {
      if (pageActionState.status === ApiAsyncStatus.idle) {
        const message =
          pageActionState.type === 'create'
            ? 'Account successfully created. The password has been sent by email.'
            : 'Account successfully updated.';
        dispatch(showMessage({ variant: 'success', message }));
        dispatch(unsetPageActionState());
      } else if (pageActionState.status === ApiAsyncStatus.failed) {
        dispatch(showMessage({ variant: 'danger', message: pageActionState.error ?? '' }));
        dispatch(unsetPageActionState());
      }
    }
  }, [dispatch, pageActionState.error, pageActionState.status, pageActionState.type]);

  if (!isAdmin) {
    return <ForbiddenAccess />;
  }

  const upperKeyword = keyword.trim().toUpperCase();
  const accounts = accountsInfo.allIds
    .map((uuid) => accountsInfo.byId[uuid])
    .filter(
      (a) =>
        upperKeyword === '' ||
        a.mail.toUpperCase().includes(upperKeyword) ||
        `${a.firstName} ${a.lastName}`.toUpperCase().includes(upperKeyword),
    );

  return (
    <GeneralPanel title="Accounts">
      {(isApiPreparing(listState) || pageActionState.status === ApiAsyncStatus.loading) && (
        <LoadingOverlay message="Loading..." />
      )}
      <CreateAccountForm />
      <div className="d-flex flex-wrap align-items-center gap-3 mb-3">
        <input
          type="text"
          className="form-control w-auto"
          placeholder="Search name or email..."
          size={32}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <span>
          Showing {accounts.length} of {accountsInfo.allIds.length} accounts
        </span>
      </div>
      <div className="table-responsive">
        <table className="table table-sm align-middle">
          <thead>
            <tr>
              <th>Email</th>
              <th>Name</th>
              <th>Registration</th>
              <th>Status</th>
              <th>
                <span className="visually-hidden">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((account) => (
              <tr key={account.uuid}>
                <td>{account.mail}</td>
                <td>
                  {account.firstName} {account.lastName}
                </td>
                {/* timestamps are sent in UTC without an offset, as the server runs in UTC */}
                <td className="text-nowrap">{dayjs(`${account.ctime}Z`).format('YYYY-MM-DD')}</td>
                <td>
                  {account.isAdmin && (
                    <Badge bg="primary" className="me-1">
                      Admin
                    </Badge>
                  )}
                  {!account.isActive && <Badge bg="secondary">Inactive</Badge>}
                </td>
                <td className="text-end">
                  <Button size="sm" variant="outline-secondary" onClick={() => setEditAccount(account)}>
                    Edit
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <EditAccountModal key={editAccount?.uuid} account={editAccount} onHide={() => setEditAccount(null)} />
    </GeneralPanel>
  );
};

export default DashboardAccountsPanel;
