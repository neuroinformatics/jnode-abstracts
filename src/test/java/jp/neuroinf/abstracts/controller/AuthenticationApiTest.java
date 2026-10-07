package jp.neuroinf.abstracts.controller;

import static jp.neuroinf.abstracts.support.TestData.login;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.response.SecurityMockMvcResultMatchers.authenticated;
import static org.springframework.security.test.web.servlet.response.SecurityMockMvcResultMatchers.unauthenticated;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.web.servlet.MockMvc;

import jp.neuroinf.abstracts.component.LoginAttemptLimiter;
import jp.neuroinf.abstracts.entity.Account;
import jp.neuroinf.abstracts.repository.AccountRepository;
import jp.neuroinf.abstracts.support.IntegrationTest;
import jp.neuroinf.abstracts.support.TestData;

@IntegrationTest
class AuthenticationApiTest {

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private TestData testData;

  @Autowired
  private AccountRepository accountRepository;

  @Test
  void loginWithCorrectPassword() throws Exception {
    this.testData.account("user@example.com");
    this.mockMvc.perform(post("/api/login").param("username", "user@example.com").param("password", "password")
        .with(csrf()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.message").value("success"))
        .andExpect(authenticated().withUsername("user@example.com"));
  }

  @Test
  void loginWithWrongPasswordOrUnknownUser() throws Exception {
    this.testData.account("user@example.com");
    this.mockMvc.perform(post("/api/login").param("username", "user@example.com").param("password", "wrong")
        .with(csrf()))
        .andExpect(status().isUnauthorized())
        .andExpect(jsonPath("$.code").value(401))
        .andExpect(jsonPath("$.path").value("/api/login"))
        .andExpect(unauthenticated());
    this.mockMvc.perform(post("/api/login").param("username", "nobody@example.com").param("password", "password")
        .with(csrf()))
        .andExpect(status().isUnauthorized())
        .andExpect(unauthenticated());
  }

  @Test
  void inactiveAccountCannotLogin() throws Exception {
    Account account = this.testData.account("user@example.com");
    account.setIsActive(false);
    this.accountRepository.saveAndFlush(account);
    this.mockMvc.perform(post("/api/login").param("username", "user@example.com").param("password", "password")
        .with(csrf()))
        .andExpect(status().isUnauthorized())
        .andExpect(unauthenticated());
  }

  @Test
  void stateChangingRequestsRequireTheCsrfToken() throws Exception {
    this.testData.account("user@example.com");
    this.mockMvc.perform(post("/api/login").param("username", "user@example.com").param("password", "password"))
        .andExpect(status().isForbidden());
    this.mockMvc.perform(post("/api/logout"))
        .andExpect(status().isForbidden());
  }

  @Test
  void logout() throws Exception {
    Account account = this.testData.account("user@example.com");
    this.mockMvc.perform(post("/api/logout").with(login(account)).with(csrf()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.message").value("success"))
        .andExpect(unauthenticated());
  }

  @Test
  void repeatedFailuresBlockTheAccountForAWhile() throws Exception {
    this.testData.account("guessed@example.com");
    this.testData.account("other@example.com");
    for (int i = 0; i < LoginAttemptLimiter.MAX_FAILURES; i++) {
      this.mockMvc.perform(post("/api/login").param("username", "guessed@example.com").param("password", "wrong")
          .with(csrf()))
          .andExpect(status().isUnauthorized());
    }
    // even the correct password is refused now
    this.mockMvc.perform(post("/api/login").param("username", "Guessed@example.com").param("password", "password")
        .with(csrf()))
        .andExpect(status().isTooManyRequests())
        .andExpect(jsonPath("$.message").value("Too many failed logins. Please try again later."))
        .andExpect(unauthenticated());
    this.mockMvc.perform(post("/api/login").param("username", "other@example.com").param("password", "password")
        .with(csrf()))
        .andExpect(status().isOk());
  }

}
