package jp.neuroinf.abstracts.service;

import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

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
import jp.neuroinf.abstracts.entity.Banner;
import jp.neuroinf.abstracts.entity.Conference;
import jp.neuroinf.abstracts.entity.ConferenceOwners;
import jp.neuroinf.abstracts.entity.Topic;
import jp.neuroinf.abstracts.form.ConferenceUpdateForm;
import jp.neuroinf.abstracts.form.ConferenceUpdateGeoForm;
import jp.neuroinf.abstracts.form.ConferenceUpdateInfoForm;
import jp.neuroinf.abstracts.form.ConferenceUpdateOwnersForm;
import jp.neuroinf.abstracts.form.ConferenceUpdateScheduleForm;
import jp.neuroinf.abstracts.repository.AccountRepository;
import jp.neuroinf.abstracts.repository.ConferenceRepository;

@Service
public class ConferenceService {

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
    List<ConferenceSimpleDto> dtoList = conferences.stream().map(c -> ConferenceSimpleDto.of(c, account))
        .collect(Collectors.toList());
    return dtoList;
  }

  @Transactional
  public ConferenceDto getConference(AccountDetails user, String uuid) {
    Account account = user != null ? user.getAccount() : null;
    Conference conference = this.conferenceRepository.findFirstByUuid(uuid);
    if (conference == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "no conference data found");
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
    if (!isWritable && !conference.getIsPublished()) {
      // no permissions
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "abstracts data found");
    }
    return conference.getAbstracts().stream().map(AbstractSimpleDto::of)
        .filter((d) -> isWritable || d.getState().equals("Accepted"))
        .collect(Collectors.toList());
  }

  @Transactional
  public RestSuccessResponseBody updateConference(AccountDetails user, String uuid,
      ConferenceUpdateForm form) {
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
    final List<Topic> topics = form.getTopics().stream().map((topic) -> {
      final Topic ret = new Topic();
      ret.setUuid(topic.getUuid());
      ret.setPosition(topic.getPosition());
      ret.setTopic(topic.getTopic());
      ret.setConference(conference);
      return ret;
    }).toList();
    conference.getTopics().addAll(topics);
    // banners
    if (form.getLogoUuid() == null) {
      final Optional<Banner> banner = conference.getLogoBanner();
      if (banner.isPresent()) {
        final File bannerFile = new File(this.appProperties.getPathBanners() + "/" + banner.get().getUuid());
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
        final File bannerFile = new File(this.appProperties.getPathBanners() + "/" + banner.get().getUuid());
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
        final File uploadFile = new File(this.appProperties.getPathBanners() + "/" + banner.get().getUuid());
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
        final File uploadFile = new File(this.appProperties.getPathBanners() + "/" + banner.get().getUuid());
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
    return new RestSuccessResponseBody("success");
  }

  @Transactional
  public RestSuccessResponseBody updateConferenceGeo(AccountDetails user, String uuid,
      ConferenceUpdateGeoForm form) {
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
    final String geo = form.getGeo().trim();
    conference.setGeo(geo.length() != 0 ? geo : null);
    this.conferenceRepository.save(conference);
    return new RestSuccessResponseBody("success");
  }

  @Transactional
  public RestSuccessResponseBody updateConferenceSchedule(AccountDetails user, String uuid,
      ConferenceUpdateScheduleForm form) {
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
    final String schedule = form.getSchedule().trim();
    conference.setSchedule(schedule.length() != 0 ? schedule : null);
    this.conferenceRepository.save(conference);
    return new RestSuccessResponseBody("success");
  }

  @Transactional
  public RestSuccessResponseBody updateConferenceInfo(AccountDetails user, String uuid,
      ConferenceUpdateInfoForm form) {
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
    final String info = form.getInfo().trim();
    conference.setInfo(info.length() != 0 ? info : null);
    return new RestSuccessResponseBody("success");
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
