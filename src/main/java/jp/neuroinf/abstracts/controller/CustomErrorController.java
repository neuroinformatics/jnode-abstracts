package jp.neuroinf.abstracts.controller;

import java.time.ZonedDateTime;

import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.DispatcherServlet;

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
  public ResponseEntity<RestErrorResponseBody> error(HttpServletRequest request) {
    String statusCode = request.getAttribute(RequestDispatcher.ERROR_STATUS_CODE).toString();
    HttpStatus status = HttpStatus.valueOf(Integer.parseInt(statusCode));
    String message = status.getReasonPhrase();
    String path = request.getAttribute(RequestDispatcher.ERROR_REQUEST_URI).toString();
    Exception exception = (Exception) request.getAttribute(DispatcherServlet.EXCEPTION_ATTRIBUTE);
    if (exception instanceof ResponseStatusException) {
      message = ((ResponseStatusException) exception).getReason();
    } else if (exception instanceof MethodArgumentNotValidException) {
      message = "Invalid form parameter(s)";
    }
    RestErrorResponseBody body = new RestErrorResponseBody();
    body.setTimestamp(ZonedDateTime.now());
    body.setCode(status.value());
    body.setMessage(message);
    body.setPath(path);
    return new ResponseEntity<>(body, status);
  }

}
