package jp.neuroinf.abstracts.core;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import lombok.Data;

@Component
@ConfigurationProperties("app")
@Data
public class AppProperties {

  @Value("${app.url:http://localhost:8080}")
  private String url;

  @Value("${app.admins:admin@example.com}")
  private List<String> admins;

  // only site admins can log in, so that everyone else just reads the published information
  @Value("${app.read-only:false}")
  private Boolean readOnly;

  @Value("${app.path.banners:./banners}")
  private String pathBanners;

  @Value("${app.path.figures:./figures}")
  private String pathFigures;

  @Value("${app.mail.mock:true}")
  private Boolean mailMock;

  @Value("${app.mail.from.address:abstracts@example.com}")
  private String mailFromAddress;

  @Value("${app.mail.from.name:The J-Node Abstract System}")
  private String mailFromName;

}
