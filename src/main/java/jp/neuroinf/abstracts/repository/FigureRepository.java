package jp.neuroinf.abstracts.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import jp.neuroinf.abstracts.entity.Figure;

@Repository
public interface FigureRepository extends JpaRepository<Figure, String> {

  Figure findFirstByUuid(String uuid);

}
