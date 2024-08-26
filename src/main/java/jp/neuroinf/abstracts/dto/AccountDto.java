package jp.neuroinf.abstracts.dto;

import java.time.LocalDateTime;

import jp.neuroinf.abstracts.entity.Account;
import lombok.Data;

@Data
public class AccountDto {

  private String uuid;
  private String mail;
  private String password;
  private String firstName;
  private String lastName;
  private Boolean isActive;
  private LocalDateTime ctime;
  private LocalDateTime mtime;

  public String getFullName() {
    return firstName + ' ' + lastName;
  }

  public static AccountDto of(Account entity) {
    AccountDto dto = new AccountDto();
    dto.setUuid(entity.getUuid());
    dto.setMail(entity.getMail());
    dto.setFirstName(entity.getFirstName());
    dto.setLastName(entity.getLastName());
    dto.setIsActive(entity.getIsActive());
    dto.setCtime(entity.getCtime());
    dto.setMtime(entity.getMtime());
    return dto;
  }

}
