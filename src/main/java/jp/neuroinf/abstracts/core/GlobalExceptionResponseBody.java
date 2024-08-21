package jp.neuroinf.abstracts.core;

import java.time.ZonedDateTime;

import lombok.Data;

@Data
public class GlobalExceptionResponseBody {
  private ZonedDateTime timestamp;
  private int code;
  private String message;
  private String path;
}
