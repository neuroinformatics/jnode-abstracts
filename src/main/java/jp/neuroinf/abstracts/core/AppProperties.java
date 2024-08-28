package jp.neuroinf.abstracts.core;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import lombok.Data;

@ConfigurationProperties("app")
@Component
@Data
public class AppProperties {

  @Value("${app.admins:admin@example.com}")
  private List<String> admins;

  @Value("${app.path.banners:./banners}")
  private String pathBanners;

  @Value("${app.path.figures:./figures}")
  private String pathFigures;

}