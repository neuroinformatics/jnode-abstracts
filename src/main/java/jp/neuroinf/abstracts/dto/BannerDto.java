package jp.neuroinf.abstracts.dto;

import jp.neuroinf.abstracts.entity.Banner;
import lombok.Data;

@Data
public class BannerDto {

  private String uuid;
  private String type;

  public static BannerDto of(Banner entity) {
    BannerDto dto = new BannerDto();
    dto.setUuid(entity.getUuid());
    dto.setType(entity.getType());
    return dto;
  }

}
