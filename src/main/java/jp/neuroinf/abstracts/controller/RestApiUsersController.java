package jp.neuroinf.abstracts.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import jp.neuroinf.abstracts.dto.AccountDto;
import jp.neuroinf.abstracts.entity.Account;
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
        Account account = user != null ? user.getAccount() : null;
        if (account == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "not logged in");
        }
        return AccountDto.of(account);
    }

}