package jp.neuroinf.abstracts.dto;

import java.util.List;
import java.util.stream.Collectors;

import jp.neuroinf.abstracts.entity.Abstract;
import lombok.Data;

@Data
public class AbstractSimpleDto {

  private String uuid;
  private String title;
  private Integer sortId;
  private String state;
  private String conferenceUuid;
  private List<AuthorDto> authors;
  private AbstractGroupDto abstractGroup;
  private List<AccountSimpleDto> owners;

  public static AbstractSimpleDto of(Abstract entity) {
    AbstractSimpleDto dto = new AbstractSimpleDto();
    dto.setUuid(entity.getUuid());
    dto.setTitle(entity.getTitle());
    dto.setSortId(entity.getSortId());
    dto.setState(entity.getState());
    dto.setConferenceUuid(entity.getConference().getUuid());
    dto.setAuthors(entity.getAuthors().stream().map(AuthorDto::of)
        .sorted((d1, d2) -> d1.getPosition() - d2.getPosition())
        .collect(Collectors.toList()));
    dto.setAbstractGroup(AbstractGroupDto.of(entity.getAbstractAbstractGroup().getAbstractGroup()));
    dto.setOwners(entity.getOwners().stream().map(AccountSimpleDto::of).collect(Collectors.toList()));
    return dto;
  }

}
