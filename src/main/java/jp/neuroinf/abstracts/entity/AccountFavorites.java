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
@IdClass(AccountFavoritesId.class)
@Table(name = "account_favorites")
public class AccountFavorites {

  @Id
  @ManyToOne
  @JoinColumn(name = "account_uuid", referencedColumnName = "uuid", nullable = false)
  private Account account;

  @Id
  @ManyToOne
  @JoinColumn(name = "abstract_uuid", referencedColumnName = "uuid", nullable = false)
  private Abstract abstract_;

}
