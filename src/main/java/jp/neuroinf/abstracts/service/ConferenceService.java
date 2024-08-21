package jp.neuroinf.abstracts.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import jp.neuroinf.abstracts.dto.AccountDto;
import jp.neuroinf.abstracts.dto.ConferenceDto;
import jp.neuroinf.abstracts.dto.ConferenceSimpleDto;
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
  public List<ConferenceSimpleDto> getConferenceList(AccountDto account) {
    List<ConferenceSimpleDto> dtoList = this.conferenceRepository.findAll()
        .stream().map(c -> ConferenceSimpleDto.of(c, account)).collect(Collectors.toList());
    return dtoList;
  }

  @Transactional
  public ConferenceDto getConference(AccountDto account, String uuid) {
    Conference entity = this.conferenceRepository.findByUuid(uuid);
    return entity != null ? ConferenceDto.of(entity, account) : null;
  }

}
