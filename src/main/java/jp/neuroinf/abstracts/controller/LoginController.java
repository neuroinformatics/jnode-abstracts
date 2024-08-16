package jp.neuroinf.abstracts.controller;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class LoginController {

  @GetMapping("/")
  public String redirectToIndex() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    if (authentication != null && authentication.isAuthenticated()) {
      return "redirect:/index";
    }
    return "redirect:/login";
  }

  @GetMapping("/login")
  public String login() {
    return "login";
  }

  @GetMapping("/index")
  public String index() {
    return "index";
  }

}
