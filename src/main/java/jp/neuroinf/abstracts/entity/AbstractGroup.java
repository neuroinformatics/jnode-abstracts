package jp.neuroinf.abstracts.entity;

import java.util.ArrayList;
import java.util.List;

import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
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

  @Column(name = "prefix", nullable = false)
  private Integer prefix;

  @Column(name = "name", nullable = false)
  private String name;

  @Column(name = "short", nullable = false)
  private String shortName;

  @ManyToOne
  @JoinColumn(name = "conference_uuid", referencedColumnName = "uuid", nullable = false)
  private Conference conference;

  @OneToMany(cascade = CascadeType.ALL, mappedBy = "abstractGroup", orphanRemoval = true)
  @OnDelete(action = OnDeleteAction.CASCADE)
  private List<AbstractAbstractGroup> abstractAbstractGroups = new ArrayList<>();

  public boolean hasAbstracts() {
    return !getAbstractAbstractGroups().isEmpty();
  }

}
