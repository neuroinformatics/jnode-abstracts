package jp.neuroinf.abstracts.dto;

import jp.neuroinf.abstracts.entity.AbstractGroup;
import lombok.Data;

@Data
public class AbstractGroupDto {

  private String uuid;
  private String name;
  private Integer prefix;
  private String shortName;

  public static AbstractGroupDto of(AbstractGroup entity) {
    AbstractGroupDto dto = new AbstractGroupDto();
    dto.setUuid(entity.getUuid());
    dto.setName(entity.getName());
    dto.setPrefix(entity.getPrefix());
    dto.setShortName(entity.getShortName());
    return dto;
  }

}
