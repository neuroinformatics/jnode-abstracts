package jp.neuroinf.abstracts.form;

import jakarta.validation.constraints.NotNull;
import lombok.Value;

@Value
public class ConferenceUpdateGeoForm {

  @NotNull
  final String geo;

}
