package jp.neuroinf.abstracts.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import jp.neuroinf.abstracts.entity.Topic;

@Repository
public interface TopicRepository extends JpaRepository<Topic, String> {
}
