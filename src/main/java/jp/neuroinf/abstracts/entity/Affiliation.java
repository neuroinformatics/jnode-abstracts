package jp.neuroinf.abstracts.entity;

import java.util.HashSet;
import java.util.Set;

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
@Table(name = "affiliation")
public class Affiliation {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @Column(name = "uuid")
  private String uuid;

  @Column(name = "address")
  private String address;

  @Column(name = "section")
  private String section;

  @Column(name = "department")
  private String department;

  @Column(name = "country")
  private String country;

  @Column(name = "position")
  private Integer position;

  @ManyToOne
  @JoinColumn(name = "abstract_uuid", referencedColumnName = "uuid", nullable = false)
  private Abstract abstract_;

  @OneToMany(cascade = CascadeType.ALL, mappedBy = "affiliation", orphanRemoval = true)
  @OnDelete(action = OnDeleteAction.CASCADE)
  private Set<AuthorAffiliations> authors = new HashSet<>();

}
