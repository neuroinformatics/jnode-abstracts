package jp.neuroinf.abstracts.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.context.SecurityContextHolderStrategy;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.Data;

@Data
class LoginRequestParams {
  String username;
  String password;
}

@RestController
public class RestApiLoginController {

  private SecurityContextRepository securityContextRepository = new HttpSessionSecurityContextRepository();
  private SecurityContextHolderStrategy securityContextHolderStrategy = SecurityContextHolder
      .getContextHolderStrategy();

  @Autowired
  private DaoAuthenticationProvider daoAuthenticationProvider;

  @PostMapping("/api/login2")
  public void login(
      @RequestBody LoginRequestParams loginRequestParams,
      HttpServletRequest request,
      HttpServletResponse response) {
    UsernamePasswordAuthenticationToken token = UsernamePasswordAuthenticationToken.unauthenticated(
        loginRequestParams.getUsername(), loginRequestParams.getPassword());
    Authentication authentication = daoAuthenticationProvider.authenticate(token);
    SecurityContext context = securityContextHolderStrategy.createEmptyContext();
    context.setAuthentication(authentication);
    securityContextHolderStrategy.setContext(context);
    securityContextRepository.saveContext(context, request, response);
  }

}
