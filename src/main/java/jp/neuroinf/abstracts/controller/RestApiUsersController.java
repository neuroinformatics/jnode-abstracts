package jp.neuroinf.abstracts.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import jp.neuroinf.abstracts.core.RestSuccessResponseBody;
import jp.neuroinf.abstracts.dto.AccountDto;
import jp.neuroinf.abstracts.form.UsersChangeEmailForm;
import jp.neuroinf.abstracts.form.UsersChangePasswordForm;
import jp.neuroinf.abstracts.service.AccountDetails;
import jp.neuroinf.abstracts.service.AccountService;

@RestController
@RequestMapping("/api/users")
public class RestApiUsersController {

    private final AccountService accountService;

    @Autowired
    public RestApiUsersController(AccountService accountService) {
        this.accountService = accountService;
    }

    @GetMapping("/current")
    public AccountDto getCurrentUser(@AuthenticationPrincipal AccountDetails user) {
        return accountService.getCurrentUser(user);
    }

    @PutMapping("/{uuid}/password")
    public RestSuccessResponseBody changePassword(@AuthenticationPrincipal AccountDetails user,
            @PathVariable("uuid") String uuid, @Valid UsersChangePasswordForm form) {
        return accountService.changePassword(user, uuid, form);
    }

    @PutMapping("/{uuid}/email")
    public RestSuccessResponseBody changeEmail(@AuthenticationPrincipal AccountDetails user,
            @PathVariable("uuid") String uuid, @Valid UsersChangeEmailForm form) {
        return accountService.changeEmail(user, uuid, form);
    }

}