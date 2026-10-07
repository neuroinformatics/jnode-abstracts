package jp.neuroinf.abstracts.form;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Value;

@Value
public class FigureUpdateForm {

  @NotNull
  @Size(max = 300)
  private String caption;

}
