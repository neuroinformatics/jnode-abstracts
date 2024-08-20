package jp.neuroinf.abstracts.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jp.neuroinf.abstracts.dto.ConferenceDto;
import jp.neuroinf.abstracts.entity.Account;
import jp.neuroinf.abstracts.service.ConferenceService;
import jp.neuroinf.abstracts.service.UserDetailsImpl;

@RestController
@RequestMapping("/api/conferences")
public class RestApiConferenceController {

    private final ConferenceService conferenceService;

    @Autowired
    public RestApiConferenceController(ConferenceService conferenceService) {
        this.conferenceService = conferenceService;
    }

    @GetMapping("/")
    public List<ConferenceDto> getConferenceList(@AuthenticationPrincipal UserDetailsImpl user) {
        if (user != null) {
            Account account = user.getAccount();
            System.out.println(account.getFirstName());
        }

        return this.conferenceService.getConferenceList();
    }
}