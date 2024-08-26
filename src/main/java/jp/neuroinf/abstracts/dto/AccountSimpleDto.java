package jp.neuroinf.abstracts.dto;

import jp.neuroinf.abstracts.entity.Account;
import jp.neuroinf.abstracts.entity.ConferenceOwners;
import lombok.Data;

@Data
public class AccountSimpleDto {

  private String uuid;
  private String mail;

  public static AccountSimpleDto of(Account entity) {
    AccountSimpleDto dto = new AccountSimpleDto();
    dto.setUuid(entity.getUuid());
    dto.setMail(entity.getMail());
    return dto;
  }

  public static AccountSimpleDto of(ConferenceOwners owner) {
    return of(owner.getOwner());
  }

}
