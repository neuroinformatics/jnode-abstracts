package jp.neuroinf.abstracts.entity;

import java.util.List;
import java.util.Map;

/**
 * Review states of an abstract, stored by name in {@code abstract.state} and {@code state_log.state}.
 */
public enum AbstractState {

  IN_PREPARATION("InPreparation"),
  SUBMITTED("Submitted"),
  IN_REVIEW("InReview"),
  ACCEPTED("Accepted"),
  REJECTED("Rejected"),
  IN_REVISION("InRevision"),
  WITHDRAWN("Withdrawn");

  // transitions allowed to abstract owners while the conference is open for submission
  private static final Map<AbstractState, List<AbstractState>> OWNER_OPEN_TRANSITIONS = Map.of(
      IN_PREPARATION, List.of(SUBMITTED),
      SUBMITTED, List.of(IN_PREPARATION, WITHDRAWN),
      IN_REVISION, List.of(SUBMITTED));

  // transitions allowed to abstract owners after the conference is closed
  private static final Map<AbstractState, List<AbstractState>> OWNER_CLOSED_TRANSITIONS = Map.of(
      IN_REVISION, List.of(SUBMITTED));

  // transitions allowed to site admins and conference owners
  private static final Map<AbstractState, List<AbstractState>> MANAGER_TRANSITIONS = Map.of(
      SUBMITTED, List.of(IN_REVIEW),
      IN_REVIEW, List.of(ACCEPTED, REJECTED, IN_REVISION, WITHDRAWN),
      IN_REVISION, List.of(IN_REVIEW),
      ACCEPTED, List.of(IN_REVISION, WITHDRAWN),
      REJECTED, List.of(IN_REVISION, WITHDRAWN));

  private final String value;

  AbstractState(String value) {
    this.value = value;
  }

  public String getValue() {
    return this.value;
  }

  public boolean matches(String value) {
    return this.value.equals(value);
  }

  /**
   * @return the state with the given stored name, or null if there is none
   */
  public static AbstractState of(String value) {
    for (AbstractState state : values()) {
      if (state.matches(value)) {
        return state;
      }
    }
    return null;
  }

  public boolean canOwnerTransitionTo(AbstractState to, boolean isConferenceOpen) {
    Map<AbstractState, List<AbstractState>> transitions = isConferenceOpen
        ? OWNER_OPEN_TRANSITIONS
        : OWNER_CLOSED_TRANSITIONS;
    return transitions.getOrDefault(this, List.of()).contains(to);
  }

  public boolean canManagerTransitionTo(AbstractState to) {
    return MANAGER_TRANSITIONS.getOrDefault(this, List.of()).contains(to);
  }

  /**
   * Owners may edit the content while preparing it, or while revising it on request.
   */
  public boolean isEditableByOwner(boolean isConferenceOpen) {
    return isConferenceOpen && this == IN_PREPARATION || this == IN_REVISION;
  }

}
