package jp.neuroinf.abstracts.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

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
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

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
  @OrderBy("position ASC")
  private List<Author> authors = new ArrayList<>();

  @OneToMany(cascade = CascadeType.ALL, mappedBy = "abstract_", orphanRemoval = true)
  @OnDelete(action = OnDeleteAction.CASCADE)
  @OrderBy("position ASC")
  private List<Affiliation> affiliations = new ArrayList<>();

  @OneToMany(cascade = CascadeType.ALL, mappedBy = "abstract_", orphanRemoval = true)
  @OnDelete(action = OnDeleteAction.CASCADE)
  @OrderBy("position ASC")
  private List<Figure> figures = new ArrayList<>();

  @OneToMany(cascade = CascadeType.ALL, mappedBy = "abstract_", orphanRemoval = true)
  @OnDelete(action = OnDeleteAction.CASCADE)
  @OrderBy("position ASC")
  private List<Reference> references = new ArrayList<>();

  @OneToOne(cascade = CascadeType.ALL, mappedBy = "abstract_", orphanRemoval = true)
  @OnDelete(action = OnDeleteAction.CASCADE)
  @EqualsAndHashCode.Exclude
  private AbstractAbstractGroup abstractAbstractGroup;

  @OneToMany(cascade = CascadeType.ALL, mappedBy = "abstract_", orphanRemoval = true)
  @OnDelete(action = OnDeleteAction.CASCADE)
  @OrderBy("timestamp DESC")
  private List<StateLog> stateLogs = new ArrayList<>();

  @OneToMany(cascade = CascadeType.ALL, mappedBy = "abstract_", orphanRemoval = true)
  @OnDelete(action = OnDeleteAction.CASCADE)
  private List<AbstractOwners> abstractOwners = new ArrayList<>();

  // mapped here too so that deleting an abstract also removes the favorites rows referring to it
  @OneToMany(cascade = CascadeType.ALL, mappedBy = "abstract_", orphanRemoval = true)
  @EqualsAndHashCode.Exclude
  private List<AccountFavorites> favorites = new ArrayList<>();

  public List<Account> getOwners() {
    return getAbstractOwners().stream().map(o -> o.getOwner()).toList();
  }

  public boolean isOwner(Account account) {
    if (account == null) {
      return false;
    }
    return getOwners().stream().anyMatch(o -> o.getUuid().equals(account.getUuid()));
  }

}
