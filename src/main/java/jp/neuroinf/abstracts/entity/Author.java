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
@Table(name = "author")
public class Author {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @Column(name = "uuid")
  private String uuid;

  @Column(name = "first_name")
  private String firstName;

  @Column(name = "middle_name")
  private String middleName;

  @Column(name = "last_name")
  private String lastName;

  @Column(name = "mail")
  private String mail;

  @Column(name = "position")
  private Integer position;

  @ManyToOne
  @JoinColumn(name = "abstract_uuid", referencedColumnName = "uuid", nullable = false)
  private Abstract abstract_;

  @OneToMany(cascade = CascadeType.ALL, mappedBy = "author", orphanRemoval = true)
  @OnDelete(action = OnDeleteAction.CASCADE)
  private List<AuthorAffiliations> affiliations = new ArrayList<>();

}
