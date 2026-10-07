package jp.neuroinf.abstracts.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import jakarta.transaction.Transactional;
import jp.neuroinf.abstracts.core.AccountDetails;
import jp.neuroinf.abstracts.dto.AbstractDto;
import jp.neuroinf.abstracts.entity.Abstract;
import jp.neuroinf.abstracts.entity.AbstractAbstractGroup;
import jp.neuroinf.abstracts.entity.AbstractGroup;
import jp.neuroinf.abstracts.entity.AbstractState;
import jp.neuroinf.abstracts.entity.Account;
import jp.neuroinf.abstracts.entity.Conference;
import jp.neuroinf.abstracts.entity.StateLog;
import jp.neuroinf.abstracts.form.AbstractUpdatePublicationForm;
import jp.neuroinf.abstracts.form.AbstractUpdateStateForm;
import jp.neuroinf.abstracts.repository.AbstractRepository;

@Service
public class AbstractService {

  private static final String RESPONSE_MESSAGE_NO_ABSTRACT_DATA = "no abstract data found";

  private final AbstractRepository abstractRepository;
  private final PermissionService permissionService;

  public AbstractService(AbstractRepository abstractRepository, PermissionService permissionService) {
    this.abstractRepository = abstractRepository;
    this.permissionService = permissionService;
  }

  @Transactional
  public AbstractDto getAbstract(AccountDetails user, String uuid) throws ResponseStatusException {
    Account account = this.permissionService.findAccount(user);
    Abstract abstract_ = this.abstractRepository.findFirstByUuid(uuid);
    if (abstract_ == null || !this.permissionService.isAbstractReadable(abstract_, account)) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, RESPONSE_MESSAGE_NO_ABSTRACT_DATA);
    }
    return AbstractDto.of(abstract_);
  }

  /**
   * Changes the review state, allowing the transitions of the owner role and of the manager role the account has.
   */
  @Transactional
  public AbstractDto updateState(AccountDetails user, String uuid, AbstractUpdateStateForm form)
      throws ResponseStatusException {
    final Account account = this.permissionService.requireAccount(user);
    final Abstract abstract_ = requireAbstract(uuid);
    final Conference conference = abstract_.getConference();
    if (!this.permissionService.isAbstractEditor(abstract_, account)) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, PermissionService.RESPONSE_MESSAGE_NO_PRIVILEGES);
    }
    final AbstractState from = AbstractState.of(abstract_.getState());
    final AbstractState to = AbstractState.of(form.getState());
    if (from == null || to == null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid state");
    }
    final boolean canOwnerTransition = abstract_.isOwner(account)
        && from.canOwnerTransitionTo(to, conference.getIsOpen());
    final boolean canManagerTransition = this.permissionService.isConferenceManager(conference, account)
        && from.canManagerTransitionTo(to);
    if (!canOwnerTransition && !canManagerTransition) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN,
          String.format("The state cannot be changed from %s to %s", from.getValue(), to.getValue()));
    }
    final String note = form.getNote() != null ? form.getNote().trim() : "";
    final StateLog stateLog = new StateLog();
    stateLog.setState(to.getValue());
    stateLog.setEditor(account.getFirstName() + " " + account.getLastName());
    stateLog.setNote(!note.isEmpty() ? note : null);
    stateLog.setAbstract_(abstract_);
    abstract_.getStateLogs().add(0, stateLog);
    abstract_.setState(to.getValue());
    this.abstractRepository.flush();
    return AbstractDto.of(abstract_);
  }

  @Transactional
  public AbstractDto updatePublication(AccountDetails user, String uuid, AbstractUpdatePublicationForm form)
      throws ResponseStatusException {
    final Account account = this.permissionService.requireAccount(user);
    final Abstract abstract_ = requireAbstract(uuid);
    final Conference conference = abstract_.getConference();
    this.permissionService.requireConferenceManager(conference, account);
    AbstractGroup abstractGroup = null;
    if (form.getAbstractGroupUuid() != null) {
      abstractGroup = conference.getAbstractGroups().stream()
          .filter(g -> g.getUuid().equals(form.getAbstractGroupUuid())).findFirst()
          .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid abstract group"));
    }
    final AbstractAbstractGroup current = abstract_.getAbstractAbstractGroup();
    if (current == null || current.getAbstractGroup() != abstractGroup) {
      if (current != null) {
        // remove the old row first, as the abstract may belong to only one group
        current.getAbstractGroup().getAbstractAbstractGroups().remove(current);
        abstract_.setAbstractAbstractGroup(null);
        this.abstractRepository.flush();
      }
      if (abstractGroup != null) {
        final AbstractAbstractGroup assigned = new AbstractAbstractGroup();
        assigned.setAbstract_(abstract_);
        assigned.setAbstractGroup(abstractGroup);
        abstractGroup.getAbstractAbstractGroups().add(assigned);
        abstract_.setAbstractAbstractGroup(assigned);
      }
    }
    // sort ids hold the group prefix in the upper 16 bits and the number in the lower 16 bits
    final int prefix = abstractGroup != null ? abstractGroup.getPrefix() : 0;
    abstract_.setSortId((prefix << 16) | form.getNumber());
    final String doi = form.getDoi() != null ? form.getDoi().trim() : "";
    abstract_.setDoi(!doi.isEmpty() ? doi : null);
    this.abstractRepository.flush();
    return AbstractDto.of(abstract_);
  }

  private Abstract requireAbstract(String uuid) throws ResponseStatusException {
    final Abstract abstract_ = this.abstractRepository.findFirstByUuid(uuid);
    if (abstract_ == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, RESPONSE_MESSAGE_NO_ABSTRACT_DATA);
    }
    return abstract_;
  }

}
