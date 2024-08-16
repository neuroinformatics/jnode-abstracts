package jp.neuroinf.abstracts.dto;

import java.time.LocalDateTime;

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

}
