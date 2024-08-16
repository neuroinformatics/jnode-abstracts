package jp.neuroinf.abstracts.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@IdClass(ConferenceOwnersId.class)
@Table(name = "conference_owners")
public class ConferenceOwners {

  @Id
  @ManyToOne
  @JoinColumn(name = "conference_uuid", referencedColumnName = "uuid", nullable = false)
  private Conference conference;

  @Id
  @ManyToOne
  @JoinColumn(name = "owner_uuid", referencedColumnName = "uuid", nullable = false)
  private Account owner;

}
