package jp.neuroinf.abstracts.controller;

import java.time.ZonedDateTime;

import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.http.HttpServletRequest;
import jp.neuroinf.abstracts.core.RestErrorResponseBody;

@Controller
@RequestMapping("${server.error.path:${error.path:/error}}")
public class CustomErrorController implements ErrorController {

  @RequestMapping(produces = MediaType.TEXT_HTML_VALUE)
  public String errorHtml(HttpServletRequest request) {
    return "forward:/index.html";
  }

  @RequestMapping
  public ResponseEntity<RestErrorResponseBody> errorJson(HttpServletRequest request) {
    String statusCode = request.getAttribute(RequestDispatcher.ERROR_STATUS_CODE).toString();
    HttpStatus status = HttpStatus.valueOf(Integer.parseInt(statusCode));
    String path = request.getAttribute(RequestDispatcher.ERROR_REQUEST_URI).toString();
    RestErrorResponseBody body = new RestErrorResponseBody();
    body.setTimestamp(ZonedDateTime.now());
    body.setCode(status.value());
    body.setMessage(status.getReasonPhrase());
    body.setPath(path);
    return new ResponseEntity<>(body, status);
  }

}
