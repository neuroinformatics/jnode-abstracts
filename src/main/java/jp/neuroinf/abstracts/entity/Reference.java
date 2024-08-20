package jp.neuroinf.abstracts.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "reference")
public class Reference {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @Column(name = "uuid")
  private String uuid;

  @Lob
  @Column(name = "text", length = 300)
  private String text;

  @Column(name = "doi")
  private String doi;

  @Column(name = "link")
  private String link;

  @Column(name = "position")
  private Integer position;

  @ManyToOne
  @JoinColumn(name = "abstract_uuid", referencedColumnName = "uuid", nullable = false)
  private Abstract abstract_;

}
