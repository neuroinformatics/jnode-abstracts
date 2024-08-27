package jp.neuroinf.abstracts.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import jp.neuroinf.abstracts.entity.Account;
import jp.neuroinf.abstracts.entity.Conference;
import lombok.Data;

@Data
public class ConferenceSimpleDto {

  private String uuid;
  private Boolean isOpen;
  private Boolean isPublished;
  private Boolean isActive;
  private String name;
  private String shortName;
  private LocalDateTime startDate;
  private LocalDateTime endDate;
  private LocalDateTime deadline;
  private String logo;
  private String thumbnail;
  private String link;
  private String description;
  private List<BannerDto> banners;
  private Boolean isOwner;

  public static ConferenceSimpleDto of(Conference entity, Account account) {
    ConferenceSimpleDto dto = new ConferenceSimpleDto();
    dto.setUuid(entity.getUuid());
    dto.setIsOpen(entity.getIsOpen());
    dto.setIsPublished(entity.getIsPublished());
    dto.setIsActive(entity.getIsActive());
    dto.setName(entity.getName());
    dto.setShortName(entity.getShortName());
    dto.setStartDate(entity.getStartDate());
    dto.setEndDate(entity.getEndDate());
    dto.setDeadline(entity.getDeadline());
    dto.setLogo(entity.getLogo());
    dto.setThumbnail(entity.getThumbnail());
    dto.setLink(entity.getLink());
    dto.setDescription(entity.getDescription());
    dto.setBanners(entity.getBanners().stream().map(BannerDto::of)
        .collect(Collectors.toList()));
    dto.setIsOwner(entity.isOwner(account));
    return dto;
  }

}
