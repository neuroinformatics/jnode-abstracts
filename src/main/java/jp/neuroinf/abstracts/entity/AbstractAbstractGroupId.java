package jp.neuroinf.abstracts.entity;

import java.io.Serial;
import java.io.Serializable;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// composite primary key of AbstractAbstractGroup, holding the primary keys of the referenced entities
@Data
@AllArgsConstructor
@NoArgsConstructor
public class AbstractAbstractGroupId implements Serializable {

  @Serial
  private static final long serialVersionUID = 1L;

  // primary key (uuid) of Abstract
  private String abstract_;

  // primary key (uuid) of AbstractGroup
  private String abstractGroup;

}
