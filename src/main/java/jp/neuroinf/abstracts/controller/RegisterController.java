package jp.neuroinf.abstracts.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.servlet.ModelAndView;

import jp.neuroinf.abstracts.dto.AccountDto;
import jp.neuroinf.abstracts.entity.Account;
import jp.neuroinf.abstracts.service.AccountService;

@Controller
public class RegisterController {

  @Autowired
  private AccountService userService;

  @GetMapping("/register")
  public ModelAndView registerForm() {
    ModelAndView mav = new ModelAndView();
    mav.addObject("user", new AccountDto());
    mav.setViewName("register");
    return mav;
  }

  @PostMapping("/register")
  public String register(@ModelAttribute AccountDto accountDto) {
    Account existing = userService.findByEmail(accountDto.getMail());
    System.out.println(existing);
    if (existing != null) {
      return "register";
    }
    userService.create(accountDto);
    return "login";
  }
}
