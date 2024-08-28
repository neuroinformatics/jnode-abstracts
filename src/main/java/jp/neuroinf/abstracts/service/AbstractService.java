package jp.neuroinf.abstracts.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import jp.neuroinf.abstracts.core.AppProperties;
import jp.neuroinf.abstracts.dto.AbstractDto;
import jp.neuroinf.abstracts.entity.Abstract;
import jp.neuroinf.abstracts.entity.Account;
import jp.neuroinf.abstracts.entity.Conference;
import jp.neuroinf.abstracts.repository.AbstractRepository;

@Service
public class AbstractService {

  private final AbstractRepository abstractRepository;
  private final AppProperties properties;

  @Autowired
  public AbstractService(AbstractRepository abstractRepository, AppProperties properties) {
    this.abstractRepository = abstractRepository;
    this.properties = properties;
  }

  @Transactional
  public AbstractDto getAbstract(Account account, String uuid) {
    Abstract entity = this.abstractRepository.findFirstByUuid(uuid);
    if (entity == null) {
      return null;
    }
    Conference conference = entity.getConference();
    boolean isAdmin = account != null ? this.properties.getAdmins().contains(account.getMail()) : false;
    boolean isConferenceOwner = conference.isOwner(account);
    boolean isOwner = entity.isOwner(account);
    boolean isReadable = isAdmin || isConferenceOwner || isOwner
        || conference.getIsPublished() && entity.getState().equals("Accepted");
    return isReadable ? AbstractDto.of(entity) : null;
  }

}
