package jp.neuroinf.abstracts.controller;

import static jp.neuroinf.abstracts.support.TestData.login;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.web.servlet.MockMvc;

import jp.neuroinf.abstracts.entity.Account;
import jp.neuroinf.abstracts.repository.AccountRepository;
import jp.neuroinf.abstracts.support.IntegrationTest;
import jp.neuroinf.abstracts.support.TestData;

@IntegrationTest
class UsersAdminApiTest {

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private TestData testData;

  @Autowired
  private AccountRepository accountRepository;

  @Test
  void adminListsAccounts() throws Exception {
    Account admin = this.testData.admin();
    Account user = this.testData.account("user@example.com");
    this.mockMvc.perform(get("/api/users").with(login(admin)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[?(@.mail == 'user@example.com')]").exists())
        .andExpect(jsonPath("$[?(@.mail == 'admin@example.com')].isAdmin").value(true))
        .andExpect(jsonPath("$[0].password").doesNotExist());
    this.mockMvc.perform(get("/api/users").with(login(user)))
        .andExpect(status().isForbidden());
  }

  @Test
  void adminCreatesAccount() throws Exception {
    Account admin = this.testData.admin();
    this.mockMvc.perform(post("/api/users")
        .param("email", "new@example.com").param("firstName", " New ").param("lastName", "User")
        .with(login(admin)).with(csrf()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.mail").value("new@example.com"))
        .andExpect(jsonPath("$.firstName").value("New"))
        .andExpect(jsonPath("$.isActive").value(true));
    assertNotNull(this.accountRepository.findFirstByMail("new@example.com"));
    this.mockMvc.perform(post("/api/users")
        .param("email", "new@example.com").param("firstName", "Again").param("lastName", "User")
        .with(login(admin)).with(csrf()))
        .andExpect(status().isBadRequest());
  }

  @Test
  void adminDeactivatesAccountButNotOwn() throws Exception {
    Account admin = this.testData.admin();
    Account user = this.testData.account("user@example.com");
    this.mockMvc.perform(put("/api/users/{uuid}", user.getUuid())
        .param("firstName", "Renamed").param("lastName", "User").param("isActive", "false")
        .with(login(admin)).with(csrf()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.firstName").value("Renamed"));
    assertFalse(this.accountRepository.findFirstByUuid(user.getUuid()).getIsActive());
    this.mockMvc.perform(put("/api/users/{uuid}", admin.getUuid())
        .param("firstName", "Admin").param("lastName", "Admin").param("isActive", "false")
        .with(login(admin)).with(csrf()))
        .andExpect(status().isBadRequest());
  }

}
