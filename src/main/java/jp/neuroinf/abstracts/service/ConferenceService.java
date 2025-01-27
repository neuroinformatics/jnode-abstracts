package jp.neuroinf.abstracts.service;

import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.util.List;
import java.util.Optional;

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
import jp.neuroinf.abstracts.entity.AbstractGroup;
import jp.neuroinf.abstracts.entity.Account;
import jp.neuroinf.abstracts.entity.Banner;
import jp.neuroinf.abstracts.entity.Conference;
import jp.neuroinf.abstracts.entity.ConferenceOwners;
import jp.neuroinf.abstracts.entity.Topic;
import jp.neuroinf.abstracts.form.ConferenceUpdateAbstractGroupsForm;
import jp.neuroinf.abstracts.form.ConferenceUpdateForm;
import jp.neuroinf.abstracts.form.ConferenceUpdateGeoForm;
import jp.neuroinf.abstracts.form.ConferenceUpdateInfoForm;
import jp.neuroinf.abstracts.form.ConferenceUpdateOwnersForm;
import jp.neuroinf.abstracts.form.ConferenceUpdateScheduleForm;
import jp.neuroinf.abstracts.repository.AccountRepository;
import jp.neuroinf.abstracts.repository.ConferenceRepository;

@Service
public class ConferenceService {

  private static final String RESPONSE_MESSAGE_SUCCESS = "success";
  private static final String RESPONSE_MESSAGE_LOGIN_REQUIRED = "no conference data found";
  private static final String RESPONSE_MESSAGE_NO_CONFERENCE_DATA = "no conference data found";
  private static final String RESPONSE_MESSAGE_NO_PRIVILEGES = "You don't have privileges";

  private final AccountRepository accountRepository;
  private final ConferenceRepository conferenceRepository;
  private final AppProperties appProperties;

  public ConferenceService(
      AccountRepository accountRepository,
      ConferenceRepository conferenceRepository,
      AppProperties appProperties) {
    this.accountRepository = accountRepository;
    this.conferenceRepository = conferenceRepository;
    this.appProperties = appProperties;
  }

  @Transactional
  public List<ConferenceSimpleDto> getConferenceList(AccountDetails user) {
    Account account = user != null ? user.getAccount() : null;
    List<Conference> conferences = this.conferenceRepository.getConferences();
    return conferences.stream().map(c -> ConferenceSimpleDto.of(c, account)).toList();
  }

  @Transactional
  public ConferenceDto getConference(AccountDetails user, String uuid) {
    Account account = user != null ? user.getAccount() : null;
    Conference conference = this.conferenceRepository.findFirstByUuid(uuid);
    if (conference == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, RESPONSE_MESSAGE_LOGIN_REQUIRED);
    }
    return ConferenceDto.of(conference, account);
  }

  @Transactional
  public List<AbstractSimpleDto> getConferenceAbstracts(AccountDetails user, String uuid) {
    Account account = user != null ? user.getAccount() : null;
    Conference conference = this.conferenceRepository.findFirstByUuid(uuid);
    if (conference == null) {
      return null;
    }
    boolean isWritable = isWritable(conference, account);
    if (!isWritable && !conference.getIsPublished().booleanValue()) {
      // no permissions
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "abstracts data found");
    }
    return conference.getAbstracts().stream().map(AbstractSimpleDto::of)
        .filter(d -> isWritable || d.getState().equals("Accepted")).toList();
  }

  @Transactional
  public RestSuccessResponseBody updateConference(AccountDetails user, String uuid,
      ConferenceUpdateForm form) {
    if (user == null) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, RESPONSE_MESSAGE_LOGIN_REQUIRED);
    }
    final Account currentUser = user.getAccount();
    final Conference conference = this.conferenceRepository.findFirstByUuid(uuid);
    if (conference == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, RESPONSE_MESSAGE_NO_CONFERENCE_DATA);
    }
    final boolean isAdmin = isAdmin(currentUser);
    final boolean isConferenceOwner = conference.isOwner(currentUser);
    final boolean isWritable = isAdmin || isConferenceOwner;
    if (!isWritable) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, RESPONSE_MESSAGE_NO_PRIVILEGES);
    }
    conference.setIsOpen(form.getIsOpen());
    conference.setIsPublished(form.getIsPublished());
    conference.setIsActive(form.getIsActive());
    conference.setName(form.getName());
    conference.setShortName(form.getShortName());
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
        final File bannerFile = new File(this.appProperties.getPathBanners(), banner.get().getUuid());
        if (!bannerFile.delete()) {
          System.err.println("Failed to delete banner file: " + banner.get().getUuid());
        }
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
        final File bannerFile = new File(this.appProperties.getPathBanners(), banner.get().getUuid());
        if (!bannerFile.delete()) {
          System.err.println("Failed to delete banner file: " + banner.get().getUuid());
        }
        conference.getBanners().remove(banner.get());
      }
    }
    if (form.getThumbnailFile() != null && !form.getThumbnailFile().isEmpty()) {
      final Banner banner = new Banner();
      banner.setType("thumbnail");
      banner.setConference(conference);
      conference.getBanners().add(banner);
    }
    this.conferenceRepository.save(conference);
    // register banner files
    if (form.getLogoFile() != null && !form.getLogoFile().isEmpty()) {
      final Optional<Banner> banner = conference.getLogoBanner();
      if (banner.isPresent()) {
        final File uploadFile = new File(this.appProperties.getPathBanners(), banner.get().getUuid());
        try {
          final byte[] bytes = form.getLogoFile().getBytes();
          try (BufferedOutputStream uploadFileStream = new BufferedOutputStream(new FileOutputStream(uploadFile))) {
            uploadFileStream.write(bytes);
          }
        } catch (Exception e) {
          e.printStackTrace();
        }
      }
    }
    if (form.getThumbnailFile() != null && !form.getThumbnailFile().isEmpty()) {
      final Optional<Banner> banner = conference.getThumbnailBanner();
      if (banner.isPresent()) {
        final File uploadFile = new File(this.appProperties.getPathBanners(), banner.get().getUuid());
        try {
          final byte[] bytes = form.getThumbnailFile().getBytes();
          try (BufferedOutputStream uploadFileStream = new BufferedOutputStream(new FileOutputStream(uploadFile))) {
            uploadFileStream.write(bytes);
          }
        } catch (Exception e) {
          e.printStackTrace();
        }
      }
    }
    return new RestSuccessResponseBody(RESPONSE_MESSAGE_SUCCESS);
  }

  @Transactional
  public RestSuccessResponseBody updateConferenceAbstractGroups(AccountDetails user, String uuid,
      ConferenceUpdateAbstractGroupsForm form) {
    if (user == null) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, RESPONSE_MESSAGE_LOGIN_REQUIRED);
    }
    final Account currentUser = user.getAccount();
    final Conference conference = this.conferenceRepository.findFirstByUuid(uuid);
    if (conference == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, RESPONSE_MESSAGE_NO_CONFERENCE_DATA);
    }
    final boolean isAdmin = isAdmin(currentUser);
    final boolean isConferenceOwner = conference.isOwner(currentUser);
    final boolean isWritable = isAdmin || isConferenceOwner;
    if (!isWritable) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, RESPONSE_MESSAGE_NO_PRIVILEGES);
    }
    conference.getAbstractGroups().stream()
        .filter(a -> form.getAbstractGroups().stream().noneMatch(f -> f.getUuid().equals(a.getUuid()))).forEach(a -> {
          System.out.println(a.getAbstractAbstractGroups().size());
          if (a.hasAbstracts()) {
            // deletion of groups in use is prohibited
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                "Some of the groups to be deleted are currently in use");
          }
        });
    conference.getAbstractGroups().clear();
    final List<AbstractGroup> abstractGroups = form.getAbstractGroups().stream().map(f -> {
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
      ConferenceUpdateGeoForm form) {
    if (user == null) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, RESPONSE_MESSAGE_LOGIN_REQUIRED);
    }
    final Account currentUser = user.getAccount();
    final Conference conference = this.conferenceRepository.findFirstByUuid(uuid);
    if (conference == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, RESPONSE_MESSAGE_NO_CONFERENCE_DATA);
    }
    final boolean isAdmin = isAdmin(currentUser);
    final boolean isConferenceOwner = conference.isOwner(currentUser);
    final boolean isWritable = isAdmin || isConferenceOwner;
    if (!isWritable) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, RESPONSE_MESSAGE_NO_PRIVILEGES);
    }
    final String geo = form.getGeo().trim();
    conference.setGeo(!geo.isEmpty() ? geo : null);
    this.conferenceRepository.save(conference);
    return new RestSuccessResponseBody(RESPONSE_MESSAGE_SUCCESS);
  }

  @Transactional
  public RestSuccessResponseBody updateConferenceSchedule(AccountDetails user, String uuid,
      ConferenceUpdateScheduleForm form) {
    if (user == null) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, RESPONSE_MESSAGE_LOGIN_REQUIRED);
    }
    final Account currentUser = user.getAccount();
    final Conference conference = this.conferenceRepository.findFirstByUuid(uuid);
    if (conference == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, RESPONSE_MESSAGE_NO_CONFERENCE_DATA);
    }
    final boolean isAdmin = isAdmin(currentUser);
    final boolean isConferenceOwner = conference.isOwner(currentUser);
    final boolean isWritable = isAdmin || isConferenceOwner;
    if (!isWritable) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, RESPONSE_MESSAGE_NO_PRIVILEGES);
    }
    final String schedule = form.getSchedule().trim();
    conference.setSchedule(!schedule.isEmpty() ? schedule : null);
    this.conferenceRepository.save(conference);
    return new RestSuccessResponseBody(RESPONSE_MESSAGE_SUCCESS);
  }

  @Transactional
  public RestSuccessResponseBody updateConferenceInfo(AccountDetails user, String uuid,
      ConferenceUpdateInfoForm form) {
    if (user == null) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, RESPONSE_MESSAGE_LOGIN_REQUIRED);
    }
    final Account currentUser = user.getAccount();
    final Conference conference = this.conferenceRepository.findFirstByUuid(uuid);
    if (conference == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, RESPONSE_MESSAGE_NO_CONFERENCE_DATA);
    }
    final boolean isAdmin = isAdmin(currentUser);
    final boolean isConferenceOwner = conference.isOwner(currentUser);
    final boolean isWritable = isAdmin || isConferenceOwner;
    if (!isWritable) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, RESPONSE_MESSAGE_NO_PRIVILEGES);
    }
    final String info = form.getInfo().trim();
    conference.setInfo(!info.isEmpty() ? info : null);
    return new RestSuccessResponseBody(RESPONSE_MESSAGE_SUCCESS);
  }

  @Transactional
  public RestSuccessResponseBody updateConferenceOwners(AccountDetails user, String uuid,
      ConferenceUpdateOwnersForm form) {
    if (user == null) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, RESPONSE_MESSAGE_LOGIN_REQUIRED);
    }
    final Account currentUser = user.getAccount();
    final Conference conference = this.conferenceRepository.findFirstByUuid(uuid);
    if (conference == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, RESPONSE_MESSAGE_NO_CONFERENCE_DATA);
    }
    final boolean isAdmin = isAdmin(currentUser);
    final boolean isConferenceOwner = conference.isOwner(currentUser);
    final boolean isWritable = isAdmin || isConferenceOwner;
    if (!isWritable) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, RESPONSE_MESSAGE_NO_PRIVILEGES);
    }
    final List<Account> accounts = this.accountRepository.findByMailIn(form.getOwners());
    if (accounts.size() != form.getOwners().size()) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Some users not found");
    }
    if (!isAdmin && accounts.stream().filter(a -> a.getMail().equals(currentUser.getMail())).findFirst()
        .orElse(null) == null) {
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

  private boolean isAdmin(Account account) {
    return account != null && this.appProperties.getAdmins().contains(account.getMail());
  }

  private boolean isWritable(Conference conference, Account account) {
    boolean isConferenceOwner = conference.isOwner(account);
    return isAdmin(account) || isConferenceOwner;
  }
}
