package jp.neuroinf.abstracts.form;

import java.util.List;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Value;

@Value
public class ConferenceUpdateGroupsForm {

  @NotNull
  final List<AbstractGroupForm> groups;

  @Value
  class AbstractGroupForm {

    final private String uuid;

    @NotNull
    final private String name;

    @NotNull
    @Min(0)
    final private Integer prefix;

    @NotNull
    final private String shortName;
  }
}
