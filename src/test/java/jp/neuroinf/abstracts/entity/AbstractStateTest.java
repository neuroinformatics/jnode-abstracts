package jp.neuroinf.abstracts.entity;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

class AbstractStateTest {

  @Test
  void ofResolvesStoredNames() {
    assertEquals(AbstractState.IN_PREPARATION, AbstractState.of("InPreparation"));
    assertEquals(AbstractState.WITHDRAWN, AbstractState.of("Withdrawn"));
    assertNull(AbstractState.of("IN_PREPARATION"));
    assertNull(AbstractState.of(null));
  }

  @Test
  void ownersSubmitAndWithdrawOnlyWhileOpen() {
    assertTrue(AbstractState.IN_PREPARATION.canOwnerTransitionTo(AbstractState.SUBMITTED, true));
    assertTrue(AbstractState.SUBMITTED.canOwnerTransitionTo(AbstractState.WITHDRAWN, true));
    assertFalse(AbstractState.IN_PREPARATION.canOwnerTransitionTo(AbstractState.SUBMITTED, false));
    assertFalse(AbstractState.SUBMITTED.canOwnerTransitionTo(AbstractState.IN_PREPARATION, false));
    assertTrue(AbstractState.IN_REVISION.canOwnerTransitionTo(AbstractState.SUBMITTED, false));
    assertFalse(AbstractState.IN_REVIEW.canOwnerTransitionTo(AbstractState.ACCEPTED, true));
  }

  @Test
  void managersReview() {
    assertTrue(AbstractState.SUBMITTED.canManagerTransitionTo(AbstractState.IN_REVIEW));
    assertTrue(AbstractState.IN_REVIEW.canManagerTransitionTo(AbstractState.ACCEPTED));
    assertTrue(AbstractState.ACCEPTED.canManagerTransitionTo(AbstractState.IN_REVISION));
    assertFalse(AbstractState.SUBMITTED.canManagerTransitionTo(AbstractState.ACCEPTED));
    assertFalse(AbstractState.IN_PREPARATION.canManagerTransitionTo(AbstractState.SUBMITTED));
    assertFalse(AbstractState.WITHDRAWN.canManagerTransitionTo(AbstractState.IN_REVIEW));
  }

}
