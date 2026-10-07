package jp.neuroinf.abstracts.controller;

import java.time.ZonedDateTime;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.http.HttpServletRequest;
import jp.neuroinf.abstracts.core.RestErrorResponseBody;

@RestControllerAdvice
public class CustomControllerAdvice {

  @ExceptionHandler(MaxUploadSizeExceededException.class)
  public ResponseEntity<RestErrorResponseBody> maxUploadSizeException(MaxUploadSizeExceededException e,
      HttpServletRequest request) {
    HttpStatus status = HttpStatus.BAD_REQUEST;
    String message = e.getMessage();
    String path = request.getAttribute(RequestDispatcher.ERROR_REQUEST_URI).toString();
    RestErrorResponseBody body = new RestErrorResponseBody();
    body.setTimestamp(ZonedDateTime.now());
    body.setCode(status.value());
    body.setMessage(message);
    body.setPath(path);
    return new ResponseEntity<>(body, status);
  }
}
