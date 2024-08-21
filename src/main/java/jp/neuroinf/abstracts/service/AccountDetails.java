package jp.neuroinf.abstracts.service;

import java.util.Collection;
import java.util.Collections;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import jp.neuroinf.abstracts.dto.AccountDto;
import jp.neuroinf.abstracts.entity.Account;

public class AccountDetails implements UserDetails {

  private Account account;

  public AccountDetails(Account account) {
    this.account = account;
  }

  public AccountDto getAccount() {
    return AccountDto.of(this.account);
  }

  @Override
  public Collection<? extends GrantedAuthority> getAuthorities() {
    return Collections.singleton(new SimpleGrantedAuthority("USER"));
  }

  @Override
  public String getPassword() {
    return this.account.getPassword();
  }

  @Override
  public String getUsername() {
    return this.account.getMail();
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
    return this.account.getIsActive();
  }
}