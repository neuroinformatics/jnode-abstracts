package jp.neuroinf.abstracts.core;

import java.io.Serial;

import org.springframework.security.authentication.AccountStatusException;

/**
 * Thrown on login to an account blocked after repeated failures.
 */
public class LoginBlockedException extends AccountStatusException {

  @Serial
  private static final long serialVersionUID = 1L;

  public static final String MESSAGE = "Too many failed logins. Please try again later.";

  public LoginBlockedException() {
    super(MESSAGE);
  }

}
