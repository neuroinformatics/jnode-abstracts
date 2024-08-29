package jp.neuroinf.abstracts.core;

import java.time.ZonedDateTime;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.ErrorResponse;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.ServletWebRequest;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(Exception.class)
    public ResponseEntity<GlobalExceptionResponseBody> handleGlobalException(Exception exception, WebRequest request) {
        HttpStatusCode statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
        String message = exception.getMessage();
        String uri = ((ServletWebRequest) request).getRequest().getRequestURI();
        if (exception instanceof ErrorResponse) {
            statusCode = ((ErrorResponse) exception).getStatusCode();
        }
        if (exception instanceof ResponseStatusException) {
            message = ((ResponseStatusException) exception).getReason();
        }
        // exception.printStackTrace();
        GlobalExceptionResponseBody body = new GlobalExceptionResponseBody();
        body.setTimestamp(ZonedDateTime.now());
        body.setCode(statusCode.value());
        body.setMessage(message);
        body.setPath(uri);
        return new ResponseEntity<GlobalExceptionResponseBody>(body, statusCode);
    }

}