package jp.neuroinf.abstracts.entity;

import java.io.Serializable;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Embeddable
public class AuthorAffiliationsId implements Serializable {

  private Author author;

  private Affiliation affiliation;

}
