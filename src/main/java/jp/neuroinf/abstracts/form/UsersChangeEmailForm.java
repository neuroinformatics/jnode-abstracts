package jp.neuroinf.abstracts.form;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import lombok.Value;

@Value
public class UsersChangeEmailForm {

  @NotNull
  @Email
  private String email;

  @NotNull
  private String password;

}
