package jp.neuroinf.abstracts.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@IdClass(AuthorAffiliationsId.class)
@Table(name = "author_affiliations")
public class AuthorAffiliations {

  @Id
  @ManyToOne
  @JoinColumn(name = "author_uuid", referencedColumnName = "uuid", nullable = false)
  private Author author;

  @Id
  @ManyToOne
  @JoinColumn(name = "affiliation_uuid", referencedColumnName = "uuid", nullable = false)
  private Affiliation affiliation;

}
