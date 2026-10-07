package jp.neuroinf.abstracts.form;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Value;

@Value
public class ConferenceUpdateAbstractGroupsForm {

  @Valid
  private List<AbstractGroupForm> abstractGroups;

  @Value
  public class AbstractGroupForm {

    private String uuid;

    @NotNull
    private String name;

    // stored in the upper 16 bits of the sort ids, which must stay positive
    @NotNull
    @Min(0)
    @Max(0x7fff)
    private Integer prefix;

    @NotNull
    private String shortName;

  }

}
