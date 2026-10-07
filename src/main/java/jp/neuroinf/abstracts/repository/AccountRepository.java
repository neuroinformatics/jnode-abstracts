package jp.neuroinf.abstracts.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jp.neuroinf.abstracts.entity.Account;

@Repository
public interface AccountRepository extends JpaRepository<Account, String> {

  Account findFirstByUuid(String uuid);

  Account findFirstByMail(String email);

  @Query("SELECT a FROM Account a WHERE LOWER(a.mail) IN :emails")
  List<Account> findByLowerCaseMailIn(@Param("emails") List<String> lowerCaseEmails);

}
