package jp.neuroinf.abstracts.controller;

import static jp.neuroinf.abstracts.support.TestData.login;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.web.servlet.MockMvc;

import jakarta.persistence.EntityManager;
import jp.neuroinf.abstracts.entity.Abstract;
import jp.neuroinf.abstracts.entity.AbstractState;
import jp.neuroinf.abstracts.entity.Account;
import jp.neuroinf.abstracts.entity.AccountFavorites;
import jp.neuroinf.abstracts.entity.Conference;
import jp.neuroinf.abstracts.repository.AbstractRepository;
import jp.neuroinf.abstracts.repository.ConferenceRepository;
import jp.neuroinf.abstracts.support.IntegrationTest;
import jp.neuroinf.abstracts.support.TestData;

@IntegrationTest
class ConferenceAdminApiTest {

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private TestData testData;

  @Autowired
  private ConferenceRepository conferenceRepository;

  @Autowired
  private AbstractRepository abstractRepository;

  @Autowired
  private EntityManager entityManager;

  @Test
  void adminCreatesConferenceAndBecomesOwner() throws Exception {
    Account admin = this.testData.admin();
    this.mockMvc.perform(post("/api/conferences")
        .param("name", "New Conference").param("shortName", " NEW2027 ")
        .param("startDate", "2027-03-01T00:00:00").param("endDate", "2027-03-03T00:00:00")
        .param("deadline", "2027-01-31T00:00:00")
        .with(login(admin)).with(csrf()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.shortName").value("NEW2027"))
        .andExpect(jsonPath("$.isOpen").value(false))
        .andExpect(jsonPath("$.isPublished").value(false))
        .andExpect(jsonPath("$.isOwner").value(true));
  }

  @Test
  void createConferenceRejectsTakenShortName() throws Exception {
    Account admin = this.testData.admin();
    this.testData.conference("TAKEN", null);
    this.mockMvc.perform(post("/api/conferences")
        .param("name", "Duplicate").param("shortName", "TAKEN")
        .param("startDate", "2027-03-01T00:00:00").param("endDate", "2027-03-03T00:00:00")
        .param("deadline", "2027-01-31T00:00:00")
        .with(login(admin)).with(csrf()))
        .andExpect(status().isBadRequest());
  }

  @Test
  void onlyAdminCreatesConference() throws Exception {
    Account user = this.testData.account("user@example.com");
    this.mockMvc.perform(post("/api/conferences")
        .param("name", "New Conference").param("shortName", "NEW2027")
        .param("startDate", "2027-03-01T00:00:00").param("endDate", "2027-03-03T00:00:00")
        .param("deadline", "2027-01-31T00:00:00")
        .with(login(user)).with(csrf()))
        .andExpect(status().isForbidden());
  }

  @Test
  void adminDeletesConferenceWithAbstractsAndFavorites() throws Exception {
    Account admin = this.testData.admin();
    Account author = this.testData.account("author@example.com");
    Conference conference = this.testData.conference("DELETE", author);
    Abstract abstract_ = this.testData.abstract_(conference, author, AbstractState.ACCEPTED);
    AccountFavorites favorite = new AccountFavorites();
    favorite.setAccount(author);
    favorite.setAbstract_(abstract_);
    author.getFavorites().add(favorite);
    abstract_.getFavorites().add(favorite);
    this.entityManager.flush();
    String conferenceUuid = conference.getUuid();
    String abstractUuid = abstract_.getUuid();
    this.mockMvc.perform(delete("/api/conferences/{uuid}", conferenceUuid)
        .with(login(author)).with(csrf()))
        .andExpect(status().isForbidden());
    this.mockMvc.perform(delete("/api/conferences/{uuid}", conferenceUuid)
        .with(login(admin)).with(csrf()))
        .andExpect(status().isOk());
    this.entityManager.clear();
    assertNull(this.conferenceRepository.findFirstByUuid(conferenceUuid));
    assertNull(this.abstractRepository.findFirstByUuid(abstractUuid));
  }

  @Test
  void publicAbstractListShowsAcceptedOnlyEvenForManagers() throws Exception {
    Account owner = this.testData.account("chair@example.com");
    Conference conference = this.testData.conference("LIST", owner);
    this.testData.abstract_(conference, null, AbstractState.ACCEPTED);
    this.testData.abstract_(conference, null, AbstractState.SUBMITTED);
    this.mockMvc.perform(get("/api/conferences/{uuid}/abstracts", conference.getUuid()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()").value(1));
    this.mockMvc.perform(get("/api/conferences/{uuid}/abstracts", conference.getUuid()).with(login(owner)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()").value(1));
  }

  @Test
  void allAbstractsAreListedForManagersOnly() throws Exception {
    Account owner = this.testData.account("chair@example.com");
    Account author = this.testData.account("author@example.com");
    Account admin = this.testData.admin();
    Conference conference = this.testData.conference("ALL", owner);
    this.testData.abstract_(conference, author, AbstractState.ACCEPTED);
    this.testData.abstract_(conference, author, AbstractState.SUBMITTED);
    this.mockMvc.perform(get("/api/conferences/{uuid}/allAbstracts", conference.getUuid()).with(login(owner)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()").value(2))
        .andExpect(jsonPath("$[0].owners[0].mail").value("author@example.com"));
    this.mockMvc.perform(get("/api/conferences/{uuid}/allAbstracts", conference.getUuid()).with(login(admin)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()").value(2));
    this.mockMvc.perform(get("/api/conferences/{uuid}/allAbstracts", conference.getUuid()).with(login(author)))
        .andExpect(status().isForbidden());
    this.mockMvc.perform(get("/api/conferences/{uuid}/allAbstracts", conference.getUuid()))
        .andExpect(status().isUnauthorized());
  }

  @Test
  void conferenceOwnersAreShownToAdminWhoIsNotOwner() throws Exception {
    Account owner = this.testData.account("chair@example.com");
    Account admin = this.testData.admin();
    Conference conference = this.testData.conference("OWNERS", owner);
    this.mockMvc.perform(get("/api/conferences/{uuid}", conference.getUuid()).with(login(admin)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.isOwner").value(false))
        .andExpect(jsonPath("$.owners[0].mail").value("chair@example.com"));
    this.mockMvc.perform(get("/api/conferences/{uuid}", conference.getUuid()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.owners").doesNotExist());
  }

}
