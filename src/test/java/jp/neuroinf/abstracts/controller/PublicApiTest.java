package jp.neuroinf.abstracts.controller;

import static jp.neuroinf.abstracts.support.TestData.login;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.test.web.servlet.MockMvc;

import jp.neuroinf.abstracts.entity.Abstract;
import jp.neuroinf.abstracts.entity.AbstractState;
import jp.neuroinf.abstracts.entity.Account;
import jp.neuroinf.abstracts.entity.Banner;
import jp.neuroinf.abstracts.entity.Conference;
import jp.neuroinf.abstracts.entity.Figure;
import jp.neuroinf.abstracts.repository.AbstractRepository;
import jp.neuroinf.abstracts.repository.ConferenceRepository;
import jp.neuroinf.abstracts.support.IntegrationTest;
import jp.neuroinf.abstracts.support.TestData;
import tools.jackson.databind.json.JsonMapper;

/**
 * Read access without login, as used by the public conference pages.
 */
@IntegrationTest
class PublicApiTest {

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private TestData testData;

  @Autowired
  private ConferenceRepository conferenceRepository;

  @Autowired
  private JsonMapper jsonMapper;

  @Autowired
  private AbstractRepository abstractRepository;

  @Value("${app.path.banners}")
  private String pathBanners;

  @Value("${app.path.figures}")
  private String pathFigures;

  @Test
  void conferencesAreListedNewestFirst() throws Exception {
    Conference older = this.testData.conference("OLD", null);
    older.setStartDate(LocalDateTime.of(2020, 1, 1, 0, 0));
    this.conferenceRepository.saveAndFlush(older);
    this.testData.conference("NEW", null);
    // other tests may have left conferences, so compare the positions of these two
    String body = this.mockMvc.perform(get("/api/conferences"))
        .andExpect(status().isOk())
        .andReturn().getResponse().getContentAsString();
    List<String> shortNames = new ArrayList<>();
    this.jsonMapper.readTree(body).forEach(c -> shortNames.add(c.get("shortName").asString()));
    assertTrue(shortNames.indexOf("NEW") >= 0);
    assertTrue(shortNames.indexOf("NEW") < shortNames.indexOf("OLD"), shortNames.toString());
  }

  @Test
  void configTellsTheNormalMode() throws Exception {
    this.mockMvc.perform(get("/api/config"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.readOnly").value(false));
  }

  @Test
  void conferenceDetailMarksOwners() throws Exception {
    Account owner = this.testData.account("chair@example.com");
    Conference conference = this.testData.conference("DETAIL", owner);
    this.mockMvc.perform(get("/api/conferences/{uuid}", conference.getUuid()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.name").value("Conference DETAIL"))
        .andExpect(jsonPath("$.isOwner").value(false));
    this.mockMvc.perform(get("/api/conferences/{uuid}", conference.getUuid()).with(login(owner)))
        .andExpect(jsonPath("$.isOwner").value(true));
    this.mockMvc.perform(get("/api/conferences/{uuid}", "unknown"))
        .andExpect(status().isNotFound());
  }

  @Test
  void abstractsOfUnpublishedConferencesAreHidden() throws Exception {
    Account owner = this.testData.account("chair@example.com");
    Conference conference = this.testData.conference("UNPUBLISHED", owner);
    conference.setIsPublished(false);
    this.conferenceRepository.saveAndFlush(conference);
    Abstract abstract_ = this.testData.abstract_(conference, null, AbstractState.ACCEPTED);
    this.mockMvc.perform(get("/api/conferences/{uuid}/abstracts", conference.getUuid()))
        .andExpect(status().isNotFound());
    this.mockMvc.perform(get("/api/abstracts/{uuid}", abstract_.getUuid()))
        .andExpect(status().isNotFound());
    // owners preview them
    this.mockMvc.perform(get("/api/conferences/{uuid}/abstracts", conference.getUuid()).with(login(owner)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()").value(1));
    this.mockMvc.perform(get("/api/conferences/{uuid}/abstracts", "unknown"))
        .andExpect(status().isNotFound());
  }

  @Test
  void publishedAbstractShowsItsContent() throws Exception {
    Conference conference = this.testData.conference("PUBLISHED", null);
    Abstract abstract_ = this.testData.abstract_(conference, null, AbstractState.ACCEPTED);
    this.mockMvc.perform(get("/api/abstracts/{uuid}", abstract_.getUuid()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.title").value("Title"))
        .andExpect(jsonPath("$.authors[0].lastName").value("Author"))
        .andExpect(jsonPath("$.conferenceUuid").value(conference.getUuid()));
    this.mockMvc.perform(get("/api/abstracts/{uuid}", "unknown"))
        .andExpect(status().isNotFound());
  }

  @Test
  void bannersAreServed() throws Exception {
    Conference conference = this.testData.conference("BANNER", null);
    Banner banner = new Banner();
    banner.setType("logo");
    banner.setConference(conference);
    conference.getBanners().add(banner);
    this.conferenceRepository.flush();
    Files.createDirectories(Path.of(this.pathBanners));
    Files.write(Path.of(this.pathBanners, banner.getUuid()), new byte[] { 1, 2, 3 });
    this.mockMvc.perform(get("/api/banners/{uuid}", banner.getUuid()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.type").value("logo"));
    this.mockMvc.perform(get("/api/banners/{uuid}/image", banner.getUuid()))
        .andExpect(status().isOk())
        .andExpect(content().bytes(new byte[] { 1, 2, 3 }));
    this.mockMvc.perform(get("/api/banners/{uuid}", "unknown"))
        .andExpect(status().isNotFound());
    this.mockMvc.perform(get("/api/banners/{uuid}/image", "unknown"))
        .andExpect(status().isNotFound());
  }

  @Test
  void figuresFollowTheAccessOfTheirAbstract() throws Exception {
    Account author = this.testData.account("author@example.com");
    Conference conference = this.testData.conference("FIGURE", null);
    Abstract accepted = this.testData.abstract_(conference, author, AbstractState.ACCEPTED);
    Abstract submitted = this.testData.abstract_(conference, author, AbstractState.SUBMITTED);
    Figure publicFigure = addFigure(accepted);
    Figure privateFigure = addFigure(submitted);
    this.mockMvc.perform(get("/api/figures/{uuid}", publicFigure.getUuid()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.caption").value("Caption"));
    this.mockMvc.perform(get("/api/figures/{uuid}/image", publicFigure.getUuid()))
        .andExpect(status().isOk());
    this.mockMvc.perform(get("/api/figures/{uuid}", privateFigure.getUuid()))
        .andExpect(status().isNotFound());
    this.mockMvc.perform(get("/api/figures/{uuid}/image", privateFigure.getUuid()))
        .andExpect(status().isNotFound());
    this.mockMvc.perform(get("/api/figures/{uuid}/image", privateFigure.getUuid()).with(login(author)))
        .andExpect(status().isOk());
  }

  private Figure addFigure(Abstract abstract_) throws Exception {
    Figure figure = new Figure();
    figure.setCaption("Caption");
    figure.setPosition(0);
    figure.setAbstract_(abstract_);
    abstract_.getFigures().add(figure);
    this.abstractRepository.flush();
    Files.createDirectories(Path.of(this.pathFigures));
    Files.write(Path.of(this.pathFigures, figure.getUuid()), new byte[] { 1 });
    return figure;
  }

}
