package jp.neuroinf.abstracts.dto;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import jp.neuroinf.abstracts.entity.Conference;
import jp.neuroinf.abstracts.entity.ConferenceOwners;
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
  private List<TopicDto> topics = new ArrayList<>();
  private List<AbstractGroupDto> abstractGroups = new ArrayList<>();
  private Set<BannerDto> banners = new HashSet<>();
  private Set<AccountDto> owners = new HashSet<>();

  public static ConferenceDto of(Conference entity) {
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
    dto.setTopics(entity.getTopics().stream().map(TopicDto::of)
        .sorted((d1, d2) -> d1.getPosition() - d2.getPosition())
        .collect(Collectors.toList()));
    dto.setAbstractGroups(entity.getAbstractGroups().stream().map(AbstractGroupDto::of)
        .sorted((d1, d2) -> d1.getPrefix() - d2.getPrefix())
        .collect(Collectors.toList()));
    dto.setBanners(entity.getBanners().stream().map(BannerDto::of)
        .collect(Collectors.toSet()));
    Set<ConferenceOwners> owners = entity.getConferenceOwners();
    for (ConferenceOwners o : owners) {
      System.out.println(o.getOwner());
    }
    // System.out.println(owners.size());
    // dto.setOwners(entity.getConferenceOwners().stream().map(AccountDto::of)
    // .collect(Collectors.toSet()));
    return dto;
  }

}
