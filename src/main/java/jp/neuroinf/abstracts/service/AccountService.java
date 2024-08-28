package jp.neuroinf.abstracts.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import jp.neuroinf.abstracts.core.AppProperties;
import jp.neuroinf.abstracts.dto.AccountDto;
import jp.neuroinf.abstracts.entity.Account;
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

  public Account findByEmail(String username) {
    return accountRepository.findFistByMail(username);
  }

  public AccountDto getCurrentUser(AccountDetails user) {
    Account account = user.getAccount();
    boolean isAdmin = this.properties.getAdmins().contains(account.getMail());
    return AccountDto.of(account, isAdmin);
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