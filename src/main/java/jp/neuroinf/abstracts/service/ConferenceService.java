package jp.neuroinf.abstracts.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import jakarta.transaction.Transactional;
import jp.neuroinf.abstracts.core.AccountDetails;
import jp.neuroinf.abstracts.core.AppProperties;
import jp.neuroinf.abstracts.core.RestSuccessResponseBody;
import jp.neuroinf.abstracts.dto.AbstractSimpleDto;
import jp.neuroinf.abstracts.dto.ConferenceDto;
import jp.neuroinf.abstracts.dto.ConferenceSimpleDto;
import jp.neuroinf.abstracts.entity.Account;
import jp.neuroinf.abstracts.entity.Conference;
import jp.neuroinf.abstracts.entity.ConferenceOwners;
import jp.neuroinf.abstracts.form.ConferenceUpdateOwnersForm;
import jp.neuroinf.abstracts.repository.AccountRepository;
import jp.neuroinf.abstracts.repository.ConferenceRepository;

@Service
public class ConferenceService {

  private final AccountRepository accountRepository;
  private final ConferenceRepository conferenceRepository;
  private final AppProperties appProperties;

  @Autowired
  public ConferenceService(
      AccountRepository accountRepository,
      ConferenceRepository conferenceRepository,
      AppProperties appProperties) {
    this.accountRepository = accountRepository;
    this.conferenceRepository = conferenceRepository;
    this.appProperties = appProperties;
  }

  @Transactional
  public List<ConferenceSimpleDto> getConferenceList(Account account) {
    List<Conference> conferences = this.conferenceRepository.getConferences();
    List<ConferenceSimpleDto> dtoList = conferences.stream().map(c -> ConferenceSimpleDto.of(c, account))
        .collect(Collectors.toList());
    return dtoList;
  }

  @Transactional
  public ConferenceDto getConference(Account account, String uuid) {
    Conference conference = this.conferenceRepository.findFirstByUuid(uuid);
    return conference != null ? ConferenceDto.of(conference, account) : null;
  }

  @Transactional
  public List<AbstractSimpleDto> getConferenceAbstracts(Account account, String uuid) {
    Conference conference = this.conferenceRepository.findFirstByUuid(uuid);
    if (conference == null) {
      return null;
    }
    boolean isWritable = isWritable(conference, account);
    if (!isWritable && !conference.getIsPublished()) {
      return null; // no permissions
    }
    return conference.getAbstracts().stream().map(AbstractSimpleDto::of)
        .filter((d) -> isWritable || d.getState().equals("Accepted"))
        .collect(Collectors.toList());
  }

  @Transactional
  public RestSuccessResponseBody updateConferenceOwners(AccountDetails user, String uuid,
      ConferenceUpdateOwnersForm form) {
    if (user == null) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Login required");
    }
    final Account currentUser = user.getAccount();
    final Conference conference = this.conferenceRepository.findFirstByUuid(uuid);
    if (conference == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Invalid conference id");
    }
    final boolean isAdmin = isAdmin(currentUser);
    final boolean isConferenceOwner = conference.isOwner(currentUser);
    final boolean isWritable = isAdmin || isConferenceOwner;
    if (!isWritable) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You don't have privileges");
    }
    final List<Account> accounts = this.accountRepository.findByMailIn(form.getOwners());
    if (accounts.size() != form.getOwners().size()) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Some users not found");
    }
    if (!isAdmin && accounts.stream().filter((a) -> a.getMail().equals(currentUser.getMail())).findFirst()
        .orElse(null) == null) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot remove your own privilege");
    }
    List<ConferenceOwners> owners = accounts.stream().map((owner) -> {
      final ConferenceOwners ret = new ConferenceOwners();
      ret.setConference(conference);
      ret.setOwner(owner);
      return ret;
    }).collect(Collectors.toList());
    conference.getConferenceOwners().clear();
    conference.getConferenceOwners().addAll(owners);
    this.conferenceRepository.save(conference);
    return new RestSuccessResponseBody("success");
  }

  private boolean isAdmin(Account account) {
    return account != null ? this.appProperties.getAdmins().contains(account.getMail()) : false;
  }

  private boolean isWritable(Conference conference, Account account) {
    boolean isConferenceOwner = conference.isOwner(account);
    return isAdmin(account) || isConferenceOwner;
  }
}
