package jp.neuroinf.abstracts.controller;

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
import jp.neuroinf.abstracts.service.AccountService;
import jp.neuroinf.abstracts.service.AbstractService;

@RestController
@RequestMapping("/api/abstracts")
public class RestApiAbstractsController {

    private final AccountService accountService;
    private final AbstractService abstractService;

    public RestApiAbstractsController(AccountService accountService, AbstractService abstractService) {
        this.accountService = accountService;
        this.abstractService = abstractService;
    }

    @GetMapping("/{uuid}")
    public AbstractDto retrieveAbstract(@AuthenticationPrincipal AccountDetails user, @PathVariable String uuid)
            throws ResponseStatusException {
        Account account = this.accountService.findAccount(user);
        AbstractDto abstract_ = this.abstractService.getAbstract(account, uuid);
        if (abstract_ == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "no abstract data found");
        }
        return abstract_;
    }

}