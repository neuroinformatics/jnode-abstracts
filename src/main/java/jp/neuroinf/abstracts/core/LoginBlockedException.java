package jp.neuroinf.abstracts.core;

import java.io.Serial;

import org.springframework.security.core.AuthenticationException;

/**
 * Thrown on login to an account blocked after repeated failures.
 */
public class LoginBlockedException extends AuthenticationException {

  @Serial
  private static final long serialVersionUID = 1L;

  public static final String MESSAGE = "Too many failed logins. Please try again later.";

  public LoginBlockedException() {
    super(MESSAGE);
  }

}
