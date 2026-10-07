package jp.neuroinf.abstracts.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import jakarta.validation.Valid;
import jp.neuroinf.abstracts.core.AccountDetails;
import jp.neuroinf.abstracts.dto.AbstractDto;
import jp.neuroinf.abstracts.form.AbstractUpdatePublicationForm;
import jp.neuroinf.abstracts.form.AbstractUpdateStateForm;
import jp.neuroinf.abstracts.service.AbstractService;

@RestController
@RequestMapping("/api/abstracts")
public class RestApiAbstractsController {

    private final AbstractService abstractService;

    public RestApiAbstractsController(AbstractService abstractService) {
        this.abstractService = abstractService;
    }

    @GetMapping("/{uuid}")
    public AbstractDto retrieveAbstract(@AuthenticationPrincipal AccountDetails user, @PathVariable String uuid)
            throws ResponseStatusException {
        return this.abstractService.getAbstract(user, uuid);
    }

    @PutMapping("/{uuid}/state")
    public AbstractDto updateAbstractState(@AuthenticationPrincipal AccountDetails user,
            @PathVariable("uuid") String uuid, @Valid AbstractUpdateStateForm form) throws ResponseStatusException {
        return this.abstractService.updateState(user, uuid, form);
    }

    @PutMapping("/{uuid}/publication")
    public AbstractDto updateAbstractPublication(@AuthenticationPrincipal AccountDetails user,
            @PathVariable("uuid") String uuid, @Valid AbstractUpdatePublicationForm form)
            throws ResponseStatusException {
        return this.abstractService.updatePublication(user, uuid, form);
    }

}