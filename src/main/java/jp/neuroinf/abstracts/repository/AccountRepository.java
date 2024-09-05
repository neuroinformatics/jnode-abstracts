package jp.neuroinf.abstracts.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import jp.neuroinf.abstracts.entity.Account;

@Repository
public interface AccountRepository extends JpaRepository<Account, String> {

  Account findFistByUuid(String uuid);

  Account findFistByMail(String email);

}
