package jp.neuroinf.abstracts.component;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;

/**
 * Blocks logins to an account for a while after repeated failures, against guessing passwords. Counted per account
 * rather than per client address, as all clients may share the address of a reverse proxy.
 */
@Component
public class LoginAttemptLimiter {

  public static final int MAX_FAILURES = 5;
  public static final Duration BLOCK_DURATION = Duration.ofMinutes(15);

  // entries are pruned when the map grows beyond this, e.g. by failures for many unknown accounts
  private static final int PRUNE_THRESHOLD = 10000;

  private record Attempts(int failures, Instant lastFailure) {
  }

  private final Map<String, Attempts> attempts = new ConcurrentHashMap<>();
  private final Clock clock;

  public LoginAttemptLimiter() {
    this(Clock.systemUTC());
  }

  LoginAttemptLimiter(Clock clock) {
    this.clock = clock;
  }

  public boolean isBlocked(String username) {
    final Attempts current = this.attempts.get(key(username));
    return current != null && current.failures() >= MAX_FAILURES && !isExpired(current);
  }

  public void loginFailed(String username) {
    if (this.attempts.size() > PRUNE_THRESHOLD) {
      this.attempts.values().removeIf(this::isExpired);
    }
    final Instant now = this.clock.instant();
    this.attempts.merge(key(username), new Attempts(1, now),
        (old, added) -> isExpired(old) ? added : new Attempts(old.failures() + 1, now));
  }

  public void loginSucceeded(String username) {
    this.attempts.remove(key(username));
  }

  private boolean isExpired(Attempts attempts) {
    return attempts.lastFailure().plus(BLOCK_DURATION).isBefore(this.clock.instant());
  }

  private static String key(String username) {
    return username != null ? username.strip().toLowerCase(Locale.ROOT) : "";
  }

}
