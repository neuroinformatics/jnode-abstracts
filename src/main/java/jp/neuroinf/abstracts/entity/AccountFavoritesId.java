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
public class AccountFavoritesId implements Serializable {

  private Account account;

  private Abstract abstract_;

}
