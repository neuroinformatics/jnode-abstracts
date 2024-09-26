package jp.neuroinf.abstracts.form;

import jakarta.validation.constraints.NotNull;
import lombok.Value;

@Value
public class ConferenceUpdateInfoForm {

  @NotNull
  final String info;

}
