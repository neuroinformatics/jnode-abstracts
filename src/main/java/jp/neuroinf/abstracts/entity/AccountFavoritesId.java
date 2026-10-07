package jp.neuroinf.abstracts.entity;

import java.io.Serial;
import java.io.Serializable;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// composite primary key of AccountFavorites, holding the primary keys of the referenced entities
@Data
@AllArgsConstructor
@NoArgsConstructor
public class AccountFavoritesId implements Serializable {

  @Serial
  private static final long serialVersionUID = 1L;

  // primary key (uuid) of Account
  private String account;

  // primary key (uuid) of Abstract
  private String abstract_;

}
