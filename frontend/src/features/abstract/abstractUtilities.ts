import type { StateLogState } from '../../entities/abstract';

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
