package jp.neuroinf.abstracts.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import jakarta.transaction.Transactional;
import jp.neuroinf.abstracts.core.AccountDetails;
import jp.neuroinf.abstracts.core.RestSuccessResponseBody;
import jp.neuroinf.abstracts.dto.AbstractSimpleDto;
import jp.neuroinf.abstracts.entity.Abstract;
import jp.neuroinf.abstracts.entity.Account;
import jp.neuroinf.abstracts.entity.AccountFavorites;
import jp.neuroinf.abstracts.repository.AbstractRepository;

/**
 * Manages the abstracts users mark as favorites.
 */
@Service
public class FavoriteService {

  private static final String RESPONSE_MESSAGE_SUCCESS = "success";

  private final AbstractRepository abstractRepository;
  private final PermissionService permissionService;

  public FavoriteService(AbstractRepository abstractRepository, PermissionService permissionService) {
    this.abstractRepository = abstractRepository;
    this.permissionService = permissionService;
  }

  /**
   * Lists the favorite abstracts the user can still read, e.g. leaving out abstracts that were withdrawn later.
   */
  @Transactional
  public List<AbstractSimpleDto> getFavorites(AccountDetails user) throws ResponseStatusException {
    final Account account = this.permissionService.requireAccount(user);
    return account.getFavorites().stream().map(AccountFavorites::getAbstract_)
        .filter(a -> this.permissionService.isAbstractReadable(a, account))
        .sorted((a, b) -> b.getConference().getStartDate().compareTo(a.getConference().getStartDate()))
        .map(AbstractSimpleDto::of).toList();
  }

  @Transactional
  public RestSuccessResponseBody addFavorite(AccountDetails user, String uuid) throws ResponseStatusException {
    final Account account = this.permissionService.requireAccount(user);
    final Abstract abstract_ = requireReadableAbstract(uuid, account);
    if (account.getFavorites().stream().noneMatch(f -> f.getAbstract_().getUuid().equals(uuid))) {
      final AccountFavorites favorite = new AccountFavorites();
      favorite.setAccount(account);
      favorite.setAbstract_(abstract_);
      account.getFavorites().add(favorite);
      abstract_.getFavorites().add(favorite);
    }
    return new RestSuccessResponseBody(RESPONSE_MESSAGE_SUCCESS);
  }

  @Transactional
  public RestSuccessResponseBody removeFavorite(AccountDetails user, String uuid) throws ResponseStatusException {
    final Account account = this.permissionService.requireAccount(user);
    account.getFavorites().stream().filter(f -> f.getAbstract_().getUuid().equals(uuid)).findFirst()
        .ifPresent(favorite -> {
          favorite.getAbstract_().getFavorites().remove(favorite);
          account.getFavorites().remove(favorite);
        });
    return new RestSuccessResponseBody(RESPONSE_MESSAGE_SUCCESS);
  }

  private Abstract requireReadableAbstract(String uuid, Account account) throws ResponseStatusException {
    final Abstract abstract_ = this.abstractRepository.findFirstByUuid(uuid);
    if (abstract_ == null || !this.permissionService.isAbstractReadable(abstract_, account)) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "no abstract data found");
    }
    return abstract_;
  }

}
