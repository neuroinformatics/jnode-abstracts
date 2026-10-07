package jp.neuroinf.abstracts.component;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;

import org.junit.jupiter.api.Test;

class LoginAttemptLimiterTest {

  private static class MutableClock extends Clock {

    private Instant now = Instant.parse("2026-10-07T00:00:00Z");

    @Override
    public ZoneOffset getZone() {
      return ZoneOffset.UTC;
    }

    @Override
    public Clock withZone(java.time.ZoneId zone) {
      return this;
    }

    @Override
    public Instant instant() {
      return this.now;
    }

    void advance(Duration duration) {
      this.now = this.now.plus(duration);
    }

  }

  @Test
  void blocksAfterTooManyFailuresUntilTheBlockExpires() {
    MutableClock clock = new MutableClock();
    LoginAttemptLimiter limiter = new LoginAttemptLimiter(clock);
    for (int i = 0; i < LoginAttemptLimiter.MAX_FAILURES - 1; i++) {
      limiter.loginFailed("user@example.com");
    }
    assertFalse(limiter.isBlocked("user@example.com"));
    limiter.loginFailed("USER@example.com ");
    assertTrue(limiter.isBlocked("user@example.com"));
    clock.advance(LoginAttemptLimiter.BLOCK_DURATION.plusSeconds(1));
    assertFalse(limiter.isBlocked("user@example.com"));
    // failures start over after the block
    limiter.loginFailed("user@example.com");
    assertFalse(limiter.isBlocked("user@example.com"));
  }

  @Test
  void successfulLoginResetsTheFailures() {
    LoginAttemptLimiter limiter = new LoginAttemptLimiter(new MutableClock());
    for (int i = 0; i < LoginAttemptLimiter.MAX_FAILURES - 1; i++) {
      limiter.loginFailed("user@example.com");
    }
    limiter.loginSucceeded("user@example.com");
    limiter.loginFailed("user@example.com");
    assertFalse(limiter.isBlocked("user@example.com"));
  }

}
