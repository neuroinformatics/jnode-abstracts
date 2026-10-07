package jp.neuroinf.abstracts.controller;

import static jp.neuroinf.abstracts.support.TestData.login;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import jp.neuroinf.abstracts.entity.Abstract;
import jp.neuroinf.abstracts.entity.AbstractState;
import jp.neuroinf.abstracts.entity.Account;
import jp.neuroinf.abstracts.entity.Conference;
import jp.neuroinf.abstracts.support.IntegrationTest;
import jp.neuroinf.abstracts.support.TestData;

/**
 * Runs each request in its own transaction like in production.
 */
@IntegrationTest
@Transactional(propagation = Propagation.NOT_SUPPORTED)
class FavoriteApiTest {

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private TestData testData;

  private Account user;
  private Account chair;
  private Conference conference;

  @BeforeEach
  void setUp() {
    String suffix = UUID.randomUUID().toString().substring(0, 8);
    this.user = this.testData.account("fan-" + suffix + "@example.com");
    this.chair = this.testData.account("chair-" + suffix + "@example.com");
    this.conference = this.testData.conference("F" + suffix, this.chair);
  }

  @Test
  void favoritesAreAddedListedAndRemoved() throws Exception {
    Abstract accepted = this.testData.abstract_(this.conference, null, AbstractState.ACCEPTED);
    this.mockMvc.perform(put("/api/abstracts/{uuid}/favorite", accepted.getUuid())
        .with(login(this.user)).with(csrf()))
        .andExpect(status().isOk());
    // adding twice keeps a single favorite
    this.mockMvc.perform(put("/api/abstracts/{uuid}/favorite", accepted.getUuid())
        .with(login(this.user)).with(csrf()))
        .andExpect(status().isOk());
    this.mockMvc.perform(get("/api/users/current/favorites").with(login(this.user)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()").value(1))
        .andExpect(jsonPath("$[0].uuid").value(accepted.getUuid()));
    this.mockMvc.perform(delete("/api/abstracts/{uuid}/favorite", accepted.getUuid())
        .with(login(this.user)).with(csrf()))
        .andExpect(status().isOk());
    this.mockMvc.perform(get("/api/users/current/favorites").with(login(this.user)))
        .andExpect(jsonPath("$.length()").value(0));
  }

  @Test
  void unreadableAbstractsCannotBeFavorites() throws Exception {
    Abstract submitted = this.testData.abstract_(this.conference, null, AbstractState.SUBMITTED);
    this.mockMvc.perform(put("/api/abstracts/{uuid}/favorite", submitted.getUuid())
        .with(login(this.user)).with(csrf()))
        .andExpect(status().isNotFound());
    this.mockMvc.perform(put("/api/abstracts/{uuid}/favorite", submitted.getUuid()).with(csrf()))
        .andExpect(status().isUnauthorized());
  }

  @Test
  void withdrawnFavoritesAreHidden() throws Exception {
    Abstract accepted = this.testData.abstract_(this.conference, null, AbstractState.ACCEPTED);
    this.mockMvc.perform(put("/api/abstracts/{uuid}/favorite", accepted.getUuid())
        .with(login(this.user)).with(csrf()))
        .andExpect(status().isOk());
    this.mockMvc.perform(put("/api/abstracts/{uuid}/state", accepted.getUuid()).param("state", "Withdrawn")
        .with(login(this.chair)).with(csrf()))
        .andExpect(status().isOk());
    this.mockMvc.perform(get("/api/users/current/favorites").with(login(this.user)))
        .andExpect(jsonPath("$.length()").value(0));
    // deleting a favorite abstract also removes the favorite
    this.mockMvc.perform(delete("/api/abstracts/{uuid}", accepted.getUuid())
        .with(login(this.chair)).with(csrf()))
        .andExpect(status().isOk());
  }

}
