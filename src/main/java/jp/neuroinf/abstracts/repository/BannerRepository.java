package jp.neuroinf.abstracts.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import jp.neuroinf.abstracts.entity.Banner;

@Repository
public interface BannerRepository extends JpaRepository<Banner, String> {

  Banner findFirstByUuid(String uuid);

}
