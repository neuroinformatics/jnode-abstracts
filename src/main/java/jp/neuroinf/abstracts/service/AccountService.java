package jp.neuroinf.abstracts.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import jakarta.transaction.Transactional;
import jp.neuroinf.abstracts.core.AppProperties;
import jp.neuroinf.abstracts.core.RestSuccessResponseBody;
import jp.neuroinf.abstracts.dto.AccountDto;
import jp.neuroinf.abstracts.entity.Account;
import jp.neuroinf.abstracts.form.UsersChangeEmailForm;
import jp.neuroinf.abstracts.form.UsersChangePasswordForm;
import jp.neuroinf.abstracts.repository.AccountRepository;

@Service
public class AccountService implements UserDetailsService {

  private final AccountRepository accountRepository;
  private final PasswordEncoder passwordEncoder;
  private final AppProperties properties;

  @Autowired
  public AccountService(
      AccountRepository accountRepository,
      PasswordEncoder passwordEncoder,
      AppProperties properties) {
    this.accountRepository = accountRepository;
    this.passwordEncoder = passwordEncoder;
    this.properties = properties;
  }

  @Override
  public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
    Account account = accountRepository.findFistByMail(email);
    if (account == null) {
      throw new UsernameNotFoundException("User not found");
    }
    return new AccountDetails(account);
  }

  public AccountDto getCurrentUser(AccountDetails user) {
    if (user == null) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Login required");
    }
    Account account = user.getAccount();
    boolean isAdmin = this.properties.getAdmins().contains(account.getMail());
    return AccountDto.of(account, isAdmin);
  }

  public RestSuccessResponseBody changePassword(AccountDetails user, String uuid, UsersChangePasswordForm form) {
    if (user == null) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Login required");
    }
    Account currentUser = user.getAccount();
    boolean isAdmin = this.properties.getAdmins().contains(currentUser.getMail());
    Account account = accountRepository.findFistByUuid(uuid);
    if (account == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Invalid user id");
    }
    if (!account.getUuid().equals(currentUser.getUuid()) && !isAdmin) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You don't have privileges");
    }
    if (!passwordEncoder.matches(form.getOldPassword(), account.getPassword()) && !isAdmin) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password mismatched");
    }
    account.setPassword(passwordEncoder.encode(form.getNewPassword()));
    accountRepository.save(account);
    return new RestSuccessResponseBody("success");
  }

  public RestSuccessResponseBody changeEmail(AccountDetails user, String uuid, UsersChangeEmailForm form) {
    if (user == null) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Login required");
    }
    Account currentUser = user.getAccount();
    boolean isAdmin = this.properties.getAdmins().contains(currentUser.getMail());
    Account account = accountRepository.findFistByUuid(uuid);
    if (account == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Invalid user id");
    }
    if (!account.getUuid().equals(currentUser.getUuid()) && !isAdmin) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You don't have privileges");
    }
    if (!passwordEncoder.matches(form.getPassword(), account.getPassword()) && !isAdmin) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password mismatched");
    }
    account.setMail(form.getEmail());
    try {
      accountRepository.save(account);
    } catch (DataIntegrityViolationException e) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This email is already taken. Try another email.");
    }
    return new RestSuccessResponseBody("success");
  }

  @Transactional
  public void create(AccountDto dto, String password) {
    Account account = new Account();
    account.setMail(dto.getMail());
    account.setPassword(passwordEncoder.encode(password));
    account.setFirstName(dto.getFirstName());
    account.setLastName(dto.getLastName());
    account.setIsActive(true);
    accountRepository.save(account);
  }

}