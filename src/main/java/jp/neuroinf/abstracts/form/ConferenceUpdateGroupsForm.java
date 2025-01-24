package jp.neuroinf.abstracts.form;

import java.util.List;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Value;

@Value
public class ConferenceUpdateGroupsForm {

  @NotNull
  private List<AbstractGroupForm> groups;

  @Value
  class AbstractGroupForm {

    private String uuid;

    @NotNull
    private String name;

    @NotNull
    @Min(0)
    private Integer prefix;

    @NotNull
    private String shortName;
  }

}
