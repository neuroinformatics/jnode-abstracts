package jp.neuroinf.abstracts.dto;

import java.time.LocalDateTime;
import java.util.List;

import jp.neuroinf.abstracts.entity.Account;
import jp.neuroinf.abstracts.entity.Conference;
import lombok.Data;

@Data
public class ConferenceDto {

  private String uuid;
  private Boolean isOpen;
  private Boolean isPublished;
  private Boolean isActive;
  private String name;
  private String shortName;
  private String conferenceGroup;
  private String cite;
  private LocalDateTime startDate;
  private LocalDateTime endDate;
  private LocalDateTime deadline;
  private String logo;
  private String thumbnail;
  private String iosApp;
  private String link;
  private String description;
  private String notice;
  private Boolean hasPresentationPrefs;
  private Integer abstractMaxLength;
  private Integer abstractMaxFigures;
  private String geo;
  private String schedule;
  private String info;
  private LocalDateTime ctime;
  private LocalDateTime mtime;
  private List<TopicDto> topics;
  private List<AbstractGroupDto> abstractGroups;
  private List<BannerDto> banners;
  private Boolean isOwner;
  private List<AccountSimpleDto> owners;

  public static ConferenceDto of(Conference entity, Account account, boolean isManager) {
    ConferenceDto dto = new ConferenceDto();
    dto.setUuid(entity.getUuid());
    dto.setIsOpen(entity.getIsOpen());
    dto.setIsPublished(entity.getIsPublished());
    dto.setIsActive(entity.getIsActive());
    dto.setName(entity.getName());
    dto.setShortName(entity.getShortName());
    dto.setConferenceGroup(entity.getConferenceGroup());
    dto.setCite(entity.getCite());
    dto.setStartDate(entity.getStartDate());
    dto.setEndDate(entity.getEndDate());
    dto.setDeadline(entity.getDeadline());
    dto.setLogo(entity.getLogo());
    dto.setThumbnail(entity.getThumbnail());
    dto.setIosApp(entity.getIosApp());
    dto.setLink(entity.getLink());
    dto.setDescription(entity.getDescription());
    dto.setNotice(entity.getNotice());
    dto.setHasPresentationPrefs(entity.getHasPresentationPrefs());
    dto.setAbstractMaxLength(entity.getAbstractMaxLength());
    dto.setAbstractMaxFigures(entity.getAbstractMaxFigures());
    dto.setGeo(entity.getGeo());
    dto.setSchedule(entity.getSchedule());
    dto.setInfo(entity.getInfo());
    dto.setCtime(entity.getCtime());
    dto.setMtime(entity.getMtime());
    dto.setTopics(entity.getTopics().stream().map(TopicDto::of).toList());
    dto.setAbstractGroups(entity.getAbstractGroups().stream().map(AbstractGroupDto::of).toList());
    dto.setBanners(entity.getBanners().stream().map(BannerDto::of).toList());
    dto.setIsOwner(entity.isOwner(account));
    // managers include site admins who are not owners themselves
    if (isManager) {
      dto.setOwners(entity.getConferenceOwners().stream().map(AccountSimpleDto::of).toList());
    }
    return dto;
  }

}
