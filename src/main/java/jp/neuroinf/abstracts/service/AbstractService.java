package jp.neuroinf.abstracts.service;

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
  private final AppProperties appProperties;

  public AbstractService(AbstractRepository abstractRepository, AppProperties appProperties) {
    this.abstractRepository = abstractRepository;
    this.appProperties = appProperties;
  }

  @Transactional
  public boolean isReadable(Account account, Abstract abstract_) {
    Conference conference = abstract_.getConference();
    boolean isAdmin = account != null ? this.appProperties.getAdmins().contains(account.getMail()) : false;
    boolean isConferenceOwner = conference.isOwner(account);
    boolean isOwner = abstract_.isOwner(account);
    return isAdmin || isConferenceOwner || isOwner
        || conference.getIsPublished() && abstract_.getState().equals("Accepted");
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
