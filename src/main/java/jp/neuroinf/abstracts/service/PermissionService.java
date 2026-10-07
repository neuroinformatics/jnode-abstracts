package jp.neuroinf.abstracts.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import jp.neuroinf.abstracts.core.AccountDetails;
import jp.neuroinf.abstracts.core.AppProperties;
import jp.neuroinf.abstracts.entity.Abstract;
import jp.neuroinf.abstracts.entity.AbstractState;
import jp.neuroinf.abstracts.entity.Account;
import jp.neuroinf.abstracts.entity.Conference;
import jp.neuroinf.abstracts.repository.AccountRepository;

/**
 * Resolves the logged in account and decides what it is allowed to do.
 */
@Service
public class PermissionService {

  public static final String RESPONSE_MESSAGE_LOGIN_REQUIRED = "Login required";
  public static final String RESPONSE_MESSAGE_NO_PRIVILEGES = "You don't have privileges";

  private final AccountRepository accountRepository;
  private final AppProperties appProperties;

  public PermissionService(AccountRepository accountRepository, AppProperties appProperties) {
    this.accountRepository = accountRepository;
    this.appProperties = appProperties;
  }

  /**
   * Loads the latest account entity of the logged in user.
   *
   * @return the account, or null if not logged in or the account no longer exists
   */
  public Account findAccount(AccountDetails user) {
    return user != null ? this.accountRepository.findFirstByUuid(user.getUuid()) : null;
  }

  public Account requireAccount(AccountDetails user) throws ResponseStatusException {
    Account account = findAccount(user);
    if (account == null) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, RESPONSE_MESSAGE_LOGIN_REQUIRED);
    }
    return account;
  }

  public boolean isAdmin(Account account) {
    return account != null && this.appProperties.getAdmins().contains(account.getMail());
  }

  public Account requireAdmin(AccountDetails user) throws ResponseStatusException {
    Account account = requireAccount(user);
    if (!isAdmin(account)) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, RESPONSE_MESSAGE_NO_PRIVILEGES);
    }
    return account;
  }

  /**
   * Site admins and conference owners manage a conference and all of its abstracts.
   */
  public boolean isConferenceManager(Conference conference, Account account) {
    return isAdmin(account) || conference.isOwner(account);
  }

  public void requireConferenceManager(Conference conference, Account account) throws ResponseStatusException {
    if (!isConferenceManager(conference, account)) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, RESPONSE_MESSAGE_NO_PRIVILEGES);
    }
  }

  public boolean isAbstractEditor(Abstract abstract_, Account account) {
    return abstract_.isOwner(account) || isConferenceManager(abstract_.getConference(), account);
  }

  public boolean isAbstractReadable(Abstract abstract_, Account account) {
    Conference conference = abstract_.getConference();
    return isAbstractEditor(abstract_, account)
        || conference.getIsPublished() && AbstractState.ACCEPTED.matches(abstract_.getState());
  }

}
