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
public class AbstractOwnersId implements Serializable {

  private Abstract abstract_;

  private Account owner;

}
