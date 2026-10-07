package jp.neuroinf.abstracts.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.forwardedUrl;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import jakarta.servlet.RequestDispatcher;
import jp.neuroinf.abstracts.support.IntegrationTest;

/**
 * Paths of the single page application are answered with its index page, and API errors with a JSON body.
 */
@IntegrationTest
class RoutingTest {

  @Autowired
  private MockMvc mockMvc;

  @ParameterizedTest
  @ValueSource(strings = { "/conferences", "/login", "/conference/TEST2026", "/conference/TEST2026/abstracts",
      "/dashboard/conference", "/dashboard/conference/uuid/abstracts", "/myabstracts", "/myabstracts/uuid/edit",
      "/abstracts/uuid", "/favouriteabstracts" })
  void applicationPathsServeTheIndexPage(String path) throws Exception {
    this.mockMvc.perform(get(path).accept(MediaType.TEXT_HTML))
        .andExpect(status().isOk())
        .andExpect(forwardedUrl("/index.html"));
  }

  @ParameterizedTest
  @ValueSource(strings = { "/favicon.ico", "/api/unknown" })
  void filesAndApiPathsAreNotForwarded(String path) throws Exception {
    this.mockMvc.perform(get(path).accept(MediaType.TEXT_HTML))
        .andExpect(forwardedUrl(null));
  }

  @Test
  void apiErrorsHaveAJsonBody() throws Exception {
    this.mockMvc.perform(get("/error")
        .requestAttr(RequestDispatcher.ERROR_STATUS_CODE, 404)
        .requestAttr(RequestDispatcher.ERROR_REQUEST_URI, "/api/unknown")
        .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.code").value(404))
        .andExpect(jsonPath("$.message").value("Not Found"))
        .andExpect(jsonPath("$.path").value("/api/unknown"));
  }

  @Test
  void htmlErrorsServeTheIndexPage() throws Exception {
    this.mockMvc.perform(get("/error")
        .requestAttr(RequestDispatcher.ERROR_STATUS_CODE, 404)
        .requestAttr(RequestDispatcher.ERROR_REQUEST_URI, "/unknown/page")
        .accept(MediaType.TEXT_HTML))
        .andExpect(forwardedUrl("/index.html"));
  }

}
