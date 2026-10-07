package jp.neuroinf.abstracts.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jp.neuroinf.abstracts.entity.Abstract;

@Repository
public interface AbstractRepository extends JpaRepository<Abstract, String> {

  Abstract findFirstByUuid(String uuid);

  @Query("SELECT a FROM Abstract a JOIN a.abstractOwners o JOIN a.conference c WHERE o.owner.uuid = :accountUuid"
      + " ORDER BY c.startDate DESC, a.ctime DESC")
  List<Abstract> findByOwner(@Param("accountUuid") String accountUuid);

}
