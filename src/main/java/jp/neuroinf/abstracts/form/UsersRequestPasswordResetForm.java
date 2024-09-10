package jp.neuroinf.abstracts.form;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import lombok.Value;

@Value
public class UsersRequestPasswordResetForm {

  @NotNull
  @Email
  final String email;

}
