package jp.neuroinf.abstracts.service;

import java.io.File;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import jakarta.transaction.Transactional;
import jp.neuroinf.abstracts.core.AccountDetails;
import jp.neuroinf.abstracts.core.AppProperties;
import jp.neuroinf.abstracts.core.RestSuccessResponseBody;
import jp.neuroinf.abstracts.dto.AbstractDto;
import jp.neuroinf.abstracts.entity.Abstract;
import jp.neuroinf.abstracts.entity.AbstractAbstractGroup;
import jp.neuroinf.abstracts.entity.AbstractGroup;
import jp.neuroinf.abstracts.entity.AbstractOwners;
import jp.neuroinf.abstracts.entity.AbstractState;
import jp.neuroinf.abstracts.entity.Account;
import jp.neuroinf.abstracts.entity.Affiliation;
import jp.neuroinf.abstracts.entity.Author;
import jp.neuroinf.abstracts.entity.AuthorAffiliations;
import jp.neuroinf.abstracts.entity.Conference;
import jp.neuroinf.abstracts.entity.Figure;
import jp.neuroinf.abstracts.entity.Reference;
import jp.neuroinf.abstracts.entity.StateLog;
import jp.neuroinf.abstracts.form.AbstractEditForm;
import jp.neuroinf.abstracts.form.AbstractUpdateOwnersForm;
import jp.neuroinf.abstracts.form.AbstractUpdatePublicationForm;
import jp.neuroinf.abstracts.form.AbstractUpdateStateForm;
import jp.neuroinf.abstracts.repository.AbstractRepository;
import jp.neuroinf.abstracts.repository.AccountRepository;
import jp.neuroinf.abstracts.repository.ConferenceRepository;

@Service
public class AbstractService {

  private static final String RESPONSE_MESSAGE_SUCCESS = "success";
  private static final String RESPONSE_MESSAGE_NO_ABSTRACT_DATA = "no abstract data found";

  private final AbstractRepository abstractRepository;
  private final AccountRepository accountRepository;
  private final ConferenceRepository conferenceRepository;
  private final PermissionService permissionService;
  private final AppProperties appProperties;

  public AbstractService(AbstractRepository abstractRepository, AccountRepository accountRepository,
      ConferenceRepository conferenceRepository, PermissionService permissionService, AppProperties appProperties) {
    this.abstractRepository = abstractRepository;
    this.accountRepository = accountRepository;
    this.conferenceRepository = conferenceRepository;
    this.permissionService = permissionService;
    this.appProperties = appProperties;
  }

  @Transactional
  public AbstractDto getAbstract(AccountDetails user, String uuid) throws ResponseStatusException {
    Account account = this.permissionService.findAccount(user);
    Abstract abstract_ = this.abstractRepository.findFirstByUuid(uuid);
    if (abstract_ == null || !this.permissionService.isAbstractReadable(abstract_, account)) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, RESPONSE_MESSAGE_NO_ABSTRACT_DATA);
    }
    AbstractDto dto = AbstractDto.of(abstract_);
    if (!this.permissionService.isAbstractEditor(abstract_, account)) {
      // owner mail addresses and review notes are private to the owners and managers
      dto.setOwners(List.of());
      dto.setStateLogs(List.of());
    }
    return dto;
  }

  /**
   * Lists the abstracts owned by the logged in user, in all conferences.
   */
  @Transactional
  public List<AbstractDto> getOwnAbstracts(AccountDetails user) throws ResponseStatusException {
    final Account account = this.permissionService.requireAccount(user);
    return this.abstractRepository.findByOwner(account.getUuid()).stream().map(AbstractDto::of).toList();
  }

  /**
   * Creates an abstract in preparation, owned by the logged in user.
   */
  @Transactional
  public AbstractDto createAbstract(AccountDetails user, String conferenceUuid, AbstractEditForm form)
      throws ResponseStatusException {
    final Account account = this.permissionService.requireAccount(user);
    final Conference conference = this.conferenceRepository.findFirstByUuid(conferenceUuid);
    if (conference == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "no conference data found");
    }
    if (!conference.getIsOpen() && !this.permissionService.isConferenceManager(conference, account)) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "The conference is not open for submission");
    }
    final Abstract abstract_ = new Abstract();
    abstract_.setConference(conference);
    abstract_.setState(AbstractState.IN_PREPARATION.getValue());
    abstract_.setSortId(0);
    final AbstractOwners owner = new AbstractOwners();
    owner.setAbstract_(abstract_);
    owner.setOwner(account);
    abstract_.getAbstractOwners().add(owner);
    abstract_.getStateLogs().add(newStateLog(abstract_, AbstractState.IN_PREPARATION, account,
        "Initial abstract creation"));
    applyContent(abstract_, form);
    this.abstractRepository.saveAndFlush(abstract_);
    return AbstractDto.of(abstract_);
  }

  @Transactional
  public AbstractDto updateAbstract(AccountDetails user, String uuid, AbstractEditForm form)
      throws ResponseStatusException {
    final Account account = this.permissionService.requireAccount(user);
    final Abstract abstract_ = requireAbstract(uuid);
    requireContentEditor(abstract_, account);
    // replace the child entities, removing the old ones first
    abstract_.getAuthors().clear();
    abstract_.getAffiliations().clear();
    abstract_.getReferences().clear();
    this.abstractRepository.flush();
    applyContent(abstract_, form);
    this.abstractRepository.flush();
    return AbstractDto.of(abstract_);
  }

  /**
   * Deletes an abstract. Owners can delete it only while it has not been submitted.
   */
  @Transactional
  public RestSuccessResponseBody deleteAbstract(AccountDetails user, String uuid) throws ResponseStatusException {
    final Account account = this.permissionService.requireAccount(user);
    final Abstract abstract_ = requireAbstract(uuid);
    final boolean isManager = this.permissionService.isConferenceManager(abstract_.getConference(), account);
    final boolean isOwnerDeletable = abstract_.isOwner(account)
        && AbstractState.IN_PREPARATION.matches(abstract_.getState());
    if (!isManager && !isOwnerDeletable) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only abstracts in preparation can be deleted");
    }
    final List<String> figureUuids = abstract_.getFigures().stream().map(Figure::getUuid).toList();
    // detach favorites from the accounts too, as they would otherwise still refer to the deleted abstract
    abstract_.getFavorites().forEach(f -> f.getAccount().getFavorites().remove(f));
    abstract_.getConference().getAbstracts().remove(abstract_);
    this.abstractRepository.delete(abstract_);
    this.abstractRepository.flush();
    figureUuids.forEach(figureUuid -> {
      final File file = new File(this.appProperties.getPathFigures(), figureUuid);
      if (file.exists() && !file.delete()) {
        System.err.println("Failed to delete file: " + file.getPath());
      }
    });
    return new RestSuccessResponseBody(RESPONSE_MESSAGE_SUCCESS);
  }

  /**
   * Replaces the owners. Owners other than managers cannot remove themselves.
   */
  @Transactional
  public AbstractDto updateOwners(AccountDetails user, String uuid, AbstractUpdateOwnersForm form)
      throws ResponseStatusException {
    final Account account = this.permissionService.requireAccount(user);
    final Abstract abstract_ = requireAbstract(uuid);
    if (!this.permissionService.isAbstractEditor(abstract_, account)) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, PermissionService.RESPONSE_MESSAGE_NO_PRIVILEGES);
    }
    final List<String> mails = form.getOwners().stream().map(String::trim).distinct().toList();
    final List<Account> accounts = this.accountRepository.findByMailIn(mails);
    if (accounts.size() != mails.size()) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Some users not found");
    }
    if (!this.permissionService.isConferenceManager(abstract_.getConference(), account)
        && accounts.stream().noneMatch(a -> a.getUuid().equals(account.getUuid()))) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot remove your own privilege");
    }
    // keep the rows of the remaining owners, as they are identified by the owner
    abstract_.getAbstractOwners().removeIf(o -> accounts.stream().noneMatch(a -> a.getUuid().equals(o.getOwner().getUuid())));
    accounts.stream().filter(a -> !abstract_.isOwner(a)).forEach(a -> {
      final AbstractOwners owner = new AbstractOwners();
      owner.setAbstract_(abstract_);
      owner.setOwner(a);
      abstract_.getAbstractOwners().add(owner);
    });
    this.abstractRepository.flush();
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
    if (to == AbstractState.SUBMITTED) {
      final List<String> problems = getSubmissionProblems(abstract_);
      if (!problems.isEmpty()) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
            "The abstract cannot be submitted: " + String.join(", ", problems));
      }
    }
    abstract_.getStateLogs().add(0, newStateLog(abstract_, to, account, form.getNote()));
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
    final AbstractGroup abstractGroup = findAbstractGroup(conference, form.getAbstractGroupUuid());
    assignAbstractGroup(abstract_, abstractGroup);
    // sort ids hold the group prefix in the upper 16 bits and the number in the lower 16 bits
    final int prefix = abstractGroup != null ? abstractGroup.getPrefix() : 0;
    abstract_.setSortId((prefix << 16) | form.getNumber());
    abstract_.setDoi(trimToNull(form.getDoi()));
    this.abstractRepository.flush();
    return AbstractDto.of(abstract_);
  }

  /**
   * Requires that the account may edit the content: managers always, owners while the state allows it.
   */
  void requireContentEditor(Abstract abstract_, Account account) throws ResponseStatusException {
    final Conference conference = abstract_.getConference();
    if (this.permissionService.isConferenceManager(conference, account)) {
      return;
    }
    if (!abstract_.isOwner(account)) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, PermissionService.RESPONSE_MESSAGE_NO_PRIVILEGES);
    }
    final AbstractState state = AbstractState.of(abstract_.getState());
    if (state == null || !state.isEditableByOwner(conference.getIsOpen())) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "The abstract cannot be edited in its current state");
    }
  }

  Abstract requireAbstract(String uuid) throws ResponseStatusException {
    final Abstract abstract_ = this.abstractRepository.findFirstByUuid(uuid);
    if (abstract_ == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, RESPONSE_MESSAGE_NO_ABSTRACT_DATA);
    }
    return abstract_;
  }

  private void applyContent(Abstract abstract_, AbstractEditForm form) throws ResponseStatusException {
    final Conference conference = abstract_.getConference();
    final String text = form.getText().strip();
    if (conference.getAbstractMaxLength() > 0 && text.length() > conference.getAbstractMaxLength()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
          String.format("The abstract text exceeds %d characters", conference.getAbstractMaxLength()));
    }
    final String topic = trimToNull(form.getTopic());
    if (topic != null && conference.getTopics().stream().noneMatch(t -> t.getTopic().equals(topic))) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid topic");
    }
    final int numAffiliations = form.getAffiliations().size();
    if (form.getAuthors().stream().flatMap(a -> a.getAffiliations().stream()).anyMatch(i -> i >= numAffiliations)) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid affiliation of an author");
    }
    abstract_.setTitle(form.getTitle().strip());
    abstract_.setText(text);
    abstract_.setTopic(topic);
    abstract_.setAcknowledgements(trimToNull(form.getAcknowledgements()));
    abstract_.setConflictOfInterest(trimToNull(form.getConflictOfInterest()));
    abstract_.setIsTalk(Boolean.TRUE.equals(form.getIsTalk()));
    abstract_.setReasonForTalk(trimToNull(form.getReasonForTalk()));
    // authors choose the presentation group only if the conference asks for presentation preferences
    if (conference.getHasPresentationPrefs()) {
      assignAbstractGroup(abstract_, findAbstractGroup(conference, form.getAbstractGroupUuid()));
    }
    // number the affiliations in the order the authors refer to them, followed by unused ones
    final Set<Integer> order = new LinkedHashSet<>();
    form.getAuthors().forEach(a -> order.addAll(a.getAffiliations()));
    for (int i = 0; i < numAffiliations; i++) {
      order.add(i);
    }
    final Map<Integer, Affiliation> affiliations = new HashMap<>();
    int position = 0;
    for (Integer i : order) {
      final AbstractEditForm.AffiliationForm f = form.getAffiliations().get(i);
      final Affiliation affiliation = new Affiliation();
      affiliation.setDepartment(trimToNull(f.getDepartment()));
      affiliation.setSection(trimToNull(f.getSection()));
      affiliation.setAddress(trimToNull(f.getAddress()));
      affiliation.setCountry(trimToNull(f.getCountry()));
      affiliation.setPosition(position++);
      affiliation.setAbstract_(abstract_);
      abstract_.getAffiliations().add(affiliation);
      affiliations.put(i, affiliation);
    }
    // persist the affiliations first, as the author affiliation rows are identified by both uuids
    if (abstract_.getUuid() == null) {
      this.abstractRepository.save(abstract_);
    }
    this.abstractRepository.flush();
    position = 0;
    for (AbstractEditForm.AuthorForm f : form.getAuthors()) {
      final Author author = new Author();
      author.setFirstName(trimToNull(f.getFirstName()));
      author.setMiddleName(trimToNull(f.getMiddleName()));
      author.setLastName(trimToNull(f.getLastName()));
      author.setMail(trimToNull(f.getMail()));
      author.setPosition(position++);
      author.setAbstract_(abstract_);
      f.getAffiliations().stream().distinct().map(affiliations::get)
          .sorted((a, b) -> a.getPosition() - b.getPosition()).forEach(affiliation -> {
            final AuthorAffiliations authorAffiliation = new AuthorAffiliations();
            authorAffiliation.setAuthor(author);
            authorAffiliation.setAffiliation(affiliation);
            // added on the author side only, so that the row is persisted after the author got its uuid
            author.getAuthorAffiliations().add(authorAffiliation);
          });
      abstract_.getAuthors().add(author);
    }
    position = 0;
    for (AbstractEditForm.ReferenceForm f : form.getReferences()) {
      final Reference reference = new Reference();
      reference.setText(trimToNull(f.getText()));
      reference.setDoi(trimToNull(f.getDoi()));
      reference.setLink(trimToNull(f.getLink()));
      reference.setPosition(position++);
      reference.setAbstract_(abstract_);
      abstract_.getReferences().add(reference);
    }
  }

  /**
   * @return what keeps the abstract from being submitted, or an empty list if it is complete
   */
  private List<String> getSubmissionProblems(Abstract abstract_) {
    final Conference conference = abstract_.getConference();
    final List<String> problems = new ArrayList<>();
    if (abstract_.getTitle() == null || abstract_.getTitle().isBlank()) {
      problems.add("the title is empty");
    }
    if (abstract_.getText() == null || abstract_.getText().isBlank()) {
      problems.add("the text is empty");
    }
    if (abstract_.getAuthors().isEmpty()) {
      problems.add("no authors are given");
    }
    if (abstract_.getAuthors().stream().anyMatch(a -> a.getFirstName() == null || a.getLastName() == null)) {
      problems.add("some authors have no first or last name");
    }
    if (!conference.getTopics().isEmpty() && abstract_.getTopic() == null) {
      problems.add("no topic is selected");
    }
    if (conference.getHasPresentationPrefs() && !conference.getAbstractGroups().isEmpty()
        && abstract_.getAbstractAbstractGroup() == null) {
      problems.add("no presentation type is selected");
    }
    return problems;
  }

  private AbstractGroup findAbstractGroup(Conference conference, String uuid) throws ResponseStatusException {
    if (uuid == null) {
      return null;
    }
    return conference.getAbstractGroups().stream().filter(g -> g.getUuid().equals(uuid)).findFirst()
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid abstract group"));
  }

  private void assignAbstractGroup(Abstract abstract_, AbstractGroup abstractGroup) {
    final AbstractAbstractGroup current = abstract_.getAbstractAbstractGroup();
    if (current != null && current.getAbstractGroup() == abstractGroup) {
      return;
    }
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

  private StateLog newStateLog(Abstract abstract_, AbstractState state, Account editor, String note) {
    final StateLog stateLog = new StateLog();
    stateLog.setState(state.getValue());
    stateLog.setEditor(editor.getFirstName() + " " + editor.getLastName());
    stateLog.setNote(trimToNull(note));
    stateLog.setAbstract_(abstract_);
    return stateLog;
  }

  private static String trimToNull(String value) {
    if (value == null) {
      return null;
    }
    final String trimmed = value.strip();
    return !trimmed.isEmpty() ? trimmed : null;
  }

}
