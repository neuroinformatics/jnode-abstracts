package jp.neuroinf.abstracts.config;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpOutputMessage;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.http.server.ServletServerHttpResponse;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.authentication.logout.HttpStatusReturningLogoutSuccessHandler;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jp.neuroinf.abstracts.service.UserDetailsServiceImpl;

@Configuration
@EnableWebSecurity
public class SecurityConfig implements AuthenticationSuccessHandler, AuthenticationFailureHandler {

  @Autowired
  MappingJackson2HttpMessageConverter httpMessageConverter;

  @Bean
  public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }

  @Bean
  public DaoAuthenticationProvider authenticationProvider(UserDetailsServiceImpl userDetailsService) {
    DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
    provider.setUserDetailsService(userDetailsService);
    provider.setPasswordEncoder(passwordEncoder());
    return provider;
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
            .logoutSuccessHandler(new HttpStatusReturningLogoutSuccessHandler()));
    return http.build();
  }

  @Override
  public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
      Authentication authentication) throws IOException, ServletException {
    MyResult result = new MyResult("認証成功");
    HttpOutputMessage outputMessage = new ServletServerHttpResponse(response);
    response.setStatus(HttpStatus.OK.value());
    httpMessageConverter.write(result, MediaType.APPLICATION_JSON, outputMessage);
  }

  @Override
  public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response,
      AuthenticationException exception) throws IOException, ServletException {
    MyResult result = new MyResult("認証失敗");
    System.out.println(exception);
    HttpOutputMessage outputMessage = new ServletServerHttpResponse(response);
    response.setStatus(HttpStatus.UNAUTHORIZED.value());
    httpMessageConverter.write(result, MediaType.APPLICATION_JSON, outputMessage);
  }

  @lombok.Value
  public static class MyResult {
    private final String message;
  }
}
