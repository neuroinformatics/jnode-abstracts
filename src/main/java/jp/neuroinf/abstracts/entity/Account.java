package jp.neuroinf.abstracts.entity;

import java.time.LocalDateTime;
import java.util.HashSet;
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
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@EntityListeners(AuditingEntityListener.class)
@Table(name = "account")
public class Account {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @Column(name = "uuid")
  private String uuid;

  @Column(name = "mail", nullable = false, unique = true)
  private String mail;

  @Column(name = "password", nullable = false)
  private String password;

  @Column(name = "first_name", nullable = false)
  private String firstName;

  @Column(name = "last_name", nullable = false)
  private String lastName;

  @Column(name = "is_active", nullable = false)
  private Boolean isActive;

  @Column(name = "ctime", nullable = false, updatable = false)
  @CreatedDate
  private LocalDateTime ctime;

  @Column(name = "mtime", nullable = false)
  @LastModifiedDate
  private LocalDateTime mtime;

  @OneToMany(cascade = CascadeType.ALL, mappedBy = "account", orphanRemoval = true)
  @OnDelete(action = OnDeleteAction.CASCADE)
  private Set<AccountFavorites> favorites = new HashSet<>();

}
