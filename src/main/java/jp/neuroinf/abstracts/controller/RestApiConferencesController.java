package jp.neuroinf.abstracts.controller;

import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import jakarta.validation.Valid;
import jp.neuroinf.abstracts.core.AccountDetails;
import jp.neuroinf.abstracts.core.RestSuccessResponseBody;
import jp.neuroinf.abstracts.dto.AbstractSimpleDto;
import jp.neuroinf.abstracts.dto.ConferenceDto;
import jp.neuroinf.abstracts.dto.ConferenceSimpleDto;
import jp.neuroinf.abstracts.form.ConferenceUpdateAbstractGroupsForm;
import jp.neuroinf.abstracts.form.ConferenceUpdateForm;
import jp.neuroinf.abstracts.form.ConferenceUpdateGeoForm;
import jp.neuroinf.abstracts.form.ConferenceUpdateInfoForm;
import jp.neuroinf.abstracts.form.ConferenceUpdateOwnersForm;
import jp.neuroinf.abstracts.form.ConferenceUpdateScheduleForm;
import jp.neuroinf.abstracts.service.ConferenceService;

@RestController
@RequestMapping("/api/conferences")
public class RestApiConferencesController {

    private final ConferenceService conferenceService;

    public RestApiConferencesController(ConferenceService conferenceService) {
        this.conferenceService = conferenceService;
    }

    @GetMapping("")
    public List<ConferenceSimpleDto> listConference(
            @AuthenticationPrincipal AccountDetails user) {
        return this.conferenceService.getConferenceList(user);
    }

    @GetMapping("/{uuid}")
    public ConferenceDto retrieveConference(@AuthenticationPrincipal AccountDetails user, @PathVariable String uuid)
            throws ResponseStatusException {
        return this.conferenceService.getConference(user, uuid);
    }

    @GetMapping("/{uuid}/abstracts")
    public List<AbstractSimpleDto> listConferenceAbstracts(@AuthenticationPrincipal AccountDetails user,
            @PathVariable String uuid)
            throws ResponseStatusException {
        return this.conferenceService.getConferenceAbstracts(user, uuid);
    }

    @PutMapping("/{uuid}")
    public RestSuccessResponseBody updateConference(@AuthenticationPrincipal AccountDetails user,
            @PathVariable("uuid") String uuid, @Valid ConferenceUpdateForm form) throws ResponseStatusException {
        return this.conferenceService.updateConference(user, uuid, form);
    }

    @PutMapping("/{uuid}/abstractGroups")
    public RestSuccessResponseBody updateConferenceAbstractGroups(@AuthenticationPrincipal AccountDetails user,
            @PathVariable("uuid") String uuid, @Valid ConferenceUpdateAbstractGroupsForm form)
            throws ResponseStatusException {
        return this.conferenceService.updateConferenceAbstractGroups(user, uuid, form);
    }

    @PutMapping("/{uuid}/geo")
    public RestSuccessResponseBody updateConferenceGeo(@AuthenticationPrincipal AccountDetails user,
            @PathVariable("uuid") String uuid, @Valid ConferenceUpdateGeoForm form) throws ResponseStatusException {
        return this.conferenceService.updateConferenceGeo(user, uuid, form);
    }

    @PutMapping("/{uuid}/schedule")
    public RestSuccessResponseBody updateConferenceSchedule(@AuthenticationPrincipal AccountDetails user,
            @PathVariable("uuid") String uuid, @Valid ConferenceUpdateScheduleForm form)
            throws ResponseStatusException {
        return this.conferenceService.updateConferenceSchedule(user, uuid, form);
    }

    @PutMapping("/{uuid}/info")
    public RestSuccessResponseBody updateConferenceInfo(@AuthenticationPrincipal AccountDetails user,
            @PathVariable("uuid") String uuid, @Valid ConferenceUpdateInfoForm form) throws ResponseStatusException {
        return this.conferenceService.updateConferenceInfo(user, uuid, form);
    }

    @PutMapping("/{uuid}/owners")
    public RestSuccessResponseBody updateConferenceOwners(@AuthenticationPrincipal AccountDetails user,
            @PathVariable("uuid") String uuid, @Valid ConferenceUpdateOwnersForm form) throws ResponseStatusException {
        return this.conferenceService.updateConferenceOwners(user, uuid, form);
    }

}