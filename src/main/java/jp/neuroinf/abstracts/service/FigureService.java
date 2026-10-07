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
import jp.neuroinf.abstracts.dto.FigureDto;
import jp.neuroinf.abstracts.entity.Account;
import jp.neuroinf.abstracts.entity.Figure;
import jp.neuroinf.abstracts.repository.FigureRepository;

@Service
public class FigureService {

  private final FigureRepository figureRepository;
  private final PermissionService permissionService;
  private final AppProperties appProperties;

  public FigureService(FigureRepository figureRepository, PermissionService permissionService,
      AppProperties appProperties) {
    this.figureRepository = figureRepository;
    this.permissionService = permissionService;
    this.appProperties = appProperties;
  }

  @Transactional
  public FigureDto getFigure(Account account, String uuid) {
    Figure figure = this.figureRepository.findFirstByUuid(uuid);
    if (figure == null || !this.permissionService.isAbstractReadable(figure.getAbstract_(), account)) {
      return null;
    }
    return FigureDto.of(figure);
  }

  @Transactional
  public void downloadFigureImage(Account account, String uuid, HttpServletResponse response) throws AppException {
    FigureDto figure = getFigure(account, uuid);
    if (figure == null) {
      throw new AppException("file not found");
    }
    String filePath = this.appProperties.getPathFigures() + '/' + uuid;
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
