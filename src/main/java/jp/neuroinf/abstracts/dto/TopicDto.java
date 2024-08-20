package jp.neuroinf.abstracts.dto;

import jp.neuroinf.abstracts.entity.Topic;
import lombok.Data;

@Data
public class TopicDto {

  private String uuid;
  private Integer position;
  private String topic;

  public static TopicDto of(Topic entity) {
    TopicDto dto = new TopicDto();
    dto.setUuid(entity.getUuid());
    dto.setPosition(entity.getPosition());
    dto.setTopic(entity.getTopic());
    return dto;
  }

}
