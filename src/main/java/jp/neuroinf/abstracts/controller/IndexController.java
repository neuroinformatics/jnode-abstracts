package jp.neuroinf.abstracts.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class IndexController {

  @GetMapping("/{path:(?!api)[^\\.]*}")
  public String index() {
    return "forward:/index.html";
  }

}
