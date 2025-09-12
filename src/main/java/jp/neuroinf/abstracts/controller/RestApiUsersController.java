package jp.neuroinf.abstracts.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import jakarta.validation.Valid;
import jp.neuroinf.abstracts.core.AccountDetails;
import jp.neuroinf.abstracts.core.RestSuccessResponseBody;
import jp.neuroinf.abstracts.dto.AccountDto;
import jp.neuroinf.abstracts.form.UsersChangeEmailForm;
import jp.neuroinf.abstracts.form.UsersChangePasswordForm;
import jp.neuroinf.abstracts.form.UsersExistsForm;
import jp.neuroinf.abstracts.form.UsersRequestPasswordResetForm;
import jp.neuroinf.abstracts.form.UsersResetPasswordForm;
import jp.neuroinf.abstracts.service.AccountService;

@RestController
@RequestMapping("/api/users")
public class RestApiUsersController {

    private final AccountService accountService;

    public RestApiUsersController(AccountService accountService) {
        this.accountService = accountService;
    }

    @GetMapping("/current")
    public AccountDto getCurrentUser(@AuthenticationPrincipal AccountDetails user) throws ResponseStatusException {
        return this.accountService.getCurrentUser(user);
    }

    @GetMapping("/exists")
    public RestSuccessResponseBody userExists(@AuthenticationPrincipal AccountDetails user,
            @Valid UsersExistsForm form) throws ResponseStatusException {
        return this.accountService.exists(user, form);
    }

    @PostMapping("/password/reset/request")
    public RestSuccessResponseBody requestPasswordReset(@Valid UsersRequestPasswordResetForm form)
            throws ResponseStatusException {
        return this.accountService.requestPasswordReset(form);
    }

    @PostMapping("/password/reset")
    public RestSuccessResponseBody resetPassword(@Valid UsersResetPasswordForm form) throws ResponseStatusException {
        return this.accountService.resetPassword(form);
    }

    @PutMapping("/{uuid}/password")
    public RestSuccessResponseBody changePassword(@AuthenticationPrincipal AccountDetails user,
            @PathVariable("uuid") String uuid, @Valid UsersChangePasswordForm form) throws ResponseStatusException {
        return this.accountService.changePassword(user, uuid, form);
    }

    @PutMapping("/{uuid}/email")
    public RestSuccessResponseBody changeEmail(@AuthenticationPrincipal AccountDetails user,
            @PathVariable("uuid") String uuid, @Valid UsersChangeEmailForm form) throws ResponseStatusException {
        return this.accountService.changeEmail(user, uuid, form);
    }

}