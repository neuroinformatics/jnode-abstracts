package jp.neuroinf.abstracts.form;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Value;

/**
 * Fields of an abstract set by conference managers: the presentation group, the number within it and the DOI.
 */
@Value
public class AbstractUpdatePublicationForm {

  private String abstractGroupUuid;

  @NotNull
  @Min(0)
  @Max(0xffff)
  private Integer number;

  private String doi;

}
