package jp.neuroinf.abstracts.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import jp.neuroinf.abstracts.core.AppProperties;
import jp.neuroinf.abstracts.dto.AbstractSimpleDto;
import jp.neuroinf.abstracts.dto.ConferenceDto;
import jp.neuroinf.abstracts.dto.ConferenceSimpleDto;
import jp.neuroinf.abstracts.entity.Account;
import jp.neuroinf.abstracts.entity.Conference;
import jp.neuroinf.abstracts.repository.ConferenceRepository;

@Service
public class ConferenceService {

  private final ConferenceRepository conferenceRepository;
  private final AppProperties properties;

  @Autowired
  public ConferenceService(ConferenceRepository conferenceRepository, AppProperties properties) {
    this.conferenceRepository = conferenceRepository;
    this.properties = properties;
  }

  @Transactional
  public List<ConferenceSimpleDto> getConferenceList(Account account) {
    List<Conference> conferences = this.conferenceRepository.getConferences();
    List<ConferenceSimpleDto> dtoList = conferences.stream().map(c -> ConferenceSimpleDto.of(c, account))
        .collect(Collectors.toList());
    return dtoList;
  }

  @Transactional
  public ConferenceDto getConference(Account account, String uuid) {
    Conference conference = this.conferenceRepository.findFirstByUuid(uuid);
    return conference != null ? ConferenceDto.of(conference, account) : null;
  }

  @Transactional
  public List<AbstractSimpleDto> getConferenceAbstracts(Account account, String uuid) {
    Conference conference = this.conferenceRepository.findFirstByUuid(uuid);
    if (conference == null) {
      return null;
    }
    boolean isAdmin = account != null ? this.properties.getAdmins().contains(account.getMail()) : false;
    boolean isConferenceOwner = conference.isOwner(account);
    if (!isAdmin && !isConferenceOwner && !conference.getIsPublished()) {
      return null; // no permissions
    }
    return conference.getAbstracts().stream().map(AbstractSimpleDto::of)
        .filter((d) -> isAdmin || isConferenceOwner || d.getState().equals("Accepted"))
        .sorted((d1, d2) -> d1.getSortId() - d2.getSortId())
        .collect(Collectors.toList());
  }

}
