package jp.neuroinf.abstracts.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import jp.neuroinf.abstracts.dto.AccountDto;
import jp.neuroinf.abstracts.entity.Account;
import jp.neuroinf.abstracts.repository.AccountRepository;

@Service
public class AccountService implements UserDetailsService {

  @Autowired
  private AccountRepository accountRepository;

  @Autowired
  private PasswordEncoder passwordEncoder;

  @Override
  public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
    Account account = accountRepository.findByMail(email);
    if (account == null) {
      throw new UsernameNotFoundException("User not found");
    }
    return new AccountDetails(account);
  }

  public Account findByEmail(String username) {
    return accountRepository.findByMail(username);
  }

  @Transactional
  public void create(AccountDto dto) {
    Account account = new Account();
    account.setMail(dto.getMail());
    account.setPassword(passwordEncoder.encode(dto.getPassword()));
    account.setFirstName(dto.getFirstName());
    account.setLastName(dto.getLastName());
    account.setIsActive(true);
    accountRepository.save(account);
  }

}