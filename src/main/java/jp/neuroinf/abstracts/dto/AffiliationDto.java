package jp.neuroinf.abstracts.dto;

import jp.neuroinf.abstracts.entity.Affiliation;
import lombok.Data;

@Data
public class AffiliationDto {

  private String uuid;
  private String address;
  private String section;
  private String department;
  private String country;
  private Integer position;

  public static AffiliationDto of(Affiliation entity) {
    AffiliationDto dto = new AffiliationDto();
    dto.setUuid(entity.getUuid());
    dto.setAddress(entity.getAddress());
    dto.setSection(entity.getSection());
    dto.setDepartment(entity.getDepartment());
    dto.setCountry(entity.getCountry());
    dto.setPosition(entity.getPosition());
    return dto;
  }

}
