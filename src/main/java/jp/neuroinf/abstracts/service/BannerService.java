package jp.neuroinf.abstracts.service;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.transaction.Transactional;
import jp.neuroinf.abstracts.core.AppException;
import jp.neuroinf.abstracts.core.AppProperties;
import jp.neuroinf.abstracts.dto.BannerDto;
import jp.neuroinf.abstracts.entity.Banner;
import jp.neuroinf.abstracts.repository.BannerRepository;

@Service
public class BannerService {

  private final BannerRepository bannerRepository;
  private final AppProperties appProperties;

  public BannerService(BannerRepository bannerRepository, AppProperties appProperties) {
    this.bannerRepository = bannerRepository;
    this.appProperties = appProperties;
  }

  @Transactional
  public BannerDto getBanner(String uuid) {
    Banner banner = this.bannerRepository.findFirstByUuid(uuid);
    return BannerDto.of(banner);
  }

  @Transactional
  public void downloadBannerImage(String uuid, HttpServletResponse response) throws AppException {
    BannerDto banner = getBanner(uuid);
    if (banner == null) {
      throw new AppException("file not found");
    }
    String filePath = this.appProperties.getPathBanners() + '/' + uuid;
    try (InputStream inputStream = new FileInputStream(filePath);
        OutputStream outputStream = response.getOutputStream();) {
      byte[] fileByteArray = inputStream.readAllBytes();
      response.setContentType(MediaType.APPLICATION_OCTET_STREAM_VALUE);
      response.setContentLength(fileByteArray.length);
      outputStream.write(fileByteArray);
      outputStream.flush();
    } catch (IOException e) {
      throw new AppException(e);
    }
  }
}
