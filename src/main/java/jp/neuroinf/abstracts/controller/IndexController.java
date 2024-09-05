package jp.neuroinf.abstracts.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class IndexController {

  @GetMapping("/{path:[^\\.]+}")
  public String index() {
    return "forward:/index.html";
  }

  @GetMapping("/conference/**")
  public String conferenceIndex() {
    return "forward:/index.html";
  }

  @GetMapping("/dashboard/**")
  public String dashboardIndex() {
    return "forward:/index.html";
  }

}
