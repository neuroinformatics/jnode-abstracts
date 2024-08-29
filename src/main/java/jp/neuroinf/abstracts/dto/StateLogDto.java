package jp.neuroinf.abstracts.dto;

import java.time.LocalDateTime;

import jp.neuroinf.abstracts.entity.StateLog;
import lombok.Data;

@Data
public class StateLogDto {

  private String uuid;
  private String editor;
  private String note;
  private String state;
  private LocalDateTime timestamp;

  public static StateLogDto of(StateLog entity) {
    StateLogDto dto = new StateLogDto();
    dto.setUuid(entity.getUuid());
    dto.setEditor(entity.getEditor());
    dto.setNote(entity.getNote());
    dto.setState(entity.getState());
    dto.setTimestamp(entity.getTimestamp());
    return dto;
  }

}
