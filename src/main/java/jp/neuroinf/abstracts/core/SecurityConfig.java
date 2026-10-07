package jp.neuroinf.abstracts.core;

import java.io.IOException;
import java.time.ZonedDateTime;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpOutputMessage;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.JacksonJsonHttpMessageConverter;
import org.springframework.http.server.ServletServerHttpResponse;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.authentication.logout.LogoutSuccessHandler;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import tools.jackson.databind.json.JsonMapper;

@Configuration
@EnableWebSecurity
public class SecurityConfig
    implements AuthenticationSuccessHandler, AuthenticationFailureHandler, LogoutSuccessHandler {

  private static final String LOGIN_API_URL = "/api/login";
  private static final String LOGOUT_API_URL = "/api/logout";
  private static final String LOGIN_PAGE_URL = "/login";

  private final JacksonJsonHttpMessageConverter httpMessageConverter;

  public SecurityConfig(JsonMapper jsonMapper) {
    this.httpMessageConverter = new JacksonJsonHttpMessageConverter(jsonMapper);
  }

  @Bean
  public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }

  @Bean
  public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http.csrf((csrf) -> csrf.spa())
        .authorizeHttpRequests((authorize) -> authorize
            .anyRequest().permitAll())
        .formLogin((login) -> login
            .loginPage(LOGIN_PAGE_URL)
            .loginProcessingUrl(LOGIN_API_URL).permitAll()
            .usernameParameter("username")
            .passwordParameter("password")
            .successHandler(this)
            .failureHandler(this))
        .logout((logout) -> logout
            .logoutUrl(LOGOUT_API_URL)
            .logoutSuccessHandler(this));
    return http.build();
  }

  @Override
  public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
      Authentication authentication) throws IOException, ServletException {
    RestSuccessResponseBody body = new RestSuccessResponseBody("success");
    HttpOutputMessage outputMessage = new ServletServerHttpResponse(response);
    response.setStatus(HttpStatus.OK.value());
    httpMessageConverter.write(body, MediaType.APPLICATION_JSON, outputMessage);
  }

  @Override
  public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response,
      AuthenticationException exception) throws IOException, ServletException {
    HttpOutputMessage outputMessage = new ServletServerHttpResponse(response);
    HttpStatus status = HttpStatus.UNAUTHORIZED;
    RestErrorResponseBody body = new RestErrorResponseBody();
    body.setTimestamp(ZonedDateTime.now());
    body.setCode(status.value());
    body.setMessage(status.getReasonPhrase());
    body.setPath(LOGIN_API_URL);
    response.setStatus(status.value());
    httpMessageConverter.write(body, MediaType.APPLICATION_JSON, outputMessage);
  }

  @Override
  public void onLogoutSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication)
      throws IOException {
    RestSuccessResponseBody body = new RestSuccessResponseBody("success");
    HttpOutputMessage outputMessage = new ServletServerHttpResponse(response);
    response.setStatus(HttpStatus.OK.value());
    httpMessageConverter.write(body, MediaType.APPLICATION_JSON, outputMessage);
  }

}
