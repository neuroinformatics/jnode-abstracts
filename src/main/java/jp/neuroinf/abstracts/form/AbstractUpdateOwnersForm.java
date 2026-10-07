package jp.neuroinf.abstracts.form;

import java.util.List;

import jakarta.validation.constraints.NotEmpty;
import lombok.Value;

@Value
public class AbstractUpdateOwnersForm {

  @NotEmpty
  private List<String> owners;

}
