package jp.neuroinf.abstracts.form;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Value;

@Value
public class AbstractUpdateStateForm {

  @NotNull
  private String state;

  @Size(max = 255)
  private String note;

}
