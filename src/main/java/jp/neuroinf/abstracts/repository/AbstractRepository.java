package jp.neuroinf.abstracts.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import jp.neuroinf.abstracts.entity.Abstract;

@Repository
public interface AbstractRepository extends JpaRepository<Abstract, String> {

  Abstract findFirstByUuid(String uuid);

}
