package jp.neuroinf.abstracts.core;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpOutputMessage;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
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

@Configuration
@EnableWebSecurity
public class SecurityConfig
    implements AuthenticationSuccessHandler, AuthenticationFailureHandler, LogoutSuccessHandler {

  private final MappingJackson2HttpMessageConverter httpMessageConverter;

  @Autowired
  public SecurityConfig(MappingJackson2HttpMessageConverter httpMessageConverter) {
    this.httpMessageConverter = httpMessageConverter;
  }

  @Bean
  public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }

  @Bean
  public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http.csrf((csrf) -> csrf.disable())
        .authorizeHttpRequests((authorize) -> authorize
            .anyRequest().permitAll())
        .formLogin((login) -> login
            .loginPage("/login")
            .loginProcessingUrl("/api/login").permitAll()
            .usernameParameter("username")
            .passwordParameter("password")
            .successHandler(this)
            .failureHandler(this))
        .logout((logout) -> logout
            .logoutUrl("/api/logout")
            .logoutSuccessHandler(this));
    return http.build();
  }

  @Override
  public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
      Authentication authentication) throws IOException, ServletException {
    AuthResultBody body = new AuthResultBody("success");
    HttpOutputMessage outputMessage = new ServletServerHttpResponse(response);
    response.setStatus(HttpStatus.OK.value());
    httpMessageConverter.write(body, MediaType.APPLICATION_JSON, outputMessage);
  }

  @Override
  public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response,
      AuthenticationException exception) throws IOException, ServletException {
    AuthResultBody body = new AuthResultBody("failure");
    HttpOutputMessage outputMessage = new ServletServerHttpResponse(response);
    response.setStatus(HttpStatus.UNAUTHORIZED.value());
    httpMessageConverter.write(body, MediaType.APPLICATION_JSON, outputMessage);
  }

  @Override
  public void onLogoutSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication)
      throws IOException {
    AuthResultBody body = new AuthResultBody("success");
    HttpOutputMessage outputMessage = new ServletServerHttpResponse(response);
    response.setStatus(HttpStatus.OK.value());
    httpMessageConverter.write(body, MediaType.APPLICATION_JSON, outputMessage);
  }

  @lombok.Value
  public static class AuthResultBody {
    private final String message;
  }
}
