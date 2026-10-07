package jp.neuroinf.abstracts.controller;

import static jp.neuroinf.abstracts.support.TestData.login;
import static org.hamcrest.Matchers.containsString;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.io.File;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import jp.neuroinf.abstracts.entity.Account;
import jp.neuroinf.abstracts.entity.Conference;
import jp.neuroinf.abstracts.entity.Topic;
import jp.neuroinf.abstracts.repository.ConferenceRepository;
import jp.neuroinf.abstracts.support.IntegrationTest;
import jp.neuroinf.abstracts.support.TestData;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

/**
 * Runs each request in its own transaction like in production, as saving an abstract replaces child entities.
 */
@IntegrationTest
@Transactional(propagation = Propagation.NOT_SUPPORTED)
class SubmissionApiTest {

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private TestData testData;

  @Autowired
  private JsonMapper jsonMapper;

  @Autowired
  private ConferenceRepository conferenceRepository;

  @Value("${app.path.figures}")
  private String pathFigures;

  private Account author;
  private Account chair;
  private Conference conference;

  @BeforeEach
  void setUp() {
    String suffix = UUID.randomUUID().toString().substring(0, 8);
    this.author = this.testData.account("author-" + suffix + "@example.com");
    this.chair = this.testData.account("chair-" + suffix + "@example.com");
    this.conference = this.testData.conference("C" + suffix, this.chair);
    Topic topic = new Topic();
    topic.setPosition(0);
    topic.setTopic("Vision");
    topic.setConference(this.conference);
    this.conference.getTopics().add(topic);
    this.conference.setAbstractMaxLength(100);
    this.conference = this.conferenceRepository.saveAndFlush(this.conference);
  }

  private static Map<String, Object> content(String title, String text) {
    return Map.of(
        "title", title,
        "text", text,
        "topic", "Vision",
        "authors", List.of(
            Map.of("firstName", "Alice", "lastName", "Author", "affiliations", List.of(1)),
            Map.of("firstName", "Bob", "lastName", "Builder", "affiliations", List.of(0, 1))),
        "affiliations", List.of(
            Map.of("department", "Second Institute", "country", "Japan"),
            Map.of("department", "First Institute", "country", "Germany")),
        "references", List.of(Map.of("text", "A paper", "doi", "10.1/x")));
  }

  private String create(Map<String, Object> content) throws Exception {
    String body = this.mockMvc.perform(post("/api/conferences/{uuid}/abstracts", this.conference.getUuid())
        .contentType(MediaType.APPLICATION_JSON).content(this.jsonMapper.writeValueAsString(content))
        .with(login(this.author)).with(csrf()))
        .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
    return this.jsonMapper.readTree(body).get("uuid").asString();
  }

  @Test
  void createdAbstractIsInPreparationAndOwnedByAuthor() throws Exception {
    String uuid = create(content("Title", "Text"));
    this.mockMvc.perform(get("/api/abstracts/{uuid}", uuid).with(login(this.author)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.state").value("InPreparation"))
        .andExpect(jsonPath("$.owners[0].mail").value(this.author.getMail()))
        .andExpect(jsonPath("$.stateLogs[0].note").value("Initial abstract creation"))
        // affiliations are numbered in the order the authors refer to them
        .andExpect(jsonPath("$.affiliations[0].department").value("First Institute"))
        .andExpect(jsonPath("$.affiliations[0].position").value(0))
        .andExpect(jsonPath("$.authors[1].affiliationUuids.length()").value(2))
        .andExpect(jsonPath("$.references[0].doi").value("10.1/x"));
    this.mockMvc.perform(get("/api/users/current/abstracts").with(login(this.author)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].uuid").value(uuid));
    this.mockMvc.perform(get("/api/users/current/abstracts").with(login(this.chair)))
        .andExpect(jsonPath("$.length()").value(0));
  }

  @Test
  void createIsRefusedWhileConferenceIsClosed() throws Exception {
    this.conference.setIsOpen(false);
    this.conferenceRepository.saveAndFlush(this.conference);
    this.mockMvc.perform(post("/api/conferences/{uuid}/abstracts", this.conference.getUuid())
        .contentType(MediaType.APPLICATION_JSON).content(this.jsonMapper.writeValueAsString(content("T", "X")))
        .with(login(this.author)).with(csrf()))
        .andExpect(status().isForbidden());
  }

  @Test
  void contentIsValidated() throws Exception {
    this.mockMvc.perform(post("/api/conferences/{uuid}/abstracts", this.conference.getUuid())
        .contentType(MediaType.APPLICATION_JSON)
        .content(this.jsonMapper.writeValueAsString(content("Title", "x".repeat(101))))
        .with(login(this.author)).with(csrf()))
        .andExpect(status().isBadRequest());
    Map<String, Object> badTopic = new java.util.HashMap<>(content("Title", "Text"));
    badTopic.put("topic", "Unknown");
    this.mockMvc.perform(post("/api/conferences/{uuid}/abstracts", this.conference.getUuid())
        .contentType(MediaType.APPLICATION_JSON).content(this.jsonMapper.writeValueAsString(badTopic))
        .with(login(this.author)).with(csrf()))
        .andExpect(status().isBadRequest());
  }

  @Test
  void ownerEditsWhileInPreparationOnly() throws Exception {
    String uuid = create(content("Title", "Text"));
    Map<String, Object> edited = new java.util.HashMap<>(content("New title", "New text"));
    edited.put("authors", List.of(Map.of("firstName", "Carol", "lastName", "Solo", "affiliations", List.of(0))));
    this.mockMvc.perform(put("/api/abstracts/{uuid}", uuid)
        .contentType(MediaType.APPLICATION_JSON).content(this.jsonMapper.writeValueAsString(edited))
        .with(login(this.author)).with(csrf()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.title").value("New title"))
        .andExpect(jsonPath("$.authors.length()").value(1))
        // the unused affiliation is kept after the used one
        .andExpect(jsonPath("$.affiliations[0].department").value("Second Institute"))
        .andExpect(jsonPath("$.affiliations.length()").value(2));
    this.mockMvc.perform(put("/api/abstracts/{uuid}/state", uuid).param("state", "Submitted")
        .with(login(this.author)).with(csrf()))
        .andExpect(status().isOk());
    this.mockMvc.perform(put("/api/abstracts/{uuid}", uuid)
        .contentType(MediaType.APPLICATION_JSON).content(this.jsonMapper.writeValueAsString(edited))
        .with(login(this.author)).with(csrf()))
        .andExpect(status().isForbidden());
    // managers can still correct it
    this.mockMvc.perform(put("/api/abstracts/{uuid}", uuid)
        .contentType(MediaType.APPLICATION_JSON).content(this.jsonMapper.writeValueAsString(edited))
        .with(login(this.chair)).with(csrf()))
        .andExpect(status().isOk());
  }

  @Test
  void incompleteAbstractCannotBeSubmitted() throws Exception {
    Map<String, Object> incomplete = new java.util.HashMap<>(content("Title", " "));
    incomplete.put("topic", null);
    String uuid = create(incomplete);
    this.mockMvc.perform(put("/api/abstracts/{uuid}/state", uuid).param("state", "Submitted")
        .with(login(this.author)).with(csrf()))
        .andExpect(status().isBadRequest())
        .andExpect(status().reason(containsString("the text is empty")))
        .andExpect(status().reason(containsString("no topic is selected")));
  }

  @Test
  void ownerDeletesOnlyBeforeSubmission() throws Exception {
    String draft = create(content("Draft", "Text"));
    this.mockMvc.perform(delete("/api/abstracts/{uuid}", draft).with(login(this.author)).with(csrf()))
        .andExpect(status().isOk());
    this.mockMvc.perform(get("/api/abstracts/{uuid}", draft).with(login(this.author)))
        .andExpect(status().isNotFound());
    String submitted = create(content("Submitted", "Text"));
    this.mockMvc.perform(put("/api/abstracts/{uuid}/state", submitted).param("state", "Submitted")
        .with(login(this.author)).with(csrf()))
        .andExpect(status().isOk());
    this.mockMvc.perform(delete("/api/abstracts/{uuid}", submitted).with(login(this.author)).with(csrf()))
        .andExpect(status().isForbidden());
    this.mockMvc.perform(delete("/api/abstracts/{uuid}", submitted).with(login(this.chair)).with(csrf()))
        .andExpect(status().isOk());
  }

  @Test
  void ownersAreManagedByOwners() throws Exception {
    String uuid = create(content("Title", "Text"));
    Account coAuthor = this.testData.account("co-" + this.conference.getShortName() + "@example.com");
    this.mockMvc.perform(put("/api/abstracts/{uuid}/owners", uuid)
        .param("owners", this.author.getMail()).param("owners", coAuthor.getMail())
        .with(login(this.author)).with(csrf()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.owners.length()").value(2));
    this.mockMvc.perform(get("/api/abstracts/{uuid}", uuid).with(login(coAuthor)))
        .andExpect(status().isOk());
    this.mockMvc.perform(put("/api/abstracts/{uuid}/owners", uuid)
        .param("owners", coAuthor.getMail())
        .with(login(this.author)).with(csrf()))
        .andExpect(status().isForbidden());
    this.mockMvc.perform(put("/api/abstracts/{uuid}/owners", uuid)
        .param("owners", "nobody@example.com")
        .with(login(this.author)).with(csrf()))
        .andExpect(status().isNotFound());
  }

  @Test
  void figuresAreUploadedUpToTheLimit() throws Exception {
    String uuid = create(content("Title", "Text"));
    MockMultipartFile png = new MockMultipartFile("file", "fig.png", "image/png", new byte[] { 1, 2, 3 });
    String body = this.mockMvc.perform(multipart("/api/abstracts/{uuid}/figures", uuid).file(png)
        .param("caption", "First figure")
        .with(login(this.author)).with(csrf()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.figures[0].caption").value("First figure"))
        .andReturn().getResponse().getContentAsString();
    JsonNode abstract_ = this.jsonMapper.readTree(body);
    String figureUuid = abstract_.get("figures").get(0).get("uuid").asString();
    assertTrue(new File(this.pathFigures, figureUuid).exists());
    this.mockMvc.perform(get("/api/figures/{uuid}/image", figureUuid).with(login(this.author)))
        .andExpect(status().isOk());
    // the conference allows a single figure
    this.mockMvc.perform(multipart("/api/abstracts/{uuid}/figures", uuid).file(png).param("caption", "Second")
        .with(login(this.author)).with(csrf()))
        .andExpect(status().isBadRequest());
    this.mockMvc.perform(put("/api/figures/{uuid}", figureUuid).param("caption", "Renamed")
        .with(login(this.author)).with(csrf()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.figures[0].caption").value("Renamed"));
    this.mockMvc.perform(delete("/api/figures/{uuid}", figureUuid).with(login(this.author)).with(csrf()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.figures.length()").value(0));
    assertFalse(new File(this.pathFigures, figureUuid).exists());
  }

  @Test
  void figuresMustBeImages() throws Exception {
    String uuid = create(content("Title", "Text"));
    MockMultipartFile pdf = new MockMultipartFile("file", "fig.pdf", "application/pdf", new byte[] { 1 });
    this.mockMvc.perform(multipart("/api/abstracts/{uuid}/figures", uuid).file(pdf).param("caption", "PDF")
        .with(login(this.author)).with(csrf()))
        .andExpect(status().isBadRequest());
  }

  @Test
  void authorChoosesPresentationGroupWhenAsked() throws Exception {
    this.conference.setHasPresentationPrefs(true);
    this.conferenceRepository.saveAndFlush(this.conference);
    String body = this.mockMvc.perform(put("/api/conferences/{uuid}/abstractGroups", this.conference.getUuid())
        .param("abstractGroups[0].name", "Talks").param("abstractGroups[0].prefix", "1")
        .param("abstractGroups[0].shortName", "T")
        .with(login(this.chair)).with(csrf()))
        .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
    String groupUuid = this.jsonMapper.readTree(this.mockMvc.perform(get("/api/conferences/{uuid}",
        this.conference.getUuid())).andReturn().getResponse().getContentAsString())
        .get("abstractGroups").get(0).get("uuid").asString();
    body.length();
    Map<String, Object> withGroup = new java.util.HashMap<>(content("Title", "Text"));
    withGroup.put("abstractGroupUuid", groupUuid);
    withGroup.put("reasonForTalk", "New results");
    String uuid = create(withGroup);
    this.mockMvc.perform(get("/api/abstracts/{uuid}", uuid).with(login(this.author)))
        .andExpect(jsonPath("$.abstractGroupUuid").value(groupUuid))
        .andExpect(jsonPath("$.reasonForTalk").value("New results"));
  }

  @Test
  void changingThePresentationTypeKeepsTheNumber() throws Exception {
    this.conference.setHasPresentationPrefs(true);
    this.conferenceRepository.saveAndFlush(this.conference);
    this.mockMvc.perform(put("/api/conferences/{uuid}/abstractGroups", this.conference.getUuid())
        .param("abstractGroups[0].name", "Talks").param("abstractGroups[0].prefix", "1")
        .param("abstractGroups[0].shortName", "T")
        .param("abstractGroups[1].name", "Posters").param("abstractGroups[1].prefix", "2")
        .param("abstractGroups[1].shortName", "P")
        .with(login(this.chair)).with(csrf()))
        .andExpect(status().isOk());
    JsonNode groups = this.jsonMapper.readTree(this.mockMvc.perform(get("/api/conferences/{uuid}",
        this.conference.getUuid())).andReturn().getResponse().getContentAsString()).get("abstractGroups");
    String talk = groups.get(0).get("uuid").asString();
    String poster = groups.get(1).get("uuid").asString();
    String uuid = create(content("Title", "Text"));
    this.mockMvc.perform(put("/api/abstracts/{uuid}/publication", uuid)
        .param("abstractGroupUuid", poster).param("number", "15")
        .with(login(this.chair)).with(csrf()))
        .andExpect(status().isOk());
    Map<String, Object> edited = new java.util.HashMap<>(content("Title", "Text"));
    edited.put("abstractGroupUuid", talk);
    this.mockMvc.perform(put("/api/abstracts/{uuid}", uuid)
        .contentType(MediaType.APPLICATION_JSON).content(this.jsonMapper.writeValueAsString(edited))
        .with(login(this.author)).with(csrf()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.abstractGroupUuid").value(talk))
        .andExpect(jsonPath("$.sortId").value((1 << 16) | 15));
  }

  @Test
  void ownerMailsAreComparedIgnoringCase() throws Exception {
    String uuid = create(content("Title", "Text"));
    this.mockMvc.perform(put("/api/abstracts/{uuid}/owners", uuid)
        .param("owners", this.author.getMail()).param("owners", this.author.getMail().toUpperCase())
        .with(login(this.author)).with(csrf()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.owners.length()").value(1));
  }

}
