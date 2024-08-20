package jp.neuroinf.abstracts.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@EntityListeners(AuditingEntityListener.class)
@Table(name = "abstract")
public class Abstract {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @Column(name = "uuid")
  private String uuid;

  @Column(name = "title")
  private String title;

  @Lob
  @Column(name = "text", length = 250000)
  private String text;

  @Column(name = "doi")
  private String doi;

  @Lob
  @Column(name = "acknowledgements", length = 500)
  private String acknowledgements;

  @Column(name = "conflict_of_interest")
  private String conflictOfInterest;

  @Column(name = "is_talk", nullable = false)
  private Boolean isTalk = false;

  @Column(name = "reason_for_talk")
  private String reasonForTalk;

  @Column(name = "sort_id")
  private Integer sortId;

  @Column(name = "state")
  private String state;

  @Column(name = "topic")
  private String topic;

  @Column(name = "ctime", nullable = false, updatable = false)
  @CreatedDate
  private LocalDateTime ctime;

  @Column(name = "mtime", nullable = false)
  @LastModifiedDate
  private LocalDateTime mtime;

  @ManyToOne
  @JoinColumn(name = "conference_uuid", referencedColumnName = "uuid", nullable = false)
  private Conference conference;

  @OneToMany(cascade = CascadeType.ALL, mappedBy = "abstract_", orphanRemoval = true)
  @OnDelete(action = OnDeleteAction.CASCADE)
  private List<Author> authors = new ArrayList<>();

  @OneToMany(cascade = CascadeType.ALL, mappedBy = "abstract_", orphanRemoval = true)
  @OnDelete(action = OnDeleteAction.CASCADE)
  private List<Affiliation> affiliations = new ArrayList<>();

  @OneToMany(cascade = CascadeType.ALL, mappedBy = "abstract_", orphanRemoval = true)
  @OnDelete(action = OnDeleteAction.CASCADE)
  private List<Figure> figures = new ArrayList<>();

  @OneToMany(cascade = CascadeType.ALL, mappedBy = "abstract_", orphanRemoval = true)
  @OnDelete(action = OnDeleteAction.CASCADE)
  private List<Reference> references = new ArrayList<>();

  @OneToOne(cascade = CascadeType.ALL, mappedBy = "abstract_", orphanRemoval = true)
  @OnDelete(action = OnDeleteAction.CASCADE)
  private AbstractAbstractGroup abstractAbstractGroup;

  @OneToMany(cascade = CascadeType.ALL, mappedBy = "abstract_", orphanRemoval = true)
  @OnDelete(action = OnDeleteAction.CASCADE)
  private List<StateLog> stateLogs = new ArrayList<>();

  @OneToMany(cascade = CascadeType.ALL, mappedBy = "abstract_", orphanRemoval = true)
  @OnDelete(action = OnDeleteAction.CASCADE)
  private Set<AbstractOwners> owners = new HashSet<>();

}
