package jp.neuroinf.abstracts.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jp.neuroinf.abstracts.entity.Conference;

@Repository
public interface ConferenceRepository extends JpaRepository<Conference, String> {

  @Query("SELECT t FROM Conference t WHERE t.shortName = :shortName")
  List<Conference> getConferencesByShortName(@Param("shortName") String shortName);

  @Query("SELECT t FROM Conference t ORDER BY t.startDate DESC, t.endDate DESC")
  List<Conference> getConferences();

  Conference findFirstByUuid(String uuid);

}
