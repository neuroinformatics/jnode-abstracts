package jp.neuroinf.abstracts.form;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Value;

@Value
public class UsersChangePasswordForm {

  @NotNull
  private String oldPassword;

  @NotNull
  @Size(min = 10, max = 512)
  private String newPassword;

}
