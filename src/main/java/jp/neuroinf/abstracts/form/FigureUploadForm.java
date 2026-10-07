package jp.neuroinf.abstracts.form;

import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Value;

@Value
public class FigureUploadForm {

  @NotNull
  private MultipartFile file;

  @NotNull
  @Size(max = 300)
  private String caption;

}
