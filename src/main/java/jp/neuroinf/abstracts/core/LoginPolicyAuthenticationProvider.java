package jp.neuroinf.abstracts.core;

import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;

import jp.neuroinf.abstracts.component.LoginAttemptLimiter;

/**
 * Refuses logins that the site does not allow now, before the password is checked: logins of other users than site
 * admins while the site is read-only, and logins to accounts blocked after repeated failures. It does not look up the
 * account, so that the answer does not tell whether the account exists.
 *
 * The exceptions are account status exceptions, which end the authentication at once as a normal failure, while
 * exceptions of the user details service would be logged as internal errors.
 */
public class LoginPolicyAuthenticationProvider implements AuthenticationProvider {

  private final AppProperties appProperties;
  private final LoginAttemptLimiter loginAttemptLimiter;

  public LoginPolicyAuthenticationProvider(AppProperties appProperties, LoginAttemptLimiter loginAttemptLimiter) {
    this.appProperties = appProperties;
    this.loginAttemptLimiter = loginAttemptLimiter;
  }

  @Override
  public Authentication authenticate(Authentication authentication) throws AuthenticationException {
    final String username = authentication.getName();
    if (this.appProperties.getReadOnly() && !this.appProperties.getAdmins().contains(username)) {
      throw new LoginRestrictedException();
    }
    if (this.loginAttemptLimiter.isBlocked(username)) {
      throw new LoginBlockedException();
    }
    // leave the authentication to the next provider
    return null;
  }

  @Override
  public boolean supports(Class<?> authentication) {
    return UsernamePasswordAuthenticationToken.class.isAssignableFrom(authentication);
  }

}
