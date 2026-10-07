package jp.neuroinf.abstracts.form;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Value;

@Value
public class UsersCreateForm {

  @NotBlank
  @Email
  private String email;

  @NotBlank
  private String firstName;

  @NotBlank
  private String lastName;

}
