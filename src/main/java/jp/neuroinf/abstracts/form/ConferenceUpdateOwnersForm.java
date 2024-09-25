package jp.neuroinf.abstracts.form;

import java.util.List;

import jakarta.validation.constraints.NotNull;
import lombok.Value;

@Value
public class ConferenceUpdateOwnersForm {

  @NotNull
  final List<String> owners;

}
