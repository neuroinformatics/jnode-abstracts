package jp.neuroinf.abstracts.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

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
import jakarta.persistence.Lob;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@EntityListeners(AuditingEntityListener.class)
@Table(name = "conference")
public class Conference {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @Column(name = "uuid")
  private String uuid;

  @Column(name = "is_open", nullable = false)
  private Boolean isOpen;

  @Column(name = "is_published", nullable = false)
  private Boolean isPublished;

  @Column(name = "is_active", nullable = false)
  private Boolean isActive;

  @Column(name = "name", nullable = false)
  private String name;

  @Column(name = "short", nullable = false, unique = true)
  private String shortName;

  @Column(name = "conference_group")
  private String conferenceGroup;

  @Column(name = "cite")
  private String cite;

  @Column(name = "start_date", nullable = false)
  private LocalDateTime startDate;

  @Column(name = "end_date", nullable = false)
  private LocalDateTime endDate;

  @Column(name = "deadline", nullable = false)
  private LocalDateTime deadline;

  @Column(name = "logo")
  private String logo;

  @Column(name = "thumbnail")
  private String thumbnail;

  @Column(name = "ios_app")
  private String iosApp;

  @Column(name = "link")
  private String link;

  @Lob
  @Column(name = "description", length = 500)
  private String description;

  @Lob
  @Column(name = "notice", length = 500)
  private String notice;

  @Column(name = "has_presentation_prefs", nullable = false)
  private Boolean hasPresentationPrefs;

  @Column(name = "abstract_max_length", nullable = false)
  private Integer abstractMaxLength;

  @Column(name = "abstract_max_figures", nullable = false)
  private Integer abstractMaxFigures;

  @Lob
  @Column(name = "geo", length = 10000)
  private String geo;

  @Lob
  @Column(name = "schedule", length = 100000)
  private String schedule;

  @Lob
  @Column(name = "info", length = 10000)
  private String info;

  @Column(name = "ctime", nullable = false, updatable = false)
  @CreatedDate
  private LocalDateTime ctime;

  @Column(name = "mtime", nullable = false)
  @LastModifiedDate
  private LocalDateTime mtime;

  @OneToMany(cascade = CascadeType.ALL, mappedBy = "conference", orphanRemoval = true)
  @OnDelete(action = OnDeleteAction.CASCADE)
  @OrderBy("position ASC")
  private List<Topic> topics = new ArrayList<>();

  @OneToMany(cascade = CascadeType.ALL, mappedBy = "conference", orphanRemoval = true)
  @OnDelete(action = OnDeleteAction.CASCADE)
  @OrderBy("prefix ASC")
  private List<AbstractGroup> abstractGroups = new ArrayList<>();

  @OneToMany(cascade = CascadeType.ALL, mappedBy = "conference", orphanRemoval = true)
  @OnDelete(action = OnDeleteAction.CASCADE)
  private List<Banner> banners = new ArrayList<>();

  @OneToMany(cascade = CascadeType.ALL, mappedBy = "conference", orphanRemoval = true)
  @OnDelete(action = OnDeleteAction.CASCADE)
  private List<ConferenceOwners> conferenceOwners = new ArrayList<>();

  @OneToMany(cascade = CascadeType.ALL, mappedBy = "conference", orphanRemoval = true)
  @OnDelete(action = OnDeleteAction.CASCADE)
  @OrderBy("sortId ASC")
  private List<Abstract> abstracts = new ArrayList<>();

  public List<Account> getOwners() {
    return getConferenceOwners().stream().map((o) -> o.getOwner()).collect(Collectors.toList());
  }

  public boolean isOwner(Account account) {
    if (account == null) {
      return false;
    }
    return getOwners().stream().filter(o -> o.getUuid().equals(account.getUuid())).findFirst().orElse(null) != null;
  }

  public Optional<Banner> getLogoBanner() {
    return getBanners().stream()
        .filter(item -> item.getType().compareTo("logo") == 0).findFirst();
  }

  public Optional<Banner> getThumbnailBanner() {
    return getBanners().stream()
        .filter(item -> item.getType().compareTo("thumbnail") == 0).findFirst();
  }
}
