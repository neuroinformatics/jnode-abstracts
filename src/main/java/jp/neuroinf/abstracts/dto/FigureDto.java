package jp.neuroinf.abstracts.dto;

import jp.neuroinf.abstracts.entity.Figure;
import lombok.Data;

@Data
public class FigureDto {

  private String uuid;
  private String caption;
  private Integer position;

  public static FigureDto of(Figure entity) {
    FigureDto dto = new FigureDto();
    dto.setUuid(entity.getUuid());
    dto.setCaption(entity.getCaption());
    dto.setPosition(entity.getPosition());
    return dto;
  }

}
