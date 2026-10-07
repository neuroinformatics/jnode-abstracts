package jp.neuroinf.abstracts.core;

import java.io.Serial;

public class AppException extends Exception {

  @Serial
  private static final long serialVersionUID = 1L;

  public AppException() {
    super();
  }

  public AppException(String message) {
    super(message);
  }

  public AppException(String message, Throwable cause) {
    super(message, cause);
  }

  public AppException(Throwable cause) {
    super(cause);
  }

}
