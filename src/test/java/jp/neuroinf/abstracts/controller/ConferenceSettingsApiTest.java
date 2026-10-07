package jp.neuroinf.abstracts.controller;

import static jp.neuroinf.abstracts.support.TestData.login;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpMethod;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMultipartHttpServletRequestBuilder;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import jp.neuroinf.abstracts.entity.Abstract;
import jp.neuroinf.abstracts.entity.AbstractState;
import jp.neuroinf.abstracts.entity.Account;
import jp.neuroinf.abstracts.entity.Conference;
import jp.neuroinf.abstracts.support.IntegrationTest;
import jp.neuroinf.abstracts.support.TestData;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

/**
 * Runs each request in its own transaction like in production, as saving the settings replaces child entities.
 */
@IntegrationTest
@Transactional(propagation = Propagation.NOT_SUPPORTED)
class ConferenceSettingsApiTest {

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private TestData testData;

  @Autowired
  private JsonMapper jsonMapper;

  private Account owner;
  private Conference conference;
  private String shortName;

  @BeforeEach
  void setUp() {
    String suffix = UUID.randomUUID().toString().substring(0, 8);
    this.owner = this.testData.account("chair-" + suffix + "@example.com");
    this.shortName = "S" + suffix;
    this.conference = this.testData.conference(this.shortName, this.owner);
  }

  private JsonNode retrieve() throws Exception {
    String body = this.mockMvc.perform(get("/api/conferences/{uuid}", this.conference.getUuid())
        .with(login(this.owner))).andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
    return this.jsonMapper.readTree(body);
  }

  private MockMultipartHttpServletRequestBuilder general(String name) {
    return general(name, this.shortName);
  }

  private MockMultipartHttpServletRequestBuilder general(String name, String shortName) {
    MockMultipartHttpServletRequestBuilder builder = multipart(HttpMethod.PUT, "/api/conferences/{uuid}",
        this.conference.getUuid());
    builder.param("isOpen", "1").param("isPublished", "0").param("isActive", "1")
        .param("name", name).param("shortName", shortName)
        .param("startDate", "2026-11-01T00:00:00").param("endDate", "2026-11-03T00:00:00")
        .param("deadline", "2026-10-15T00:00:00").param("hasPresentationPrefs", "0")
        .param("abstractMaxLength", "3000").param("abstractMaxFigures", "2");
    return builder;
  }

  @Test
  void generalSettingsKeepExistingTopics() throws Exception {
    this.mockMvc.perform(general("Renamed")
        .param("topics[0].position", "0").param("topics[0].topic", "Vision")
        .param("topics[1].position", "1").param("topics[1].topic", "Motor")
        .with(login(this.owner)).with(csrf()))
        .andExpect(status().isOk());
    JsonNode saved = retrieve();
    String visionUuid = saved.get("topics").get(0).get("uuid").asString();
    String motorUuid = saved.get("topics").get(1).get("uuid").asString();
    // reorder the existing topics and add one
    this.mockMvc.perform(general("Renamed again")
        .param("topics[0].uuid", motorUuid).param("topics[0].position", "0").param("topics[0].topic", "Motor")
        .param("topics[1].uuid", visionUuid).param("topics[1].position", "1").param("topics[1].topic", "Vision")
        .param("topics[2].position", "2").param("topics[2].topic", "Memory")
        .with(login(this.owner)).with(csrf()))
        .andExpect(status().isOk());
    this.mockMvc.perform(get("/api/conferences/{uuid}", this.conference.getUuid()))
        .andExpect(jsonPath("$.name").value("Renamed again"))
        .andExpect(jsonPath("$.abstractMaxLength").value(3000))
        .andExpect(jsonPath("$.topics.length()").value(3))
        .andExpect(jsonPath("$.topics[0].topic").value("Motor"))
        .andExpect(jsonPath("$.topics[2].topic").value("Memory"));
  }

  @Test
  void generalSettingsUploadAndRemoveLogo() throws Exception {
    MockMultipartFile logo = new MockMultipartFile("logoFile", "logo.png", "image/png", new byte[] { 1, 2, 3 });
    this.mockMvc.perform(general("With logo").file(logo).with(login(this.owner)).with(csrf()))
        .andExpect(status().isOk());
    JsonNode saved = retrieve();
    String bannerUuid = saved.get("banners").get(0).get("uuid").asString();
    this.mockMvc.perform(get("/api/banners/{uuid}/image", bannerUuid)).andExpect(status().isOk());
    // keep the logo
    this.mockMvc.perform(general("Keep logo").param("logoUuid", bannerUuid).with(login(this.owner)).with(csrf()))
        .andExpect(status().isOk());
    this.mockMvc.perform(get("/api/conferences/{uuid}", this.conference.getUuid()))
        .andExpect(jsonPath("$.banners.length()").value(1));
    // remove the logo
    this.mockMvc.perform(general("No logo").with(login(this.owner)).with(csrf()))
        .andExpect(status().isOk());
    this.mockMvc.perform(get("/api/conferences/{uuid}", this.conference.getUuid()))
        .andExpect(jsonPath("$.banners.length()").value(0));
  }

  @Test
  void generalSettingsRejectTakenShortName() throws Exception {
    this.testData.conference("T" + this.shortName, null);
    this.mockMvc.perform(general("Taken", "T" + this.shortName).with(login(this.owner)).with(csrf()))
        .andExpect(status().isBadRequest());
    // surrounding spaces do not get past the check
    this.mockMvc.perform(general("Taken", " T" + this.shortName + " ").with(login(this.owner)).with(csrf()))
        .andExpect(status().isBadRequest());
  }

  @Test
  void abstractGroupsCanBeEditedWhileInUse() throws Exception {
    this.mockMvc.perform(put("/api/conferences/{uuid}/abstractGroups", this.conference.getUuid())
        .param("abstractGroups[0].name", "Posters").param("abstractGroups[0].prefix", "2")
        .param("abstractGroups[0].shortName", "P")
        .with(login(this.owner)).with(csrf()))
        .andExpect(status().isOk());
    String groupUuid = retrieve().get("abstractGroups").get(0).get("uuid").asString();
    Abstract abstract_ = this.testData.abstract_(this.conference, null, AbstractState.ACCEPTED);
    this.mockMvc.perform(put("/api/abstracts/{uuid}/publication", abstract_.getUuid())
        .param("abstractGroupUuid", groupUuid).param("number", "1")
        .with(login(this.owner)).with(csrf()))
        .andExpect(status().isOk());
    // rename the group in use and add another one
    this.mockMvc.perform(put("/api/conferences/{uuid}/abstractGroups", this.conference.getUuid())
        .param("abstractGroups[0].uuid", groupUuid).param("abstractGroups[0].name", "Poster session")
        .param("abstractGroups[0].prefix", "2").param("abstractGroups[0].shortName", "P")
        .param("abstractGroups[1].name", "Talks").param("abstractGroups[1].prefix", "1")
        .param("abstractGroups[1].shortName", "T")
        .with(login(this.owner)).with(csrf()))
        .andExpect(status().isOk());
    this.mockMvc.perform(get("/api/conferences/{uuid}", this.conference.getUuid()))
        .andExpect(jsonPath("$.abstractGroups.length()").value(2))
        .andExpect(jsonPath("$.abstractGroups[1].name").value("Poster session"));
    this.mockMvc.perform(get("/api/abstracts/{uuid}", abstract_.getUuid()).with(login(this.owner)))
        .andExpect(jsonPath("$.abstractGroupUuid").value(groupUuid));
    // deleting the group in use is refused
    this.mockMvc.perform(put("/api/conferences/{uuid}/abstractGroups", this.conference.getUuid())
        .with(login(this.owner)).with(csrf()))
        .andExpect(status().isForbidden());
  }

  @Test
  void allUnusedAbstractGroupsCanBeDeleted() throws Exception {
    this.mockMvc.perform(put("/api/conferences/{uuid}/abstractGroups", this.conference.getUuid())
        .param("abstractGroups[0].name", "Posters").param("abstractGroups[0].prefix", "2")
        .param("abstractGroups[0].shortName", "P")
        .with(login(this.owner)).with(csrf()))
        .andExpect(status().isOk());
    this.mockMvc.perform(put("/api/conferences/{uuid}/abstractGroups", this.conference.getUuid())
        .with(login(this.owner)).with(csrf()))
        .andExpect(status().isOk());
    this.mockMvc.perform(get("/api/conferences/{uuid}", this.conference.getUuid()))
        .andExpect(jsonPath("$.abstractGroups.length()").value(0));
  }

  @Test
  void geoScheduleAndInfoAreSaved() throws Exception {
    this.mockMvc.perform(put("/api/conferences/{uuid}/geo", this.conference.getUuid())
        .param("geo", "{\"type\":\"FeatureCollection\",\"features\":[]}")
        .with(login(this.owner)).with(csrf()))
        .andExpect(status().isOk());
    this.mockMvc.perform(put("/api/conferences/{uuid}/schedule", this.conference.getUuid())
        .param("schedule", "[]")
        .with(login(this.owner)).with(csrf()))
        .andExpect(status().isOk());
    this.mockMvc.perform(put("/api/conferences/{uuid}/info", this.conference.getUuid())
        .param("info", "# Info")
        .with(login(this.owner)).with(csrf()))
        .andExpect(status().isOk());
    this.mockMvc.perform(get("/api/conferences/{uuid}", this.conference.getUuid()))
        .andExpect(jsonPath("$.geo").value("{\"type\":\"FeatureCollection\",\"features\":[]}"))
        .andExpect(jsonPath("$.schedule").value("[]"))
        .andExpect(jsonPath("$.info").value("# Info"));
  }

  @Test
  void ownersAreReplaced() throws Exception {
    Account other = this.testData.account("co-" + this.shortName + "@example.com");
    this.mockMvc.perform(put("/api/conferences/{uuid}/owners", this.conference.getUuid())
        .param("owners", this.owner.getMail()).param("owners", other.getMail())
        .with(login(this.owner)).with(csrf()))
        .andExpect(status().isOk());
    this.mockMvc.perform(get("/api/conferences/{uuid}", this.conference.getUuid()).with(login(other)))
        .andExpect(jsonPath("$.owners.length()").value(2));
    this.mockMvc.perform(put("/api/conferences/{uuid}/owners", this.conference.getUuid())
        .param("owners", other.getMail())
        .with(login(this.owner)).with(csrf()))
        .andExpect(status().isForbidden());
  }

  @Test
  void abstractGroupPrefixesFitTheSortIds() throws Exception {
    this.mockMvc.perform(put("/api/conferences/{uuid}/abstractGroups", this.conference.getUuid())
        .param("abstractGroups[0].name", "Big").param("abstractGroups[0].prefix", String.valueOf(0x8000))
        .param("abstractGroups[0].shortName", "B")
        .with(login(this.owner)).with(csrf()))
        .andExpect(status().isBadRequest());
  }

  @ParameterizedTest
  @ValueSource(strings = { "abstractGroups", "geo", "schedule", "info", "owners" })
  void settingsAreChangedByManagersOnly(String setting) throws Exception {
    Account other = this.testData.account("other-" + this.shortName + "@example.com");
    String path = "/api/conferences/{uuid}/" + setting;
    this.mockMvc.perform(put(path, this.conference.getUuid())
        .param("geo", "").param("schedule", "").param("info", "").param("owners", other.getMail())
        .with(login(other)).with(csrf()))
        .andExpect(status().isForbidden());
    this.mockMvc.perform(put(path, this.conference.getUuid())
        .param("geo", "").param("schedule", "").param("info", "").param("owners", other.getMail())
        .with(csrf()))
        .andExpect(status().isUnauthorized());
  }

  @Test
  void generalSettingsAreChangedByManagersOnly() throws Exception {
    Account other = this.testData.account("other-" + this.shortName + "@example.com");
    this.mockMvc.perform(general("Hijacked").with(login(other)).with(csrf()))
        .andExpect(status().isForbidden());
    this.mockMvc.perform(general("Hijacked").with(csrf()))
        .andExpect(status().isUnauthorized());
    this.mockMvc.perform(get("/api/conferences/{uuid}", this.conference.getUuid()))
        .andExpect(jsonPath("$.name").value("Conference " + this.shortName));
  }

}
