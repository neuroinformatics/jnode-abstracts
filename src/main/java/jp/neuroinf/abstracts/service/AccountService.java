package jp.neuroinf.abstracts.service;

import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import jakarta.transaction.Transactional;
import jp.neuroinf.abstracts.component.EmailTemplateSender;
import jp.neuroinf.abstracts.component.TimestampSigner;
import jp.neuroinf.abstracts.core.AccountDetails;
import jp.neuroinf.abstracts.core.AppProperties;
import jp.neuroinf.abstracts.core.RestSuccessResponseBody;
import jp.neuroinf.abstracts.dto.AccountDto;
import jp.neuroinf.abstracts.entity.Account;
import jp.neuroinf.abstracts.form.UsersChangeEmailForm;
import jp.neuroinf.abstracts.form.UsersChangePasswordForm;
import jp.neuroinf.abstracts.form.UsersCreateForm;
import jp.neuroinf.abstracts.form.UsersExistsForm;
import jp.neuroinf.abstracts.form.UsersRequestPasswordResetForm;
import jp.neuroinf.abstracts.form.UsersResetPasswordForm;
import jp.neuroinf.abstracts.form.UsersUpdateForm;
import jp.neuroinf.abstracts.repository.AccountRepository;
import jp.neuroinf.abstracts.utility.PasswordGenerator;
import jp.neuroinf.abstracts.utility.PasswordGenerator.PasswordGeneratorBuilder;

@Service
public class AccountService implements UserDetailsService {

  private static final String RESPONSE_MESSAGE_MAIL_TAKEN = "This email is already taken. Try another email.";

  private final AccountRepository accountRepository;
  private final PasswordEncoder passwordEncoder;
  private final TimestampSigner timestampSigner;
  private final EmailTemplateSender emailTemplateSender;
  private final PermissionService permissionService;
  private final AppProperties appProperties;

  public AccountService(
      AccountRepository accountRepository,
      PasswordEncoder passwordEncoder,
      TimestampSigner timestampSigner,
      EmailTemplateSender emailTemplateSender,
      PermissionService permissionService,
      AppProperties appProperties) {
    this.accountRepository = accountRepository;
    this.passwordEncoder = passwordEncoder;
    this.timestampSigner = timestampSigner;
    this.emailTemplateSender = emailTemplateSender;
    this.permissionService = permissionService;
    this.appProperties = appProperties;
  }

  @Override
  public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
    Account account = this.accountRepository.findFirstByMail(email);
    if (account == null) {
      throw new UsernameNotFoundException("User not found");
    }
    return new AccountDetails(account);
  }

  public AccountDto getCurrentUser(AccountDetails user) throws ResponseStatusException {
    Account account = this.permissionService.requireAccount(user);
    return AccountDto.of(account, this.permissionService.isAdmin(account));
  }

  public RestSuccessResponseBody exists(AccountDetails user, UsersExistsForm form) throws ResponseStatusException {
    this.permissionService.requireAccount(user);
    Account account = this.accountRepository.findFirstByMail(form.getEmail());
    if (account == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Account with this email does not exist");
    }
    return new RestSuccessResponseBody("found");
  }

  public RestSuccessResponseBody requestPasswordReset(UsersRequestPasswordResetForm form)
      throws ResponseStatusException {
    final String email = form.getEmail();
    final Account account = this.accountRepository.findFirstByMail(email);
    if (account == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Account with this email does not exist");
    }
    final String token = this.timestampSigner.sign(email);
    final Map<String, Object> variables = new HashMap<>();
    variables.put("firstName", account.getFirstName());
    variables.put("resetUrl", String.format("%s/resetpassword?token=%s", this.appProperties.getUrl(), token));
    if (!this.emailTemplateSender.send(account.getMail(), "Request to reset password", "requestPasswordReset",
        variables)) {
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to send mail");
    }
    return new RestSuccessResponseBody("success");
  }

  public RestSuccessResponseBody resetPassword(UsersResetPasswordForm form) throws ResponseStatusException {
    final String email = timestampSigner.unSign(form.getToken(), 86400); // 24hours
    if (email == null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Token is invalid or already expired");
    }
    final Account account = this.accountRepository.findFirstByMail(email);
    if (account == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Account with this email does not exist.");
    }
    final String password = generatePassword();
    account.setPassword(this.passwordEncoder.encode(password));
    this.accountRepository.save(account);
    final Map<String, Object> variables = new HashMap<>();
    variables.put("firstName", account.getFirstName());
    variables.put("password", password);
    variables.put("loginUrl", String.format("%s/login", this.appProperties.getUrl()));
    if (!this.emailTemplateSender.send(account.getMail(), "Reset password", "resetPassword", variables)) {
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to send mail");
    }
    return new RestSuccessResponseBody("success");
  }

  public RestSuccessResponseBody changePassword(AccountDetails user, String uuid, UsersChangePasswordForm form)
      throws ResponseStatusException {
    Account currentUser = this.permissionService.requireAccount(user);
    boolean isAdmin = this.permissionService.isAdmin(currentUser);
    Account account = this.accountRepository.findFirstByUuid(uuid);
    if (account == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Invalid user id");
    }
    if (!account.getUuid().equals(currentUser.getUuid()) && !isAdmin) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You don't have privileges");
    }
    if (!this.passwordEncoder.matches(form.getOldPassword(), account.getPassword()) && !isAdmin) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password mismatched");
    }
    account.setPassword(this.passwordEncoder.encode(form.getNewPassword()));
    this.accountRepository.save(account);
    return new RestSuccessResponseBody("success");
  }

  public RestSuccessResponseBody changeEmail(AccountDetails user, String uuid, UsersChangeEmailForm form)
      throws ResponseStatusException {
    Account currentUser = this.permissionService.requireAccount(user);
    boolean isAdmin = this.permissionService.isAdmin(currentUser);
    Account account = this.accountRepository.findFirstByUuid(uuid);
    if (account == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Invalid user id");
    }
    if (!account.getUuid().equals(currentUser.getUuid()) && !isAdmin) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You don't have privileges");
    }
    if (!this.passwordEncoder.matches(form.getPassword(), account.getPassword()) && !isAdmin) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password mismatched");
    }
    account.setMail(form.getEmail());
    try {
      this.accountRepository.save(account);
    } catch (DataIntegrityViolationException e) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, RESPONSE_MESSAGE_MAIL_TAKEN);
    }
    return new RestSuccessResponseBody("success");
  }

  public List<AccountDto> listAccounts(AccountDetails user) throws ResponseStatusException {
    this.permissionService.requireAdmin(user);
    return this.accountRepository.findAll(Sort.by("lastName", "firstName", "mail")).stream()
        .map(a -> AccountDto.of(a, this.permissionService.isAdmin(a))).toList();
  }

  /**
   * Creates an active account with a generated password, and sends the password to the new user. Not transactional
   * on purpose: the account is committed before the mail goes out, so that no mail is sent for an account that was
   * not saved.
   */
  public AccountDto createAccount(AccountDetails user, UsersCreateForm form) throws ResponseStatusException {
    this.permissionService.requireAdmin(user);
    final String email = form.getEmail().trim();
    if (this.accountRepository.findFirstByMail(email) != null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, RESPONSE_MESSAGE_MAIL_TAKEN);
    }
    final String password = generatePassword();
    final Account account = new Account();
    account.setMail(email);
    account.setPassword(this.passwordEncoder.encode(password));
    account.setFirstName(form.getFirstName().trim());
    account.setLastName(form.getLastName().trim());
    account.setIsActive(true);
    final Account saved;
    try {
      saved = this.accountRepository.saveAndFlush(account);
    } catch (DataIntegrityViolationException e) {
      // created by someone else since the check above
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, RESPONSE_MESSAGE_MAIL_TAKEN);
    }
    final Map<String, Object> variables = new HashMap<>();
    variables.put("firstName", saved.getFirstName());
    variables.put("mail", saved.getMail());
    variables.put("password", password);
    variables.put("loginUrl", String.format("%s/login", this.appProperties.getUrl()));
    if (!this.emailTemplateSender.send(saved.getMail(), "Your account", "createAccount", variables)) {
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
          "The account was created, but the mail with the password could not be sent."
              + " Ask the user to reset the password with 'Forgot password'.");
    }
    return AccountDto.of(saved, this.permissionService.isAdmin(saved));
  }

  @Transactional
  public AccountDto updateAccount(AccountDetails user, String uuid, UsersUpdateForm form)
      throws ResponseStatusException {
    final Account currentUser = this.permissionService.requireAdmin(user);
    final Account account = this.accountRepository.findFirstByUuid(uuid);
    if (account == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Invalid user id");
    }
    if (account.getUuid().equals(currentUser.getUuid()) && !form.getIsActive()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot deactivate your own account");
    }
    account.setFirstName(form.getFirstName().trim());
    account.setLastName(form.getLastName().trim());
    account.setIsActive(form.getIsActive());
    final Account saved = this.accountRepository.saveAndFlush(account);
    return AccountDto.of(saved, this.permissionService.isAdmin(saved));
  }

  private String generatePassword() {
    final PasswordGeneratorBuilder builder = new PasswordGenerator.PasswordGeneratorBuilder();
    final PasswordGenerator generator = builder.useLower(true).useUpper(true).useDigit(true).usePunct(true).build();
    return generator.generate(16);
  }

  /**
   * Finds the accounts of the given mail addresses, which are compared ignoring case like the database does.
   */
  public List<Account> findAccountsByMail(List<String> mails) throws ResponseStatusException {
    final List<String> distinctMails = mails.stream().map(String::strip).map(m -> m.toLowerCase(Locale.ROOT))
        .distinct().toList();
    final List<Account> accounts = this.accountRepository.findByLowerCaseMailIn(distinctMails);
    if (accounts.size() != distinctMails.size()) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Some users not found");
    }
    return accounts;
  }

}
