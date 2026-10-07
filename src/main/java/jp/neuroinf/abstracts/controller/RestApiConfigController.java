package jp.neuroinf.abstracts.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jp.neuroinf.abstracts.core.AppProperties;
import jp.neuroinf.abstracts.dto.ConfigDto;

@RestController
@RequestMapping("/api/config")
public class RestApiConfigController {

  private final AppProperties appProperties;

  public RestApiConfigController(AppProperties appProperties) {
    this.appProperties = appProperties;
  }

  @GetMapping("")
  public ConfigDto retrieveConfig() {
    return new ConfigDto(this.appProperties.getReadOnly());
  }

}
