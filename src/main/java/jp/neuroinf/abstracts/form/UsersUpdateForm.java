package jp.neuroinf.abstracts.form;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Value;

@Value
public class UsersUpdateForm {

  @NotBlank
  private String firstName;

  @NotBlank
  private String lastName;

  @NotNull
  private Boolean isActive;

}
