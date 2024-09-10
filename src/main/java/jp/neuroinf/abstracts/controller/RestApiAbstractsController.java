package jp.neuroinf.abstracts.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import jp.neuroinf.abstracts.core.AccountDetails;
import jp.neuroinf.abstracts.dto.AbstractDto;
import jp.neuroinf.abstracts.entity.Account;
import jp.neuroinf.abstracts.service.AbstractService;

@RestController
@RequestMapping("/api/abstracts")
public class RestApiAbstractsController {

    private final AbstractService abstractService;

    @Autowired
    public RestApiAbstractsController(AbstractService abstractService) {
        this.abstractService = abstractService;
    }

    @GetMapping("/{uuid}")
    public AbstractDto retrieveAbstract(@AuthenticationPrincipal AccountDetails user, @PathVariable String uuid)
            throws Exception {
        Account account = user != null ? user.getAccount() : null;
        AbstractDto abstract_ = this.abstractService.getAbstract(account, uuid);
        if (abstract_ == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "no abstract data found");
        }
        return abstract_;
    }

}