package jp.neuroinf.abstracts.service;

import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import jakarta.transaction.Transactional;
import jp.neuroinf.abstracts.component.FileStorage;
import jp.neuroinf.abstracts.core.AccountDetails;
import jp.neuroinf.abstracts.core.AppProperties;
import jp.neuroinf.abstracts.core.RestSuccessResponseBody;
import jp.neuroinf.abstracts.dto.AbstractDto;
import jp.neuroinf.abstracts.dto.AbstractSimpleDto;
import jp.neuroinf.abstracts.dto.ConferenceDto;
import jp.neuroinf.abstracts.dto.ConferenceSimpleDto;
import jp.neuroinf.abstracts.entity.AbstractGroup;
import jp.neuroinf.abstracts.entity.AbstractState;
import jp.neuroinf.abstracts.entity.Account;
import jp.neuroinf.abstracts.entity.Banner;
import jp.neuroinf.abstracts.entity.Conference;
import jp.neuroinf.abstracts.entity.ConferenceOwners;
import jp.neuroinf.abstracts.entity.Figure;
import jp.neuroinf.abstracts.entity.Topic;
import jp.neuroinf.abstracts.form.ConferenceCreateForm;
import jp.neuroinf.abstracts.form.ConferenceUpdateAbstractGroupsForm;
import jp.neuroinf.abstracts.form.ConferenceUpdateForm;
import jp.neuroinf.abstracts.form.ConferenceUpdateGeoForm;
import jp.neuroinf.abstracts.form.ConferenceUpdateInfoForm;
import jp.neuroinf.abstracts.form.ConferenceUpdateOwnersForm;
import jp.neuroinf.abstracts.form.ConferenceUpdateScheduleForm;
import jp.neuroinf.abstracts.repository.ConferenceRepository;

@Service
public class ConferenceService {

  private static final String RESPONSE_MESSAGE_SUCCESS = "success";
  private static final String RESPONSE_MESSAGE_NO_CONFERENCE_DATA = "no conference data found";

  // initial settings of a new conference, changed later on the conference settings page
  private static final int DEFAULT_ABSTRACT_MAX_LENGTH = 2000;
  private static final int DEFAULT_ABSTRACT_MAX_FIGURES = 1;

  private final AccountService accountService;
  private final ConferenceRepository conferenceRepository;
  private final PermissionService permissionService;
  private final FileStorage fileStorage;
  private final AppProperties appProperties;

  public ConferenceService(
      AccountService accountService,
      ConferenceRepository conferenceRepository,
      PermissionService permissionService,
      FileStorage fileStorage,
      AppProperties appProperties) {
    this.accountService = accountService;
    this.conferenceRepository = conferenceRepository;
    this.permissionService = permissionService;
    this.fileStorage = fileStorage;
    this.appProperties = appProperties;
  }

  @Transactional
  public List<ConferenceSimpleDto> getConferenceList(AccountDetails user) {
    Account account = this.permissionService.findAccount(user);
    List<Conference> conferences = this.conferenceRepository.getConferences();
    return conferences.stream().map(c -> ConferenceSimpleDto.of(c, account)).toList();
  }

  @Transactional
  public ConferenceDto getConference(AccountDetails user, String uuid) throws ResponseStatusException {
    Account account = this.permissionService.findAccount(user);
    Conference conference = requireConference(uuid);
    return ConferenceDto.of(conference, account, this.permissionService.isConferenceManager(conference, account));
  }

  /**
   * Lists the accepted abstracts of a published conference. Managers can also preview them before publication.
   */
  @Transactional
  public List<AbstractSimpleDto> getConferenceAbstracts(AccountDetails user, String uuid)
      throws ResponseStatusException {
    Account account = this.permissionService.findAccount(user);
    Conference conference = requireConference(uuid);
    if (!conference.getIsPublished() && !this.permissionService.isConferenceManager(conference, account)) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "no abstracts data found");
    }
    return conference.getAbstracts().stream()
        .filter(a -> AbstractState.ACCEPTED.matches(a.getState()))
        .map(AbstractSimpleDto::of).toList();
  }

  /**
   * Lists all abstracts of a conference in any state, for managers.
   */
  @Transactional
  public List<AbstractDto> getConferenceAllAbstracts(AccountDetails user, String uuid)
      throws ResponseStatusException {
    Conference conference = requireManagedConference(user, uuid);
    return conference.getAbstracts().stream().map(AbstractDto::of).toList();
  }

  @Transactional
  public ConferenceSimpleDto createConference(AccountDetails user, ConferenceCreateForm form)
      throws ResponseStatusException {
    final Account currentUser = this.permissionService.requireAdmin(user);
    final String shortName = form.getShortName().trim();
    if (!this.conferenceRepository.getConferencesByShortName(shortName).isEmpty()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This short name is already taken");
    }
    final Conference conference = new Conference();
    conference.setIsOpen(false);
    conference.setIsPublished(false);
    conference.setIsActive(false);
    conference.setName(form.getName().trim());
    conference.setShortName(shortName);
    conference.setStartDate(form.getStartDate());
    conference.setEndDate(form.getEndDate());
    conference.setDeadline(form.getDeadline());
    conference.setHasPresentationPrefs(false);
    conference.setAbstractMaxLength(DEFAULT_ABSTRACT_MAX_LENGTH);
    conference.setAbstractMaxFigures(DEFAULT_ABSTRACT_MAX_FIGURES);
    final ConferenceOwners owner = new ConferenceOwners();
    owner.setConference(conference);
    owner.setOwner(currentUser);
    conference.getConferenceOwners().add(owner);
    final Conference saved = this.conferenceRepository.save(conference);
    return ConferenceSimpleDto.of(saved, currentUser);
  }

  @Transactional
  public RestSuccessResponseBody deleteConference(AccountDetails user, String uuid) throws ResponseStatusException {
    this.permissionService.requireAdmin(user);
    final Conference conference = requireConference(uuid);
    final List<String> bannerUuids = conference.getBanners().stream().map(Banner::getUuid).toList();
    final List<String> figureUuids = conference.getAbstracts().stream()
        .flatMap(a -> a.getFigures().stream()).map(Figure::getUuid).toList();
    // detach favorites from the accounts too, as they would otherwise still refer to the deleted abstracts
    conference.getAbstracts().stream().flatMap(a -> a.getFavorites().stream())
        .forEach(f -> f.getAccount().getFavorites().remove(f));
    this.conferenceRepository.delete(conference);
    this.conferenceRepository.flush();
    bannerUuids.forEach(bannerUuid -> this.fileStorage.delete(this.appProperties.getPathBanners(), bannerUuid));
    figureUuids.forEach(figureUuid -> this.fileStorage.delete(this.appProperties.getPathFigures(), figureUuid));
    return new RestSuccessResponseBody(RESPONSE_MESSAGE_SUCCESS);
  }

  @Transactional
  public RestSuccessResponseBody updateConference(AccountDetails user, String uuid,
      ConferenceUpdateForm form) throws ResponseStatusException {
    final Conference conference = requireManagedConference(user, uuid);
    final String shortName = form.getShortName().trim();
    final boolean isShortNameTaken = this.conferenceRepository.getConferencesByShortName(shortName).stream()
        .anyMatch(c -> !c.getUuid().equals(conference.getUuid()));
    if (isShortNameTaken) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This short name is already taken");
    }
    conference.setIsOpen(form.getIsOpen());
    conference.setIsPublished(form.getIsPublished());
    conference.setIsActive(form.getIsActive());
    conference.setName(form.getName());
    conference.setShortName(shortName);
    conference.setConferenceGroup(form.getConferenceGroup());
    conference.setCite(form.getCite());
    conference.setStartDate(form.getStartDate());
    conference.setEndDate(form.getEndDate());
    conference.setDeadline(form.getDeadline());
    conference.setLogo(form.getLogoLink());
    conference.setThumbnail(form.getThumbnailLink());
    conference.setIosApp(form.getIosApp());
    conference.setLink(form.getLink());
    conference.setDescription(form.getDescription());
    conference.setNotice(form.getNotice());
    conference.setHasPresentationPrefs(form.getHasPresentationPrefs());
    conference.setAbstractMaxLength(form.getAbstractMaxLength());
    conference.setAbstractMaxFigures(form.getAbstractMaxFigures());
    // topics
    conference.getTopics().clear();
    if (form.getTopics() != null) {
      final List<Topic> topics = form.getTopics().stream().map(topic -> {
        final Topic ret = new Topic();
        ret.setUuid(topic.getUuid());
        ret.setPosition(topic.getPosition());
        ret.setTopic(topic.getTopic());
        ret.setConference(conference);
        return ret;
      }).toList();
      conference.getTopics().addAll(topics);
    }
    // banners
    if (form.getLogoUuid() == null) {
      final Optional<Banner> banner = conference.getLogoBanner();
      if (banner.isPresent()) {
        this.fileStorage.delete(this.appProperties.getPathBanners(), banner.get().getUuid());
        conference.getBanners().remove(banner.get());
      }
    }
    if (form.getLogoFile() != null && !form.getLogoFile().isEmpty()) {
      final Banner banner = new Banner();
      banner.setType("logo");
      banner.setConference(conference);
      conference.getBanners().add(banner);
    }
    if (form.getThumbnailUuid() == null) {
      final Optional<Banner> banner = conference.getThumbnailBanner();
      if (banner.isPresent()) {
        this.fileStorage.delete(this.appProperties.getPathBanners(), banner.get().getUuid());
        conference.getBanners().remove(banner.get());
      }
    }
    if (form.getThumbnailFile() != null && !form.getThumbnailFile().isEmpty()) {
      final Banner banner = new Banner();
      banner.setType("thumbnail");
      banner.setConference(conference);
      conference.getBanners().add(banner);
    }
    this.conferenceRepository.saveAndFlush(conference);
    // register banner files, failing the request (and rolling back the banner rows) if a file cannot be written
    final String pathBanners = this.appProperties.getPathBanners();
    if (form.getLogoFile() != null && !form.getLogoFile().isEmpty()) {
      conference.getLogoBanner().ifPresent(b -> this.fileStorage.write(pathBanners, b.getUuid(), form.getLogoFile()));
    }
    if (form.getThumbnailFile() != null && !form.getThumbnailFile().isEmpty()) {
      conference.getThumbnailBanner()
          .ifPresent(b -> this.fileStorage.write(pathBanners, b.getUuid(), form.getThumbnailFile()));
    }
    return new RestSuccessResponseBody(RESPONSE_MESSAGE_SUCCESS);
  }

  @Transactional
  public RestSuccessResponseBody updateConferenceAbstractGroups(AccountDetails user, String uuid,
      ConferenceUpdateAbstractGroupsForm form) throws ResponseStatusException {
    final Conference conference = requireManagedConference(user, uuid);
    // an empty list is sent as no parameters at all
    final List<ConferenceUpdateAbstractGroupsForm.AbstractGroupForm> abstractGroupForms = form.getAbstractGroups() != null
        ? form.getAbstractGroups()
        : List.of();
    conference.getAbstractGroups().stream()
        .filter(a -> abstractGroupForms.stream().noneMatch(f -> a.getUuid().equals(f.getUuid())))
        .forEach(a -> {
          if (a.hasAbstracts()) {
            // deletion of groups in use is prohibited
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                "Some of the groups to be deleted are currently in use");
          }
        });
    conference.getAbstractGroups().clear();
    final List<AbstractGroup> abstractGroups = abstractGroupForms.stream().map(f -> {
      final AbstractGroup ret = new AbstractGroup();
      ret.setUuid(f.getUuid());
      ret.setPrefix(f.getPrefix());
      ret.setName(f.getName());
      ret.setShortName(f.getShortName());
      ret.setConference(conference);
      return ret;
    }).toList();
    conference.getAbstractGroups().addAll(abstractGroups);
    this.conferenceRepository.save(conference);
    return new RestSuccessResponseBody(RESPONSE_MESSAGE_SUCCESS);
  }

  @Transactional
  public RestSuccessResponseBody updateConferenceGeo(AccountDetails user, String uuid,
      ConferenceUpdateGeoForm form) throws ResponseStatusException {
    final Conference conference = requireManagedConference(user, uuid);
    final String geo = form.getGeo().trim();
    conference.setGeo(!geo.isEmpty() ? geo : null);
    this.conferenceRepository.save(conference);
    return new RestSuccessResponseBody(RESPONSE_MESSAGE_SUCCESS);
  }

  @Transactional
  public RestSuccessResponseBody updateConferenceSchedule(AccountDetails user, String uuid,
      ConferenceUpdateScheduleForm form) throws ResponseStatusException {
    final Conference conference = requireManagedConference(user, uuid);
    final String schedule = form.getSchedule().trim();
    conference.setSchedule(!schedule.isEmpty() ? schedule : null);
    this.conferenceRepository.save(conference);
    return new RestSuccessResponseBody(RESPONSE_MESSAGE_SUCCESS);
  }

  @Transactional
  public RestSuccessResponseBody updateConferenceInfo(AccountDetails user, String uuid,
      ConferenceUpdateInfoForm form) throws ResponseStatusException {
    final Conference conference = requireManagedConference(user, uuid);
    final String info = form.getInfo().trim();
    conference.setInfo(!info.isEmpty() ? info : null);
    this.conferenceRepository.save(conference);
    return new RestSuccessResponseBody(RESPONSE_MESSAGE_SUCCESS);
  }

  @Transactional
  public RestSuccessResponseBody updateConferenceOwners(AccountDetails user, String uuid,
      ConferenceUpdateOwnersForm form) throws ResponseStatusException {
    final Account currentUser = this.permissionService.requireAccount(user);
    final Conference conference = requireConference(uuid);
    this.permissionService.requireConferenceManager(conference, currentUser);
    final List<Account> accounts = this.accountService.findAccountsByMail(form.getOwners());
    if (!this.permissionService.isAdmin(currentUser)
        && accounts.stream().noneMatch(a -> a.getUuid().equals(currentUser.getUuid()))) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot remove your own privilege");
    }
    List<ConferenceOwners> owners = accounts.stream().map(owner -> {
      final ConferenceOwners ret = new ConferenceOwners();
      ret.setConference(conference);
      ret.setOwner(owner);
      return ret;
    }).toList();
    conference.getConferenceOwners().clear();
    conference.getConferenceOwners().addAll(owners);
    this.conferenceRepository.save(conference);
    return new RestSuccessResponseBody(RESPONSE_MESSAGE_SUCCESS);
  }

  private Conference requireConference(String uuid) throws ResponseStatusException {
    final Conference conference = this.conferenceRepository.findFirstByUuid(uuid);
    if (conference == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, RESPONSE_MESSAGE_NO_CONFERENCE_DATA);
    }
    return conference;
  }

  private Conference requireManagedConference(AccountDetails user, String uuid) throws ResponseStatusException {
    final Account currentUser = this.permissionService.requireAccount(user);
    final Conference conference = requireConference(uuid);
    this.permissionService.requireConferenceManager(conference, currentUser);
    return conference;
  }

}
