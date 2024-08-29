package jp.neuroinf.abstracts.dto;

import jp.neuroinf.abstracts.entity.Reference;
import lombok.Data;

@Data
public class ReferenceDto {

  private String uuid;
  private String text;
  private String doi;
  private String link;
  private Integer position;

  public static ReferenceDto of(Reference entity) {
    ReferenceDto dto = new ReferenceDto();
    dto.setUuid(entity.getUuid());
    dto.setText(entity.getText());
    dto.setDoi(entity.getDoi());
    dto.setLink(entity.getLink());
    dto.setPosition(entity.getPosition());
    return dto;
  }

}
