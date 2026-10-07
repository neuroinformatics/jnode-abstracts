import { faArrowDown, faArrowUp, faPlus, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type React from 'react';
import {
  type EditableAbstract,
  type EditableAffiliation,
  type EditableAuthor,
  newEditableAffiliation,
  newEditableAuthor,
} from './abstractUtilities';

const moveItem = <T,>(items: T[], idx: number, offset: number): T[] => {
  const to = idx + offset;
  if (to < 0 || to >= items.length) {
    return items;
  }
  const moved = [...items];
  [moved[idx], moved[to]] = [moved[to], moved[idx]];
  return moved;
};

interface ItemButtonsProps {
  label: string;
  idx: number;
  count: number;
  onMove: (offset: number) => void;
  onRemove: () => void;
}

const ItemButtons: React.FC<ItemButtonsProps> = (props) => {
  const { label, idx, count, onMove, onRemove } = props;
  return (
    <div className="btn-group btn-group-sm">
      <button
        type="button"
        className="btn btn-outline-secondary"
        aria-label={`Move ${label} up`}
        disabled={idx === 0}
        onClick={() => onMove(-1)}
      >
        <FontAwesomeIcon icon={faArrowUp} />
      </button>
      <button
        type="button"
        className="btn btn-outline-secondary"
        aria-label={`Move ${label} down`}
        disabled={idx === count - 1}
        onClick={() => onMove(1)}
      >
        <FontAwesomeIcon icon={faArrowDown} />
      </button>
      <button type="button" className="btn btn-outline-danger" aria-label={`Remove ${label}`} onClick={onRemove}>
        <FontAwesomeIcon icon={faXmark} />
      </button>
    </div>
  );
};

interface Props {
  abstract: EditableAbstract;
  onChange: (changes: Partial<EditableAbstract>) => void;
}

const AbstractEditorAuthors: React.FC<Props> = (props) => {
  const { abstract, onChange } = props;
  const { authors, affiliations } = abstract;

  const onChangeAuthor = (idx: number, changes: Partial<EditableAuthor>) => {
    onChange({ authors: authors.map((a, aIdx) => (aIdx === idx ? { ...a, ...changes } : a)) });
  };

  const onToggleAffiliation = (idx: number, affiliationIdx: number) => {
    const current = authors[idx].affiliations;
    const next = current.includes(affiliationIdx)
      ? current.filter((i) => i !== affiliationIdx)
      : [...current, affiliationIdx].sort((a, b) => a - b);
    onChangeAuthor(idx, { affiliations: next });
  };

  const onChangeAffiliation = (idx: number, changes: Partial<EditableAffiliation>) => {
    onChange({ affiliations: affiliations.map((a, aIdx) => (aIdx === idx ? { ...a, ...changes } : a)) });
  };

  // authors refer to affiliations by index, so remap them when affiliations move or disappear
  const remapAuthorAffiliations = (mapIndex: (idx: number) => number | null): EditableAuthor[] =>
    authors.map((author) => ({
      ...author,
      affiliations: author.affiliations
        .map(mapIndex)
        .filter((i): i is number => i != null)
        .sort((a, b) => a - b),
    }));

  const onMoveAffiliation = (idx: number, offset: number) => {
    const to = idx + offset;
    if (to < 0 || to >= affiliations.length) {
      return;
    }
    onChange({
      affiliations: moveItem(affiliations, idx, offset),
      authors: remapAuthorAffiliations((i) => (i === idx ? to : i === to ? idx : i)),
    });
  };

  const onRemoveAffiliation = (idx: number) => {
    onChange({
      affiliations: affiliations.filter((_, aIdx) => aIdx !== idx),
      authors: remapAuthorAffiliations((i) => (i === idx ? null : i > idx ? i - 1 : i)),
    });
  };

  return (
    <>
      <section className="mb-4">
        <h4>Authors</h4>
        {authors.map((author, idx) => (
          <div key={author.key} className="card mb-2">
            <div className="card-body py-2">
              <div className="row g-2 align-items-center mb-2">
                <div className="col-md">
                  <input
                    className="form-control form-control-sm"
                    type="text"
                    placeholder="First name"
                    aria-label={`First name of author ${idx + 1}`}
                    maxLength={255}
                    value={author.firstName}
                    onChange={(e) => onChangeAuthor(idx, { firstName: e.target.value })}
                  />
                </div>
                <div className="col-md-2">
                  <input
                    className="form-control form-control-sm"
                    type="text"
                    placeholder="Middle name"
                    aria-label={`Middle name of author ${idx + 1}`}
                    maxLength={255}
                    value={author.middleName}
                    onChange={(e) => onChangeAuthor(idx, { middleName: e.target.value })}
                  />
                </div>
                <div className="col-md">
                  <input
                    className="form-control form-control-sm"
                    type="text"
                    placeholder="Last name"
                    aria-label={`Last name of author ${idx + 1}`}
                    maxLength={255}
                    value={author.lastName}
                    onChange={(e) => onChangeAuthor(idx, { lastName: e.target.value })}
                  />
                </div>
                <div className="col-md">
                  <input
                    className="form-control form-control-sm"
                    type="email"
                    placeholder="Email (optional)"
                    aria-label={`Email of author ${idx + 1}`}
                    maxLength={255}
                    value={author.mail}
                    onChange={(e) => onChangeAuthor(idx, { mail: e.target.value })}
                  />
                </div>
                <div className="col-md-auto text-end">
                  <ItemButtons
                    label={`author ${idx + 1}`}
                    idx={idx}
                    count={authors.length}
                    onMove={(offset) => onChange({ authors: moveItem(authors, idx, offset) })}
                    onRemove={() => onChange({ authors: authors.filter((_, aIdx) => aIdx !== idx) })}
                  />
                </div>
              </div>
              <div className="small">
                <span className="me-2">Affiliations:</span>
                {affiliations.length === 0 && <span className="text-secondary">add affiliations below</span>}
                {affiliations.map((affiliation, affiliationIdx) => (
                  <div key={affiliation.key} className="form-check form-check-inline">
                    <input
                      id={`author-${author.key}-affiliation-${affiliation.key}`}
                      className="form-check-input"
                      type="checkbox"
                      checked={author.affiliations.includes(affiliationIdx)}
                      onChange={() => onToggleAffiliation(idx, affiliationIdx)}
                    />
                    <label className="form-check-label" htmlFor={`author-${author.key}-affiliation-${affiliation.key}`}>
                      {affiliationIdx + 1}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
        <button
          type="button"
          className="btn btn-sm btn-outline-primary"
          onClick={() => onChange({ authors: [...authors, newEditableAuthor()] })}
        >
          <FontAwesomeIcon icon={faPlus} /> Add author
        </button>
      </section>
      <section className="mb-4">
        <h4>Affiliations</h4>
        <p className="small text-secondary">
          Affiliations are numbered in the order the authors refer to them when the abstract is saved.
        </p>
        {affiliations.map((affiliation, idx) => (
          <div key={affiliation.key} className="row g-2 align-items-center mb-2">
            <div className="col-auto fw-bold">{idx + 1}.</div>
            <div className="col-md-3">
              <input
                className="form-control form-control-sm"
                type="text"
                placeholder="Department"
                aria-label={`Department of affiliation ${idx + 1}`}
                maxLength={255}
                value={affiliation.department}
                onChange={(e) => onChangeAffiliation(idx, { department: e.target.value })}
              />
            </div>
            <div className="col-md-3">
              <input
                className="form-control form-control-sm"
                type="text"
                placeholder="Institution"
                aria-label={`Institution of affiliation ${idx + 1}`}
                maxLength={255}
                value={affiliation.section}
                onChange={(e) => onChangeAffiliation(idx, { section: e.target.value })}
              />
            </div>
            <div className="col-md-2">
              <input
                className="form-control form-control-sm"
                type="text"
                placeholder="Address"
                aria-label={`Address of affiliation ${idx + 1}`}
                maxLength={255}
                value={affiliation.address}
                onChange={(e) => onChangeAffiliation(idx, { address: e.target.value })}
              />
            </div>
            <div className="col-md-2">
              <input
                className="form-control form-control-sm"
                type="text"
                placeholder="Country"
                aria-label={`Country of affiliation ${idx + 1}`}
                maxLength={255}
                value={affiliation.country}
                onChange={(e) => onChangeAffiliation(idx, { country: e.target.value })}
              />
            </div>
            <div className="col-md-auto ms-auto text-end">
              <ItemButtons
                label={`affiliation ${idx + 1}`}
                idx={idx}
                count={affiliations.length}
                onMove={(offset) => onMoveAffiliation(idx, offset)}
                onRemove={() => onRemoveAffiliation(idx)}
              />
            </div>
          </div>
        ))}
        <button
          type="button"
          className="btn btn-sm btn-outline-primary"
          onClick={() => onChange({ affiliations: [...affiliations, newEditableAffiliation()] })}
        >
          <FontAwesomeIcon icon={faPlus} /> Add affiliation
        </button>
      </section>
    </>
  );
};

export default AbstractEditorAuthors;
