package jp.neuroinf.abstracts.entity;

import java.io.Serial;
import java.io.Serializable;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// composite primary key of AuthorAffiliations, holding the primary keys of the referenced entities
@Data
@AllArgsConstructor
@NoArgsConstructor
public class AuthorAffiliationsId implements Serializable {

  @Serial
  private static final long serialVersionUID = 1L;

  // primary key (uuid) of Author
  private String author;

  // primary key (uuid) of Affiliation
  private String affiliation;

}
