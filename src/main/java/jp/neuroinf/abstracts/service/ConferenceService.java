package jp.neuroinf.abstracts.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import jp.neuroinf.abstracts.dto.ConferenceDto;
import jp.neuroinf.abstracts.dto.ConferenceSimpleDto;
import jp.neuroinf.abstracts.entity.Account;
import jp.neuroinf.abstracts.entity.Conference;
import jp.neuroinf.abstracts.repository.ConferenceRepository;

@Service
public class ConferenceService {
  private final ConferenceRepository conferenceRepository;

  @Autowired
  public ConferenceService(ConferenceRepository conferenceRepository) {
    this.conferenceRepository = conferenceRepository;
  }

  @Transactional
  public List<ConferenceSimpleDto> getConferenceList(Account account, String shortName) {
    List<Conference> conferences;
    if (shortName != null) {
      conferences = this.conferenceRepository.getConferencesByShortName(shortName);
    } else {
      conferences = this.conferenceRepository.getConferences();
    }
    List<ConferenceSimpleDto> dtoList = conferences.stream().map(c -> ConferenceSimpleDto.of(c, account))
        .collect(Collectors.toList());
    return dtoList;
  }

  @Transactional
  public ConferenceDto getConference(Account account, String uuid) {
    Conference entity = this.conferenceRepository.findFirstByUuid(uuid);
    return entity != null ? ConferenceDto.of(entity, account) : null;
  }

}
