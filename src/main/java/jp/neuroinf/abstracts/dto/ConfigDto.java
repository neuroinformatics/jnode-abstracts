package jp.neuroinf.abstracts.dto;

import lombok.Value;

/**
 * Site settings the frontend needs to know.
 */
@Value
public class ConfigDto {

  private final Boolean readOnly;

}
