package jp.neuroinf.abstracts.dto;

import java.util.List;
import java.util.stream.Collectors;

import jp.neuroinf.abstracts.entity.Author;
import lombok.Data;

@Data
public class AuthorDto {

  private String uuid;
  private String firstName;
  private String middleName;
  private String lastName;
  private String mail;
  private Integer position;
  private List<String> affiliationUuids;

  public static AuthorDto of(Author entity) {
    AuthorDto dto = new AuthorDto();
    dto.setUuid(entity.getUuid());
    dto.setFirstName(entity.getFirstName());
    dto.setMiddleName(entity.getMiddleName());
    dto.setLastName(entity.getLastName());
    dto.setMail(entity.getMail());
    dto.setPosition(entity.getPosition());
    dto.setAffiliationUuids(
        entity.getAuthorAffiliations().stream().map((a) -> a.getAffiliation().getUuid()).collect(Collectors.toList()));
    return dto;
  }

}
