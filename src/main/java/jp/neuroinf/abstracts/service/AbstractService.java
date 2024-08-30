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
  public boolean isReadable(Account account, Abstract abstract_) {
    Conference conference = abstract_.getConference();
    boolean isAdmin = account != null ? this.properties.getAdmins().contains(account.getMail()) : false;
    boolean isConferenceOwner = conference.isOwner(account);
    boolean isOwner = abstract_.isOwner(account);
    boolean isReadable = isAdmin || isConferenceOwner || isOwner
        || conference.getIsPublished() && abstract_.getState().equals("Accepted");
    return isReadable;
  }

  @Transactional
  public AbstractDto getAbstract(Account account, String uuid) {
    Abstract abstract_ = this.abstractRepository.findFirstByUuid(uuid);
    if (abstract_ == null || !isReadable(account, abstract_)) {
      return null;
    }
    return AbstractDto.of(abstract_);
  }

}
