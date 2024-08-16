package jp.neuroinf.abstracts.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@IdClass(AbstractAbstractGroupId.class)
@Table(name = "abstract_abstract_group")
public class AbstractAbstractGroup {

  @Id
  @OneToOne
  @JoinColumn(name = "abstract_uuid", referencedColumnName = "uuid", nullable = false)
  private Abstract abstract_;

  @Id
  @ManyToOne
  @JoinColumn(name = "abstract_group_uuid", referencedColumnName = "uuid", nullable = false)
  private AbstractGroup abstractGroup;

}
