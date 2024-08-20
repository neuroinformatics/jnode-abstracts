package jp.neuroinf.abstracts.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import jp.neuroinf.abstracts.dto.ConferenceDto;
import jp.neuroinf.abstracts.repository.ConferenceRepository;

@Service
public class ConferenceService {
  private final ConferenceRepository conferenceRepository;

  @Autowired
  public ConferenceService(ConferenceRepository conferenceRepository) {
    this.conferenceRepository = conferenceRepository;
  }

  @Transactional
  public List<ConferenceDto> getConferenceList() {
    List<ConferenceDto> dtoList = this.conferenceRepository.findAll()
        .stream().map(ConferenceDto::of).collect(Collectors.toList());
    return dtoList;
  }
}
