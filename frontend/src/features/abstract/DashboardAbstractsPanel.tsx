import classNames from 'classnames';
import React from 'react';
import { Badge, Button, Dropdown, Form, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import GeneralPanel from '../../common/GeneralPanel';
import LoadingOverlay from '../../common/LoadingOverlay';
import { type AbstractEntity, type StateLogState, StateLogStates } from '../../entities/abstract';
import { ApiAsyncStatus, isApiPreparing } from '../../entities/api';
import type { ConferenceEntity } from '../../entities/conference';
import { showMessage } from '../common/commonSlice';
import { getAbstractId } from '../conference/conferenceUtilities';
import {
  getManagedAbstracts,
  selectGetManagedAbstractsState,
  selectManagedAbstractsInfo,
  selectPageActionState,
  unsetManagedAbstracts,
  unsetPageActionState,
  updateAbstractPublication,
  updateAbstractState,
} from './abstractSlice';
import { formatStateName, getAbstractNumber, getManagerNextStates, STATE_VARIANTS } from './abstractUtilities';

const DEFAULT_VISIBLE_STATES: StateLogState[] = ['Submitted', 'InReview', 'Accepted', 'Rejected', 'InRevision'];
const NOTE_MAX_LENGTH = 255;

const formatFirstAuthor = (abstract: AbstractEntity): string => {
  if (abstract.authors.length === 0) {
    return '';
  }
  return abstract.authors[0].lastName + (abstract.authors.length > 1 ? ' et al.' : '');
};

interface StateModalProps {
  abstract: AbstractEntity | null;
  onHide: () => void;
}

const StateModal: React.FC<StateModalProps> = (props) => {
  const { abstract, onHide } = props;
  const dispatch = useAppDispatch();
  const nextStates = abstract != null ? getManagerNextStates(abstract.state) : [];
  const [state, setState] = React.useState<StateLogState | ''>(nextStates[0] ?? '');
  const [note, setNote] = React.useState<string>('');

  const onSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    if (abstract != null && state !== '') {
      dispatch(updateAbstractState({ uuid: abstract.uuid, state, note: note.trim() }));
      onHide();
    }
  };

  return (
    <Modal show={abstract != null} onHide={onHide}>
      <Form onSubmit={onSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>Change state</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="fw-bold">{abstract?.title}</p>
          <Form.Group className="mb-3" controlId="state-modal-state">
            <Form.Label>New state</Form.Label>
            <Form.Select value={state} onChange={(e) => setState(e.target.value as StateLogState)} required>
              {nextStates.map((s) => (
                <option key={s} value={s}>
                  {formatStateName(s)}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group controlId="state-modal-note">
            <Form.Label>Note to the authors</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              maxLength={NOTE_MAX_LENGTH}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <Form.Text muted>{NOTE_MAX_LENGTH - note.length} characters left</Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={state === ''}>
            Change state
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

interface PublicationModalProps {
  conference: ConferenceEntity;
  abstract: AbstractEntity | null;
  onHide: () => void;
}

const PublicationModal: React.FC<PublicationModalProps> = (props) => {
  const { conference, abstract, onHide } = props;
  const dispatch = useAppDispatch();
  const [abstractGroupUuid, setAbstractGroupUuid] = React.useState<string>(abstract?.abstractGroupUuid ?? '');
  const [num, setNum] = React.useState<number>(abstract != null ? getAbstractNumber(abstract.sortId) : 0);
  const [doi, setDoi] = React.useState<string>(abstract?.doi ?? '');

  const onSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    if (abstract != null) {
      dispatch(
        updateAbstractPublication({
          uuid: abstract.uuid,
          abstractGroupUuid: abstractGroupUuid !== '' ? abstractGroupUuid : null,
          num,
          doi: doi.trim(),
        }),
      );
      onHide();
    }
  };

  return (
    <Modal show={abstract != null} onHide={onHide}>
      <Form onSubmit={onSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>Edit ID and DOI</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="fw-bold">{abstract?.title}</p>
          <Form.Group className="mb-3" controlId="publication-modal-group">
            <Form.Label>Group</Form.Label>
            <Form.Select value={abstractGroupUuid} onChange={(e) => setAbstractGroupUuid(e.target.value)}>
              <option value="">(none)</option>
              {conference.abstractGroups.map((g) => (
                <option key={g.uuid} value={g.uuid ?? ''}>
                  {g.shortName} - {g.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3" controlId="publication-modal-number">
            <Form.Label>Number</Form.Label>
            <Form.Control
              type="number"
              min={0}
              max={0xffff}
              value={num}
              onChange={(e) => setNum(Number(e.target.value))}
              required
            />
          </Form.Group>
          <Form.Group controlId="publication-modal-doi">
            <Form.Label>DOI</Form.Label>
            <Form.Control
              type="text"
              placeholder="10.xxxx/xxxxx"
              value={doi}
              onChange={(e) => setDoi(e.target.value)}
            />
          </Form.Group>
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

interface Props {
  conference: ConferenceEntity;
}

const DashboardAbstractsPanel: React.FC<Props> = (props) => {
  const { conference } = props;

  const dispatch = useAppDispatch();
  const abstractsInfo = useAppSelector(selectManagedAbstractsInfo);
  const abstractsState = useAppSelector(selectGetManagedAbstractsState);
  const pageActionState = useAppSelector(selectPageActionState);
  const [visibleStates, setVisibleStates] = React.useState<StateLogState[]>(DEFAULT_VISIBLE_STATES);
  const [keyword, setKeyword] = React.useState<string>('');
  const [stateAbstract, setStateAbstract] = React.useState<AbstractEntity | null>(null);
  const [publicationAbstract, setPublicationAbstract] = React.useState<AbstractEntity | null>(null);

  React.useEffect(() => {
    dispatch(getManagedAbstracts(conference.uuid));
    return () => {
      dispatch(unsetManagedAbstracts());
    };
  }, [dispatch, conference.uuid]);

  React.useEffect(() => {
    if (pageActionState.type === 'state' || pageActionState.type === 'publication') {
      if (pageActionState.status === ApiAsyncStatus.idle) {
        const message = pageActionState.type === 'state' ? 'State successfully changed.' : 'ID successfully updated.';
        dispatch(showMessage({ variant: 'success', message }));
        dispatch(unsetPageActionState());
      } else if (pageActionState.status === ApiAsyncStatus.failed) {
        dispatch(showMessage({ variant: 'danger', message: pageActionState.error ?? '' }));
        dispatch(unsetPageActionState());
      }
    }
  }, [dispatch, pageActionState.error, pageActionState.status, pageActionState.type]);

  const abstracts = abstractsInfo.allIds.map((uuid) => abstractsInfo.byId[uuid]);
  const countByState = (state: StateLogState): number => abstracts.filter((a) => a.state === state).length;
  const upperKeyword = keyword.trim().toUpperCase();
  const visibleAbstracts = abstracts
    .filter((a) => visibleStates.includes(a.state))
    .filter(
      (a) =>
        upperKeyword === '' ||
        a.title.toUpperCase().includes(upperKeyword) ||
        a.authors.some((author) => `${author.firstName} ${author.lastName}`.toUpperCase().includes(upperKeyword)) ||
        a.owners.some((owner) => owner.mail.toUpperCase().includes(upperKeyword)),
    );

  const onToggleState = (state: StateLogState) => {
    setVisibleStates((prev) => (prev.includes(state) ? prev.filter((s) => s !== state) : [...prev, state]));
  };

  const formatId = (abstract: AbstractEntity): string => {
    const id = getAbstractId(conference, abstract);
    if (id != null) {
      return id;
    }
    const num = getAbstractNumber(abstract.sortId);
    return num > 0 ? String(num) : '';
  };

  return (
    <div className="dashboard-abstracts">
      {(isApiPreparing(abstractsState) || pageActionState.status === ApiAsyncStatus.loading) && (
        <LoadingOverlay message="Loading..." />
      )}
      <GeneralPanel title={`${conference.name} - Abstracts`}>
        <fieldset className="d-flex flex-wrap gap-1 mb-3">
          <legend className="visually-hidden">Filter by state</legend>
          {StateLogStates.map((state) => (
            <button
              key={state}
              type="button"
              className={classNames(
                'btn',
                'btn-sm',
                visibleStates.includes(state) ? 'btn-primary' : 'btn-outline-primary',
              )}
              aria-pressed={visibleStates.includes(state)}
              onClick={() => onToggleState(state)}
            >
              {formatStateName(state)}{' '}
              <Badge bg="light" text="dark">
                {countByState(state)}
              </Badge>
            </button>
          ))}
        </fieldset>
        <div className="d-flex flex-wrap align-items-center gap-3 mb-3">
          <input
            type="text"
            className="form-control w-auto"
            placeholder="Search title, author or owner..."
            size={32}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <span>
            Showing {visibleAbstracts.length} of {abstracts.length} abstracts
          </span>
        </div>
        <div className="table-responsive">
          <table className="table table-sm align-middle">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Authors</th>
                <th>Owners</th>
                <th>State</th>
                <th>
                  <span className="visually-hidden">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {visibleAbstracts.map((abstract) => {
                const nextStates = getManagerNextStates(abstract.state);
                return (
                  <tr key={abstract.uuid}>
                    <td className="text-nowrap">{formatId(abstract)}</td>
                    <td>
                      <Link to={`/abstracts/${abstract.uuid}`}>{abstract.title || '(untitled)'}</Link>
                    </td>
                    <td>{formatFirstAuthor(abstract)}</td>
                    <td className="small">
                      {abstract.owners.map((owner) => (
                        <div key={owner.uuid}>
                          <a href={`mailto:${owner.mail}`}>{owner.mail}</a>
                        </div>
                      ))}
                    </td>
                    <td>
                      <Badge bg={STATE_VARIANTS[abstract.state]}>{formatStateName(abstract.state)}</Badge>
                    </td>
                    <td className="text-nowrap text-end">
                      <Dropdown className="d-inline-block me-1">
                        <Dropdown.Toggle size="sm" variant="outline-secondary" disabled={nextStates.length === 0}>
                          State
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                          {nextStates.map((state) => (
                            <Dropdown.Item
                              key={state}
                              as="button"
                              onClick={() => dispatch(updateAbstractState({ uuid: abstract.uuid, state, note: '' }))}
                            >
                              {formatStateName(state)}
                            </Dropdown.Item>
                          ))}
                          <Dropdown.Divider />
                          <Dropdown.Item as="button" onClick={() => setStateAbstract(abstract)}>
                            With note...
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                      <Button size="sm" variant="outline-secondary" onClick={() => setPublicationAbstract(abstract)}>
                        ID/DOI
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GeneralPanel>
      <StateModal key={`state-${stateAbstract?.uuid}`} abstract={stateAbstract} onHide={() => setStateAbstract(null)} />
      <PublicationModal
        key={`publication-${publicationAbstract?.uuid}`}
        conference={conference}
        abstract={publicationAbstract}
        onHide={() => setPublicationAbstract(null)}
      />
    </div>
  );
};

export default DashboardAbstractsPanel;
