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
@IdClass(AbstractOwnersId.class)
@Table(name = "abstract_owners")
public class AbstractOwners {

  @Id
  @ManyToOne
  @JoinColumn(name = "abstract_uuid", referencedColumnName = "uuid", nullable = false)
  private Abstract abstract_;

  @Id
  @ManyToOne
  @JoinColumn(name = "owner_uuid", referencedColumnName = "uuid", nullable = false)
  private Account owner;

}
