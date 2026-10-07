import type { AbstractEditParams } from '../../api/abstractApi';
import type { AbstractEntity, AbstractSimpleEntity, StateLogState } from '../../entities/abstract';
import type { ConferenceEntity } from '../../entities/conference';

type StateTransitions = Partial<Record<StateLogState, StateLogState[]>>;

// keep in sync with AbstractState.java
const OWNER_OPEN_TRANSITIONS: StateTransitions = {
  InPreparation: ['Submitted'],
  Submitted: ['InPreparation', 'Withdrawn'],
  InRevision: ['Submitted'],
};
const OWNER_CLOSED_TRANSITIONS: StateTransitions = {
  InRevision: ['Submitted'],
};
const MANAGER_TRANSITIONS: StateTransitions = {
  Submitted: ['InReview'],
  InReview: ['Accepted', 'Rejected', 'InRevision', 'Withdrawn'],
  InRevision: ['InReview'],
  Accepted: ['InRevision', 'Withdrawn'],
  Rejected: ['InRevision', 'Withdrawn'],
};

export const getOwnerNextStates = (state: StateLogState, isConferenceOpen: boolean): StateLogState[] => {
  const transitions = isConferenceOpen ? OWNER_OPEN_TRANSITIONS : OWNER_CLOSED_TRANSITIONS;
  return transitions[state] ?? [];
};

export const getManagerNextStates = (state: StateLogState): StateLogState[] => {
  return MANAGER_TRANSITIONS[state] ?? [];
};

export const formatStateName = (state: StateLogState): string => {
  return state.replace(/^In(?=[A-Z])/, 'In ');
};

export const STATE_VARIANTS: Record<StateLogState, string> = {
  InPreparation: 'secondary',
  Submitted: 'primary',
  InReview: 'info',
  Accepted: 'success',
  Rejected: 'danger',
  InRevision: 'warning',
  Withdrawn: 'dark',
};

// sort ids hold the group prefix in the upper 16 bits and the number in the lower 16 bits
export const getAbstractNumber = (sortId: number): number => {
  return sortId & 0xffff;
};

export interface EditableAuthor {
  key: string;
  firstName: string;
  middleName: string;
  lastName: string;
  mail: string;
  // indices into the affiliation list
  affiliations: number[];
}

export interface EditableAffiliation {
  key: string;
  department: string;
  section: string;
  address: string;
  country: string;
}

export interface EditableReference {
  key: string;
  text: string;
  doi: string;
  link: string;
}

export interface EditableAbstract {
  title: string;
  text: string;
  topic: string;
  acknowledgements: string;
  conflictOfInterest: string;
  isTalk: boolean;
  reasonForTalk: string;
  abstractGroupUuid: string;
  authors: EditableAuthor[];
  affiliations: EditableAffiliation[];
  references: EditableReference[];
}

let editableKeySeq = 0;
// keys identifying list items while editing, as items have no uuid until saved
export const newEditableKey = (): string => `new-${editableKeySeq++}`;

export const newEditableAuthor = (): EditableAuthor => ({
  key: newEditableKey(),
  firstName: '',
  middleName: '',
  lastName: '',
  mail: '',
  affiliations: [],
});

export const newEditableAffiliation = (): EditableAffiliation => ({
  key: newEditableKey(),
  department: '',
  section: '',
  address: '',
  country: '',
});

export const newEditableReference = (): EditableReference => ({ key: newEditableKey(), text: '', doi: '', link: '' });

export const toEditableAbstract = (abstract: AbstractEntity | null): EditableAbstract => {
  if (abstract == null) {
    return {
      title: '',
      text: '',
      topic: '',
      acknowledgements: '',
      conflictOfInterest: '',
      isTalk: false,
      reasonForTalk: '',
      abstractGroupUuid: '',
      authors: [newEditableAuthor()],
      affiliations: [newEditableAffiliation()],
      references: [],
    };
  }
  const affiliations = [...abstract.affiliations].sort((a, b) => a.position - b.position);
  return {
    title: abstract.title ?? '',
    text: abstract.text ?? '',
    topic: abstract.topic ?? '',
    acknowledgements: abstract.acknowledgements ?? '',
    conflictOfInterest: abstract.conflictOfInterest ?? '',
    isTalk: abstract.isTalk,
    reasonForTalk: abstract.reasonForTalk ?? '',
    abstractGroupUuid: abstract.abstractGroupUuid ?? '',
    authors: [...abstract.authors]
      .sort((a, b) => a.position - b.position)
      .map((author) => ({
        key: author.uuid,
        firstName: author.firstName ?? '',
        middleName: author.middleName ?? '',
        lastName: author.lastName ?? '',
        mail: author.mail ?? '',
        affiliations: author.affiliationUuids
          .map((uuid) => affiliations.findIndex((a) => a.uuid === uuid))
          .filter((idx) => idx >= 0)
          .sort((a, b) => a - b),
      })),
    affiliations: affiliations.map((affiliation) => ({
      key: affiliation.uuid,
      department: affiliation.department ?? '',
      section: affiliation.section ?? '',
      address: affiliation.address ?? '',
      country: affiliation.country ?? '',
    })),
    references: [...abstract.references]
      .sort((a, b) => a.position - b.position)
      .map((reference) => ({
        key: reference.uuid,
        text: reference.text ?? '',
        doi: reference.doi ?? '',
        link: reference.link ?? '',
      })),
  };
};

const toNullable = (value: string): string | null => (value.trim() !== '' ? value.trim() : null);

export const toAbstractEditParams = (editable: EditableAbstract): AbstractEditParams => ({
  title: editable.title.trim(),
  text: editable.text.trim(),
  topic: toNullable(editable.topic),
  acknowledgements: toNullable(editable.acknowledgements),
  conflictOfInterest: toNullable(editable.conflictOfInterest),
  isTalk: editable.isTalk,
  reasonForTalk: toNullable(editable.reasonForTalk),
  abstractGroupUuid: toNullable(editable.abstractGroupUuid),
  authors: editable.authors.map(({ key: _key, ...author }) => author),
  affiliations: editable.affiliations.map(({ key: _key, ...affiliation }) => affiliation),
  references: editable.references.map(({ key: _key, ...reference }) => reference),
});

/**
 * Builds an abstract for the preview, numbering the affiliations as the server does.
 */
export const toPreviewAbstract = (
  editable: EditableAbstract,
  original: AbstractEntity | null,
  conferenceUuid: string,
): AbstractSimpleEntity => {
  const order: number[] = [];
  editable.authors.forEach((author) => {
    author.affiliations.forEach((idx) => {
      if (!order.includes(idx)) {
        order.push(idx);
      }
    });
  });
  editable.affiliations.forEach((_, idx) => {
    if (!order.includes(idx)) {
      order.push(idx);
    }
  });
  return {
    uuid: original?.uuid ?? 'preview',
    title: editable.title,
    text: editable.text,
    doi: original?.doi ?? null,
    acknowledgements: toNullable(editable.acknowledgements),
    conflictOfInterest: toNullable(editable.conflictOfInterest),
    isTalk: editable.isTalk,
    reasonForTalk: toNullable(editable.reasonForTalk),
    sortId: original?.sortId ?? 0,
    state: original?.state ?? 'InPreparation',
    topic: editable.topic,
    conferenceUuid,
    authors: editable.authors.map((author, position) => ({
      uuid: author.key,
      firstName: author.firstName,
      middleName: toNullable(author.middleName),
      lastName: author.lastName,
      mail: toNullable(author.mail),
      position,
      affiliationUuids: author.affiliations.map((idx) => editable.affiliations[idx].key),
    })),
    affiliations: order.map((idx, position) => ({
      uuid: editable.affiliations[idx].key,
      department: toNullable(editable.affiliations[idx].department),
      section: toNullable(editable.affiliations[idx].section),
      address: toNullable(editable.affiliations[idx].address),
      country: toNullable(editable.affiliations[idx].country),
      position,
    })),
    figures: original?.figures ?? [],
    references: editable.references.map((reference, position) => ({
      uuid: reference.key,
      text: toNullable(reference.text),
      doi: toNullable(reference.doi),
      link: toNullable(reference.link),
      position,
    })),
    abstractGroupUuid: toNullable(editable.abstractGroupUuid),
  };
};

/**
 * @returns the problems to fix before submitting; the server refuses submission for the same reasons except for
 *     unused affiliations and authors without affiliations, which are only warned about
 */
export const getSubmissionProblems = (editable: EditableAbstract, conference: ConferenceEntity): string[] => {
  const problems: string[] = [];
  if (editable.title.trim() === '') {
    problems.push('The title is empty.');
  }
  if (/\$.*\$/.test(editable.title)) {
    problems.push('Please avoid LaTeX code in the title.');
  }
  if (editable.text.trim() === '') {
    problems.push('The text is empty.');
  }
  if (editable.authors.length === 0) {
    problems.push('No authors are given.');
  }
  if (editable.authors.some((a) => a.firstName.trim() === '' || a.lastName.trim() === '')) {
    problems.push('Some authors have no first or last name.');
  }
  if (editable.authors.some((a) => a.affiliations.length === 0)) {
    problems.push('Some authors have no affiliation.');
  }
  if (editable.affiliations.some((_, idx) => !editable.authors.some((a) => a.affiliations.includes(idx)))) {
    problems.push('Some affiliations are not used by any author.');
  }
  if (conference.topics.length > 0 && editable.topic === '') {
    problems.push('No topic is selected.');
  }
  if (conference.hasPresentationPrefs && conference.abstractGroups.length > 0 && editable.abstractGroupUuid === '') {
    problems.push('No presentation type is selected.');
  }
  return problems;
};

export const isEditableByOwner = (state: StateLogState, isConferenceOpen: boolean): boolean => {
  return (isConferenceOpen && state === 'InPreparation') || state === 'InRevision';
};
