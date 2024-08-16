package jp.neuroinf.abstracts.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "abstract_group")
public class AbstractGroup {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @Column(name = "uuid")
  private String uuid;

  @Column(name = "name", nullable = false)
  private String name;

  @Column(name = "prefix", nullable = false)
  private Integer prefix;

  @Column(name = "short", nullable = false)
  private String shortName;

  @ManyToOne
  @JoinColumn(name = "conference_uuid", referencedColumnName = "uuid", nullable = false)
  private Conference conference;

}
