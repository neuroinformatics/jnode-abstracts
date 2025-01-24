package jp.neuroinf.abstracts.dto;

import java.time.LocalDateTime;
import java.util.List;

import jp.neuroinf.abstracts.entity.Abstract;
import jp.neuroinf.abstracts.entity.AbstractAbstractGroup;
import lombok.Data;

@Data
public class AbstractDto {

  private String uuid;
  private String title;
  private String text;
  private String doi;
  private String acknowledgements;
  private String conflictOfInterest;
  private Boolean isTalk;
  private String reasonForTalk;
  private Integer sortId;
  private String state;
  private String topic;
  private LocalDateTime ctime;
  private LocalDateTime mtime;
  private String conferenceUuid;
  private List<AuthorDto> authors;
  private List<AffiliationDto> affiliations;
  private List<FigureDto> figures;
  private List<ReferenceDto> references;
  private String abstractGroupUuid;
  private List<StateLogDto> stateLogs;
  private List<AccountSimpleDto> owners;

  public static AbstractDto of(Abstract entity) {
    AbstractDto dto = new AbstractDto();
    dto.setUuid(entity.getUuid());
    dto.setTitle(entity.getTitle());
    dto.setText(entity.getText());
    dto.setDoi(entity.getDoi());
    dto.setAcknowledgements(entity.getAcknowledgements());
    dto.setConflictOfInterest(entity.getConflictOfInterest());
    dto.setIsTalk(entity.getIsTalk());
    dto.setReasonForTalk(entity.getReasonForTalk());
    dto.setSortId(entity.getSortId());
    dto.setState(entity.getState());
    dto.setTopic(entity.getTopic());
    dto.setCtime(entity.getCtime());
    dto.setMtime(entity.getMtime());
    dto.setConferenceUuid(entity.getConference().getUuid());
    dto.setAuthors(entity.getAuthors().stream().map(AuthorDto::of).toList());
    dto.setAffiliations(entity.getAffiliations().stream().map(AffiliationDto::of).toList());
    dto.setFigures(entity.getFigures().stream().map(FigureDto::of).toList());
    dto.setReferences(entity.getReferences().stream().map(ReferenceDto::of).toList());
    AbstractAbstractGroup abstractAbstractGroup = entity.getAbstractAbstractGroup();
    if (abstractAbstractGroup != null) {
      dto.setAbstractGroupUuid(AbstractGroupDto.of(abstractAbstractGroup.getAbstractGroup()).getUuid());
    }
    dto.setStateLogs(entity.getStateLogs().stream().map(StateLogDto::of).toList());
    dto.setOwners(entity.getOwners().stream().map(AccountSimpleDto::of).toList());
    return dto;
  }

}
