package jp.neuroinf.abstracts.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class IndexController {

  private static final String FORWARD_INDEX = "forward:/index.html";

  // single segment paths without a dot (e.g. /login), as files like /favicon.ico are served as they are
  @GetMapping("/{path:[^\\.]+}")
  public String index() {
    return FORWARD_INDEX;
  }

  @GetMapping({"/conference/**", "/dashboard/**", "/myabstracts/**", "/abstracts/**"})
  public String applicationIndex() {
    return FORWARD_INDEX;
  }

}
