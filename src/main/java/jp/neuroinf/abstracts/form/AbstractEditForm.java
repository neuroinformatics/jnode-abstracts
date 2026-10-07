package jp.neuroinf.abstracts.form;

import java.util.ArrayList;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Content of an abstract edited by its owners, sent as JSON. Positions follow the order of the lists, and authors
 * refer to their affiliations by index into the affiliation list.
 */
@Data
public class AbstractEditForm {

  @NotNull
  @Size(max = 255)
  private String title;

  @NotNull
  private String text;

  @Size(max = 255)
  private String topic;

  @Size(max = 500)
  private String acknowledgements;

  @Size(max = 255)
  private String conflictOfInterest;

  private Boolean isTalk;

  @Size(max = 255)
  private String reasonForTalk;

  private String abstractGroupUuid;

  @NotNull
  @Valid
  private List<AuthorForm> authors = new ArrayList<>();

  @NotNull
  @Valid
  private List<AffiliationForm> affiliations = new ArrayList<>();

  @NotNull
  @Valid
  private List<ReferenceForm> references = new ArrayList<>();

  @Data
  public static class AuthorForm {

    @Size(max = 255)
    private String firstName;

    @Size(max = 255)
    private String middleName;

    @Size(max = 255)
    private String lastName;

    @Size(max = 255)
    private String mail;

    @NotNull
    private List<@NotNull @Min(0) Integer> affiliations = new ArrayList<>();

  }

  @Data
  public static class AffiliationForm {

    @Size(max = 255)
    private String department;

    @Size(max = 255)
    private String section;

    @Size(max = 255)
    private String address;

    @Size(max = 255)
    private String country;

  }

  @Data
  public static class ReferenceForm {

    @Size(max = 300)
    private String text;

    @Size(max = 255)
    private String doi;

    @Size(max = 255)
    private String link;

  }

}
