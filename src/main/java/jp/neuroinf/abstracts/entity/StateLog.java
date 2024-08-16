package jp.neuroinf.abstracts.entity;

import java.time.LocalDateTime;

import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@EntityListeners(AuditingEntityListener.class)
@Table(name = "state_log")
public class StateLog {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @Column(name = "uuid")
  private String uuid;

  @Column(name = "editor")
  private String editor;

  @Column(name = "note")
  private String note;

  @Column(name = "state")
  private String state;

  @Column(name = "timestamp", nullable = false)
  @LastModifiedDate
  private LocalDateTime timestamp;

  @ManyToOne
  @JoinColumn(name = "abstract_uuid", referencedColumnName = "uuid", nullable = false)
  private Abstract abstract_;

}
