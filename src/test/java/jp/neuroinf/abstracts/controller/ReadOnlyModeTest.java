package jp.neuroinf.abstracts.controller;

import static jp.neuroinf.abstracts.support.TestData.login;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.response.SecurityMockMvcResultMatchers.authenticated;
import static org.springframework.security.test.web.servlet.response.SecurityMockMvcResultMatchers.unauthenticated;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import jp.neuroinf.abstracts.component.TimestampSigner;
import jp.neuroinf.abstracts.entity.AbstractState;
import jp.neuroinf.abstracts.entity.Account;
import jp.neuroinf.abstracts.entity.Conference;
import jp.neuroinf.abstracts.support.IntegrationTest;
import jp.neuroinf.abstracts.support.TestData;

@IntegrationTest
@TestPropertySource(properties = "app.read-only=true")
class ReadOnlyModeTest {

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private TestData testData;

  @Autowired
  private TimestampSigner timestampSigner;

  @Test
  void configTellsTheMode() throws Exception {
    this.mockMvc.perform(get("/api/config"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.readOnly").value(true));
  }

  @Test
  void onlyAdminsCanLogin() throws Exception {
    this.testData.account("user@example.com");
    this.testData.admin();
    this.mockMvc.perform(post("/api/login").param("username", "user@example.com").param("password", "password")
        .with(csrf()))
        .andExpect(status().isUnauthorized())
        .andExpect(jsonPath("$.message").value("Login is currently restricted to site administrators"))
        .andExpect(unauthenticated());
    // the same answer for unknown accounts, so that it does not tell whether an account exists
    this.mockMvc.perform(post("/api/login").param("username", "nobody@example.com").param("password", "x")
        .with(csrf()))
        .andExpect(jsonPath("$.message").value("Login is currently restricted to site administrators"));
    this.mockMvc.perform(post("/api/login").param("username", TestData.ADMIN_MAIL).param("password", "password")
        .with(csrf()))
        .andExpect(status().isOk())
        .andExpect(authenticated());
  }

  @Test
  void existingSessionsOfOtherUsersLoseTheirAccess() throws Exception {
    Account user = this.testData.account("user@example.com");
    Account admin = this.testData.admin();
    this.mockMvc.perform(get("/api/users/current").with(login(user)))
        .andExpect(status().isUnauthorized());
    this.mockMvc.perform(get("/api/users/current").with(login(admin)))
        .andExpect(status().isOk());
  }

  @Test
  void conferenceOwnersCannotManageWhileReadOnly() throws Exception {
    Account owner = this.testData.account("chair@example.com");
    Conference conference = this.testData.conference("RO", owner);
    this.mockMvc.perform(get("/api/conferences/{uuid}/allAbstracts", conference.getUuid()).with(login(owner)))
        .andExpect(status().isUnauthorized());
  }

  @Test
  void publishedInformationIsStillReadable() throws Exception {
    Conference conference = this.testData.conference("PUBLIC", null);
    this.testData.abstract_(conference, null, AbstractState.ACCEPTED);
    this.mockMvc.perform(get("/api/conferences"))
        .andExpect(status().isOk());
    this.mockMvc.perform(get("/api/conferences/{uuid}/abstracts", conference.getUuid()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()").value(1));
  }

  @Test
  void passwordResetIsLimitedToAdmins() throws Exception {
    this.testData.account("user@example.com");
    this.testData.admin();
    this.mockMvc.perform(post("/api/users/password/reset/request").param("email", "user@example.com").with(csrf()))
        .andExpect(status().isForbidden());
    this.mockMvc.perform(post("/api/users/password/reset")
        .param("token", this.timestampSigner.sign("user@example.com:fingerprint"))
        .param("newPassword", "new-password-123").with(csrf()))
        .andExpect(status().isForbidden());
    this.mockMvc.perform(post("/api/users/password/reset/request").param("email", TestData.ADMIN_MAIL).with(csrf()))
        .andExpect(status().isOk());
  }

}
