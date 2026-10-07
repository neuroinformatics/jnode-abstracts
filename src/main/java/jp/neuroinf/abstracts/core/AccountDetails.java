package jp.neuroinf.abstracts.core;

import java.io.Serial;
import java.util.Collection;
import java.util.Collections;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import jp.neuroinf.abstracts.entity.Account;

/*
 * Holds only the values needed for authentication, since it is stored in the HTTP session.
 * Load the latest Account entity by its uuid when the account data is needed.
 */
public class AccountDetails implements UserDetails {

  @Serial
  private static final long serialVersionUID = 1L;

  private final String uuid;

  private final String mail;

  private final String password;

  private final boolean isActive;

  public AccountDetails(Account account) {
    this.uuid = account.getUuid();
    this.mail = account.getMail();
    this.password = account.getPassword();
    this.isActive = account.getIsActive();
  }

  public String getUuid() {
    return this.uuid;
  }

  @Override
  public Collection<? extends GrantedAuthority> getAuthorities() {
    return Collections.singleton(new SimpleGrantedAuthority("USER"));
  }

  @Override
  public String getPassword() {
    return this.password;
  }

  @Override
  public String getUsername() {
    return this.mail;
  }

  @Override
  public boolean isAccountNonExpired() {
    return true;
  }

  @Override
  public boolean isAccountNonLocked() {
    return true;
  }

  @Override
  public boolean isCredentialsNonExpired() {
    return true;
  }

  @Override
  public boolean isEnabled() {
    return this.isActive;
  }

}
