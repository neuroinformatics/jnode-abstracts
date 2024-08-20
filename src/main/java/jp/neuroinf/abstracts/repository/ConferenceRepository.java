package jp.neuroinf.abstracts.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import jp.neuroinf.abstracts.entity.Conference;

@Repository
public interface ConferenceRepository extends JpaRepository<Conference, String> {
}
