package jp.neuroinf.abstracts.core;

import java.io.Serial;

import org.springframework.security.authentication.AccountStatusException;

/**
 * Thrown on login by users other than site admins while the site is read-only.
 */
public class LoginRestrictedException extends AccountStatusException {

  @Serial
  private static final long serialVersionUID = 1L;

  public static final String MESSAGE = "Login is currently restricted to site administrators";

  public LoginRestrictedException() {
    super(MESSAGE);
  }

}
