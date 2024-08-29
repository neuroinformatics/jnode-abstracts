package jp.neuroinf.abstracts.dto;

import java.util.List;
import java.util.stream.Collectors;

import jp.neuroinf.abstracts.entity.Abstract;
import jp.neuroinf.abstracts.entity.AbstractAbstractGroup;
import lombok.Data;

@Data
public class AbstractSimpleDto {

  private String uuid;
  private String title;
  private String text;
  private Integer sortId;
  private String state;
  private String conferenceUuid;
  private List<AuthorDto> authors;
  private List<AffiliationDto> affiliations;
  private String abstractGroupUuid;

  public static AbstractSimpleDto of(Abstract entity) {
    AbstractSimpleDto dto = new AbstractSimpleDto();
    dto.setUuid(entity.getUuid());
    dto.setTitle(entity.getTitle());
    dto.setText(entity.getText());
    dto.setSortId(entity.getSortId());
    dto.setState(entity.getState());
    dto.setConferenceUuid(entity.getConference().getUuid());
    dto.setAuthors(entity.getAuthors().stream().map(AuthorDto::of)
        .collect(Collectors.toList()));
    dto.setAffiliations(entity.getAffiliations().stream().map(AffiliationDto::of)
        .collect(Collectors.toList()));
    AbstractAbstractGroup abstractAbstractGroup = entity.getAbstractAbstractGroup();
    if (abstractAbstractGroup != null) {
      dto.setAbstractGroupUuid(AbstractGroupDto.of(abstractAbstractGroup.getAbstractGroup()).getUuid());
    }
    return dto;
  }

}
