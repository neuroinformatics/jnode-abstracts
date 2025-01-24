package jp.neuroinf.abstracts.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class IndexController {

  private static final String FORWARD_INDEX = "forward:/index.html";

  @GetMapping("/[^\\.]+")
  public String index() {
    return FORWARD_INDEX;
  }

  @GetMapping("/conference/**")
  public String conferenceIndex() {
    return FORWARD_INDEX;
  }

  @GetMapping("/dashboard/**")
  public String dashboardIndex() {
    return FORWARD_INDEX;
  }

}
