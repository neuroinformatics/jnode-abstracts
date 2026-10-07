package jp.neuroinf.abstracts.controller;

import static jp.neuroinf.abstracts.support.TestData.login;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.web.servlet.MockMvc;

import jp.neuroinf.abstracts.entity.Abstract;
import jp.neuroinf.abstracts.entity.AbstractGroup;
import jp.neuroinf.abstracts.entity.AbstractState;
import jp.neuroinf.abstracts.entity.Account;
import jp.neuroinf.abstracts.entity.Conference;
import jp.neuroinf.abstracts.support.IntegrationTest;
import jp.neuroinf.abstracts.support.TestData;

@IntegrationTest
class AbstractAdminApiTest {

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private TestData testData;

  private Account conferenceOwner;
  private Account abstractOwner;
  private Conference conference;

  @BeforeEach
  void setUp() {
    this.conferenceOwner = this.testData.account("chair@example.com");
    this.abstractOwner = this.testData.account("author@example.com");
    this.conference = this.testData.conference("TEST2026", this.conferenceOwner);
  }

  @Test
  void managerMovesSubmittedAbstractToReviewWithNote() throws Exception {
    Abstract abstract_ = this.testData.abstract_(this.conference, this.abstractOwner, AbstractState.SUBMITTED);
    this.mockMvc.perform(put("/api/abstracts/{uuid}/state", abstract_.getUuid())
        .param("state", "InReview").param("note", "  looks fine ")
        .with(login(this.conferenceOwner)).with(csrf()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.state").value("InReview"))
        .andExpect(jsonPath("$.stateLogs[0].state").value("InReview"))
        .andExpect(jsonPath("$.stateLogs[0].note").value("looks fine"))
        .andExpect(jsonPath("$.stateLogs[0].editor").value("First chair"));
  }

  @Test
  void ownerCannotAcceptOwnAbstract() throws Exception {
    Abstract abstract_ = this.testData.abstract_(this.conference, this.abstractOwner, AbstractState.IN_REVIEW);
    this.mockMvc.perform(put("/api/abstracts/{uuid}/state", abstract_.getUuid())
        .param("state", "Accepted")
        .with(login(this.abstractOwner)).with(csrf()))
        .andExpect(status().isForbidden());
  }

  @Test
  void ownerSubmitsOnlyWhileConferenceIsOpen() throws Exception {
    Abstract abstract_ = this.testData.abstract_(this.conference, this.abstractOwner, AbstractState.IN_PREPARATION);
    this.conference.setIsOpen(false);
    this.mockMvc.perform(put("/api/abstracts/{uuid}/state", abstract_.getUuid())
        .param("state", "Submitted")
        .with(login(this.abstractOwner)).with(csrf()))
        .andExpect(status().isForbidden());
    this.conference.setIsOpen(true);
    this.mockMvc.perform(put("/api/abstracts/{uuid}/state", abstract_.getUuid())
        .param("state", "Submitted")
        .with(login(this.abstractOwner)).with(csrf()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.state").value("Submitted"));
  }

  @Test
  void otherUserCannotChangeState() throws Exception {
    Account other = this.testData.account("other@example.com");
    Abstract abstract_ = this.testData.abstract_(this.conference, this.abstractOwner, AbstractState.SUBMITTED);
    this.mockMvc.perform(put("/api/abstracts/{uuid}/state", abstract_.getUuid())
        .param("state", "InReview")
        .with(login(other)).with(csrf()))
        .andExpect(status().isForbidden());
  }

  @Test
  void managerAssignsGroupNumberAndDoi() throws Exception {
    AbstractGroup poster = this.testData.abstractGroup(this.conference, 2, "P");
    AbstractGroup talk = this.testData.abstractGroup(this.conference, 1, "T");
    Abstract abstract_ = this.testData.abstract_(this.conference, this.abstractOwner, AbstractState.ACCEPTED);
    this.mockMvc.perform(put("/api/abstracts/{uuid}/publication", abstract_.getUuid())
        .param("abstractGroupUuid", poster.getUuid()).param("number", "12").param("doi", "10.1234/abc")
        .with(login(this.conferenceOwner)).with(csrf()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.abstractGroupUuid").value(poster.getUuid()))
        .andExpect(jsonPath("$.sortId").value((2 << 16) | 12))
        .andExpect(jsonPath("$.doi").value("10.1234/abc"));
    // move to another group
    this.mockMvc.perform(put("/api/abstracts/{uuid}/publication", abstract_.getUuid())
        .param("abstractGroupUuid", talk.getUuid()).param("number", "3")
        .with(login(this.conferenceOwner)).with(csrf()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.abstractGroupUuid").value(talk.getUuid()))
        .andExpect(jsonPath("$.sortId").value((1 << 16) | 3))
        .andExpect(jsonPath("$.doi").doesNotExist());
    // remove from groups
    this.mockMvc.perform(put("/api/abstracts/{uuid}/publication", abstract_.getUuid())
        .param("number", "5")
        .with(login(this.conferenceOwner)).with(csrf()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.abstractGroupUuid").doesNotExist())
        .andExpect(jsonPath("$.sortId").value(5));
  }

  @Test
  void ownerCannotAssignPublicationFields() throws Exception {
    Abstract abstract_ = this.testData.abstract_(this.conference, this.abstractOwner, AbstractState.ACCEPTED);
    this.mockMvc.perform(put("/api/abstracts/{uuid}/publication", abstract_.getUuid())
        .param("number", "1")
        .with(login(this.abstractOwner)).with(csrf()))
        .andExpect(status().isForbidden());
  }

  @Test
  void unpublishedAbstractIsHiddenFromOthers() throws Exception {
    Abstract abstract_ = this.testData.abstract_(this.conference, this.abstractOwner, AbstractState.SUBMITTED);
    this.mockMvc.perform(get("/api/abstracts/{uuid}", abstract_.getUuid()))
        .andExpect(status().isNotFound());
    this.mockMvc.perform(get("/api/abstracts/{uuid}", abstract_.getUuid()).with(login(this.abstractOwner)))
        .andExpect(status().isOk());
    this.mockMvc.perform(get("/api/abstracts/{uuid}", abstract_.getUuid()).with(login(this.conferenceOwner)))
        .andExpect(status().isOk());
  }

}
