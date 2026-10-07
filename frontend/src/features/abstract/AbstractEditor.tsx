import { faPlus, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Badge, Button, Modal } from 'react-bootstrap';
import { Link, useBlocker, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import LoadingOverlay from '../../common/LoadingOverlay';
import type { AbstractEntity, StateLogState } from '../../entities/abstract';
import { ApiAsyncStatus } from '../../entities/api';
import type { ConferenceEntity } from '../../entities/conference';
import { showMessage } from '../common/commonSlice';
import AbstractPanel from '../conference/AbstractPanel';
import { selectUserInfo } from '../user/userSlice';
import AbstractEditorAuthors from './AbstractEditorAuthors';
import AbstractEditorFigures from './AbstractEditorFigures';
import AbstractEditorOwners from './AbstractEditorOwners';
import AbstractStateLogPanel from './AbstractStateLogPanel';
import {
  createAbstract,
  deleteAbstract,
  selectPageActionState,
  unsetPageActionState,
  updateAbstract,
  updateAbstractState,
} from './abstractSlice';
import {
  type EditableAbstract,
  type EditableReference,
  formatStateName,
  getOwnerNextStates,
  getSubmissionProblems,
  isEditableByOwner,
  newEditableReference,
  STATE_VARIANTS,
  toAbstractEditParams,
  toEditableAbstract,
  toPreviewAbstract,
} from './abstractUtilities';

const ACKNOWLEDGEMENTS_MAX_LENGTH = 500;

const SUCCESS_MESSAGES: Record<string, string> = {
  create: 'Abstract successfully saved.',
  update: 'Abstract successfully saved.',
  state: 'State successfully changed.',
  owners: 'Co-editors successfully updated.',
  figure: 'Figures successfully updated.',
};

const STATE_ACTION_LABELS: Partial<Record<StateLogState, string>> = {
  Submitted: 'Submit',
  InPreparation: 'Unlock for editing',
  Withdrawn: 'Withdraw',
};

interface Props {
  conference: ConferenceEntity;
  abstract: AbstractEntity | null;
}

const AbstractEditor: React.FC<Props> = (props) => {
  const { conference, abstract } = props;

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const userInfo = useAppSelector(selectUserInfo);
  const pageActionState = useAppSelector(selectPageActionState);
  const [editable, setEditable] = React.useState<EditableAbstract>(() => toEditableAbstract(abstract));
  const [isChanged, setIsChangedState] = React.useState<boolean>(false);
  // read by the navigation blocker, which may run before a state update is rendered
  const isChangedRef = React.useRef<boolean>(false);
  const setIsChanged = (value: boolean) => {
    isChangedRef.current = value;
    setIsChangedState(value);
  };
  const [isPreview, setIsPreview] = React.useState<boolean>(false);
  const [confirmState, setConfirmState] = React.useState<StateLogState | null>(null);
  const [isConfirmDelete, setIsConfirmDelete] = React.useState<boolean>(false);

  const isManager = (userInfo?.isAdmin ?? false) || conference.isOwner;
  const isOwner = abstract == null || abstract.owners.some((o) => o.uuid === userInfo?.uuid);
  const canEdit =
    abstract == null
      ? conference.isOpen || isManager
      : isManager || (isOwner && isEditableByOwner(abstract.state, conference.isOpen));
  const nextStates = abstract != null && isOwner ? getOwnerNextStates(abstract.state, conference.isOpen) : [];
  const canDelete = abstract != null && (isManager || (isOwner && abstract.state === 'InPreparation'));
  const problems = getSubmissionProblems(editable, conference);
  const preview = toPreviewAbstract(editable, abstract, conference.uuid);
  const textMaxLength = conference.abstractMaxLength > 0 ? conference.abstractMaxLength : undefined;

  // warn before leaving the page with unsaved changes
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) => isChangedRef.current && currentLocation.pathname !== nextLocation.pathname,
  );
  React.useEffect(() => {
    if (!isChanged) {
      return;
    }
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [isChanged]);

  React.useEffect(() => {
    const type = pageActionState.type;
    if (type == null || !(type in SUCCESS_MESSAGES || type === 'delete')) {
      return;
    }
    if (pageActionState.status === ApiAsyncStatus.idle) {
      if (type !== 'delete') {
        dispatch(showMessage({ variant: 'success', message: SUCCESS_MESSAGES[type] }));
      }
      dispatch(unsetPageActionState());
    } else if (pageActionState.status === ApiAsyncStatus.failed) {
      dispatch(showMessage({ variant: 'danger', message: pageActionState.error ?? '' }));
      dispatch(unsetPageActionState());
    }
  }, [dispatch, pageActionState.error, pageActionState.status, pageActionState.type]);

  const onChange = (changes: Partial<EditableAbstract>) => {
    setEditable((prev) => ({ ...prev, ...changes }));
    setIsChanged(true);
  };

  const onChangeReference = (idx: number, changes: Partial<EditableReference>) => {
    onChange({ references: editable.references.map((r, rIdx) => (rIdx === idx ? { ...r, ...changes } : r)) });
  };

  /**
   * Saves the content, resolving to the saved abstract or null if saving failed.
   */
  const save = async (): Promise<AbstractEntity | null> => {
    const content = toAbstractEditParams(editable);
    const action =
      abstract == null
        ? await dispatch(createAbstract({ conferenceUuid: conference.uuid, content }))
        : await dispatch(updateAbstract({ uuid: abstract.uuid, content }));
    if (createAbstract.fulfilled.match(action) || updateAbstract.fulfilled.match(action)) {
      // reload the content as saved, as the server renumbers the affiliations
      setEditable(toEditableAbstract(action.payload));
      setIsChanged(false);
      return action.payload;
    }
    return null;
  };

  const onSave = () => {
    save().then((saved) => {
      if (saved != null && abstract == null) {
        navigate(`/myabstracts/${saved.uuid}/edit`, { replace: true });
      }
    });
  };

  const onSubmitSave: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    onSave();
  };

  const onConfirmState = async () => {
    const state = confirmState;
    setConfirmState(null);
    if (abstract == null || state == null) {
      return;
    }
    if (isChanged && (await save()) == null) {
      return;
    }
    dispatch(updateAbstractState({ uuid: abstract.uuid, state, note: '' }));
  };

  const onConfirmDelete = () => {
    setIsConfirmDelete(false);
    if (abstract != null) {
      dispatch(deleteAbstract(abstract.uuid)).then((action) => {
        if (deleteAbstract.fulfilled.match(action)) {
          setIsChanged(false);
          dispatch(showMessage({ variant: 'success', message: 'Abstract successfully deleted.' }));
          navigate('/myabstracts');
        }
      });
    }
  };

  return (
    <div className="abstract-editor">
      {pageActionState.status === ApiAsyncStatus.loading && <LoadingOverlay message="Saving..." />}
      <div className="d-flex flex-wrap align-items-center gap-2 mb-3 p-2 border rounded bg-light sticky-top">
        <span className="me-2">
          {abstract != null ? (
            <Badge bg={STATE_VARIANTS[abstract.state]}>{formatStateName(abstract.state)}</Badge>
          ) : (
            <Badge bg="secondary">New</Badge>
          )}
        </span>
        {canEdit && (
          <button type="button" className="btn btn-sm btn-success" disabled={!isChanged} onClick={onSave}>
            Save
          </button>
        )}
        {canEdit && (
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={() => setIsPreview((prev) => !prev)}
          >
            {isPreview ? 'Edit' : 'Preview'}
          </button>
        )}
        {nextStates.map((state) => (
          <button
            key={state}
            type="button"
            className={`btn btn-sm ${state === 'Withdrawn' ? 'btn-outline-danger' : 'btn-primary'}`}
            onClick={() => setConfirmState(state)}
          >
            {STATE_ACTION_LABELS[state] ?? formatStateName(state)}
          </button>
        ))}
        {abstract != null && (
          <Link to={`/abstracts/${abstract.uuid}`} className="btn btn-sm btn-outline-secondary">
            View
          </Link>
        )}
        {canDelete && (
          <button
            type="button"
            className="btn btn-sm btn-outline-danger ms-auto"
            onClick={() => setIsConfirmDelete(true)}
          >
            Delete
          </button>
        )}
      </div>
      {abstract != null && !canEdit && (
        <p className="alert alert-info">
          {abstract.state === 'Submitted' && conference.isOpen
            ? 'The abstract has been submitted. Unlock it to make changes before the submission closes.'
            : 'The abstract cannot be edited in its current state.'}
        </p>
      )}
      {abstract != null && <AbstractStateLogPanel abstract={abstract} />}
      {!canEdit || isPreview ? (
        <AbstractPanel conference={conference} abstract={preview} />
      ) : (
        <form id="abstract-editor-form" onSubmit={onSubmitSave}>
          {problems.length > 0 && (
            <div className="alert alert-warning small">
              To be fixed before submission:
              <ul className="mb-0">
                {problems.map((problem) => (
                  <li key={problem}>{problem}</li>
                ))}
              </ul>
            </div>
          )}
          <section className="mb-4">
            <label htmlFor="abstract-title" className="form-label h4">
              Title
            </label>
            <input
              id="abstract-title"
              className="form-control"
              type="text"
              maxLength={255}
              value={editable.title}
              onChange={(e) => onChange({ title: e.target.value })}
              required
            />
          </section>
          <AbstractEditorAuthors abstract={editable} onChange={onChange} />
          <section className="mb-4">
            <label htmlFor="abstract-text" className="form-label h4">
              Abstract
            </label>
            <textarea
              id="abstract-text"
              className="form-control"
              rows={12}
              maxLength={textMaxLength}
              value={editable.text}
              onChange={(e) => onChange({ text: e.target.value })}
            />
            <div className="form-text">
              {textMaxLength != null && <>{textMaxLength - editable.text.length} characters left. </>}
              Math can be written in LaTeX between $...$ (inline) or $$...$$ (display).
            </div>
          </section>
          {conference.topics.length > 0 && (
            <section className="mb-4">
              <label htmlFor="abstract-topic" className="form-label h4">
                Topic
              </label>
              <select
                id="abstract-topic"
                className="form-select"
                value={editable.topic}
                onChange={(e) => onChange({ topic: e.target.value })}
              >
                <option value="">(select a topic)</option>
                {conference.topics.map((topic) => (
                  <option key={topic.uuid} value={topic.topic}>
                    {topic.topic}
                  </option>
                ))}
              </select>
            </section>
          )}
          {conference.hasPresentationPrefs && conference.abstractGroups.length > 0 && (
            <section className="mb-4">
              <fieldset>
                <legend className="h4">Presentation type</legend>
                {conference.abstractGroups.map((group) => (
                  <div key={group.uuid} className="form-check">
                    <input
                      id={`abstract-group-${group.uuid}`}
                      className="form-check-input"
                      type="radio"
                      name="abstract-group"
                      checked={editable.abstractGroupUuid === group.uuid}
                      onChange={() => onChange({ abstractGroupUuid: group.uuid ?? '' })}
                    />
                    <label className="form-check-label" htmlFor={`abstract-group-${group.uuid}`}>
                      {group.name}
                    </label>
                  </div>
                ))}
              </fieldset>
              <input
                className="form-control mt-2"
                type="text"
                placeholder="Comment on the presentation type, e.g. why it should be an oral presentation (optional)"
                aria-label="Comment on the presentation type"
                maxLength={255}
                value={editable.reasonForTalk}
                onChange={(e) => onChange({ reasonForTalk: e.target.value })}
              />
            </section>
          )}
          <section className="mb-4">
            <label htmlFor="abstract-acknowledgements" className="form-label h4">
              Acknowledgements
            </label>
            <textarea
              id="abstract-acknowledgements"
              className="form-control"
              rows={3}
              maxLength={ACKNOWLEDGEMENTS_MAX_LENGTH}
              value={editable.acknowledgements}
              onChange={(e) => onChange({ acknowledgements: e.target.value })}
            />
            <div className="form-text">
              {ACKNOWLEDGEMENTS_MAX_LENGTH - editable.acknowledgements.length} characters left.
            </div>
          </section>
          <section className="mb-4">
            <h4>References</h4>
            {editable.references.map((reference, idx) => (
              <div key={reference.key} className="row g-2 align-items-center mb-2">
                <div className="col-auto fw-bold">{idx + 1}.</div>
                <div className="col-md-5">
                  <input
                    className="form-control form-control-sm"
                    type="text"
                    placeholder="Citation"
                    aria-label={`Citation of reference ${idx + 1}`}
                    maxLength={300}
                    value={reference.text}
                    onChange={(e) => onChangeReference(idx, { text: e.target.value })}
                  />
                </div>
                <div className="col-md-3">
                  <input
                    className="form-control form-control-sm"
                    type="url"
                    placeholder="Link"
                    aria-label={`Link of reference ${idx + 1}`}
                    maxLength={255}
                    value={reference.link}
                    onChange={(e) => onChangeReference(idx, { link: e.target.value })}
                  />
                </div>
                <div className="col-md-2">
                  <input
                    className="form-control form-control-sm"
                    type="text"
                    placeholder="DOI"
                    aria-label={`DOI of reference ${idx + 1}`}
                    maxLength={255}
                    value={reference.doi}
                    onChange={(e) => onChangeReference(idx, { doi: e.target.value })}
                  />
                </div>
                <div className="col text-end">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    aria-label={`Remove reference ${idx + 1}`}
                    onClick={() => onChange({ references: editable.references.filter((_, rIdx) => rIdx !== idx) })}
                  >
                    <FontAwesomeIcon icon={faXmark} />
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              className="btn btn-sm btn-outline-primary"
              onClick={() => onChange({ references: [...editable.references, newEditableReference()] })}
            >
              <FontAwesomeIcon icon={faPlus} /> Add reference
            </button>
          </section>
          <button type="submit" className="btn btn-success mb-4" disabled={!isChanged}>
            Save
          </button>
        </form>
      )}
      {abstract == null && canEdit && (
        <p className="text-secondary">Figures and co-editors can be added after saving the abstract.</p>
      )}
      {abstract != null && canEdit && !isPreview && (
        <AbstractEditorFigures conference={conference} abstract={abstract} />
      )}
      {abstract != null && userInfo != null && (isOwner || isManager) && (
        <AbstractEditorOwners abstract={abstract} currentUserMail={userInfo.mail} isManager={isManager} />
      )}
      <Modal show={confirmState != null} onHide={() => setConfirmState(null)}>
        <Modal.Header closeButton>
          <Modal.Title>{confirmState != null && (STATE_ACTION_LABELS[confirmState] ?? confirmState)}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {confirmState === 'Submitted' && (
            <>
              <p>
                Submit the abstract for review?
                {conference.isOpen && ' You can unlock it again for changes until the submission closes.'}
                {isChanged && ' Unsaved changes are saved first.'}
              </p>
              {problems.length > 0 && (
                <div className="alert alert-warning small">
                  <ul className="mb-0">
                    {problems.map((problem) => (
                      <li key={problem}>{problem}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
          {confirmState === 'InPreparation' && <p>Unlock the abstract for editing? It has to be submitted again.</p>}
          {confirmState === 'Withdrawn' && <p className="text-danger">Withdraw the abstract? This cannot be undone.</p>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setConfirmState(null)}>
            Cancel
          </Button>
          <Button variant={confirmState === 'Withdrawn' ? 'danger' : 'primary'} onClick={onConfirmState}>
            {confirmState != null && (STATE_ACTION_LABELS[confirmState] ?? confirmState)}
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal show={isConfirmDelete} onHide={() => setIsConfirmDelete(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete abstract</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-danger">Delete the abstract and its figures? This cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setIsConfirmDelete(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirmDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal show={blocker.state === 'blocked'} onHide={() => blocker.reset?.()}>
        <Modal.Header closeButton>
          <Modal.Title>Unsaved changes</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>The abstract has unsaved changes. Leave the page and discard them?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => blocker.reset?.()}>
            Stay
          </Button>
          <Button variant="danger" onClick={() => blocker.proceed?.()}>
            Leave
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AbstractEditor;
