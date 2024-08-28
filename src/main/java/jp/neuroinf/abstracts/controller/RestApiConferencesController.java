package jp.neuroinf.abstracts.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import jp.neuroinf.abstracts.dto.AbstractSimpleDto;
import jp.neuroinf.abstracts.dto.ConferenceDto;
import jp.neuroinf.abstracts.dto.ConferenceSimpleDto;
import jp.neuroinf.abstracts.entity.Account;
import jp.neuroinf.abstracts.service.AccountDetails;
import jp.neuroinf.abstracts.service.ConferenceService;

@RestController
@RequestMapping("/api/conferences")
public class RestApiConferencesController {

    private final ConferenceService conferenceService;

    @Autowired
    public RestApiConferencesController(ConferenceService conferenceService) {
        this.conferenceService = conferenceService;
    }

    @GetMapping("")
    public List<ConferenceSimpleDto> listConference(
            @AuthenticationPrincipal AccountDetails user) {
        Account account = user != null ? user.getAccount() : null;
        return this.conferenceService.getConferenceList(account);
    }

    @GetMapping("/{uuid}")
    public ConferenceDto retrieveConference(@AuthenticationPrincipal AccountDetails user, @PathVariable String uuid)
            throws Exception {
        Account account = user != null ? user.getAccount() : null;
        ConferenceDto conference = this.conferenceService.getConference(account, uuid);
        if (conference == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "no conference data found");
        }
        return conference;
    }

    @GetMapping("/{uuid}/abstracts")
    public List<AbstractSimpleDto> listConferenceAbstracts(@AuthenticationPrincipal AccountDetails user,
            @PathVariable String uuid)
            throws Exception {
        Account account = user != null ? user.getAccount() : null;
        List<AbstractSimpleDto> abstracts = this.conferenceService.getConferenceAbstracts(account, uuid);
        if (abstracts == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "abstracts data found");
        }
        return abstracts;
    }
}