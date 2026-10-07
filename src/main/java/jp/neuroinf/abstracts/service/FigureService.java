package jp.neuroinf.abstracts.service;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.file.Files;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.transaction.Transactional;
import jp.neuroinf.abstracts.core.AccountDetails;
import jp.neuroinf.abstracts.core.AppException;
import jp.neuroinf.abstracts.core.AppProperties;
import jp.neuroinf.abstracts.dto.AbstractDto;
import jp.neuroinf.abstracts.dto.FigureDto;
import jp.neuroinf.abstracts.entity.Abstract;
import jp.neuroinf.abstracts.entity.Account;
import jp.neuroinf.abstracts.entity.Figure;
import jp.neuroinf.abstracts.form.FigureUpdateForm;
import jp.neuroinf.abstracts.form.FigureUploadForm;
import jp.neuroinf.abstracts.repository.FigureRepository;

@Service
public class FigureService {

  private static final List<String> ALLOWED_CONTENT_TYPES = List.of(
      MediaType.IMAGE_JPEG_VALUE, MediaType.IMAGE_PNG_VALUE, MediaType.IMAGE_GIF_VALUE);

  private final FigureRepository figureRepository;
  private final AbstractService abstractService;
  private final PermissionService permissionService;
  private final AppProperties appProperties;

  public FigureService(FigureRepository figureRepository, AbstractService abstractService,
      PermissionService permissionService, AppProperties appProperties) {
    this.figureRepository = figureRepository;
    this.abstractService = abstractService;
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

  /**
   * Adds a figure after the existing ones, up to the number of figures the conference allows.
   */
  @Transactional
  public AbstractDto uploadFigure(AccountDetails user, String abstractUuid, FigureUploadForm form)
      throws ResponseStatusException {
    final Account account = this.permissionService.requireAccount(user);
    final Abstract abstract_ = this.abstractService.requireAbstract(abstractUuid);
    this.abstractService.requireContentEditor(abstract_, account);
    if (abstract_.getFigures().size() >= abstract_.getConference().getAbstractMaxFigures()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
          String.format("Up to %d figures are allowed", abstract_.getConference().getAbstractMaxFigures()));
    }
    final MultipartFile file = form.getFile();
    if (file.isEmpty() || !ALLOWED_CONTENT_TYPES.contains(file.getContentType())) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only JPEG, PNG or GIF images are allowed");
    }
    final Figure figure = new Figure();
    figure.setCaption(form.getCaption().strip());
    figure.setPosition(abstract_.getFigures().stream().mapToInt(Figure::getPosition).max().orElse(-1) + 1);
    figure.setAbstract_(abstract_);
    abstract_.getFigures().add(figure);
    this.figureRepository.saveAndFlush(figure);
    // write the file last, failing the request (and rolling back the figure row) if it cannot be written
    final File directory = new File(this.appProperties.getPathFigures());
    try {
      Files.createDirectories(directory.toPath());
      file.transferTo(new File(directory, figure.getUuid()).toPath());
    } catch (IOException e) {
      e.printStackTrace();
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to save the figure file");
    }
    return AbstractDto.of(abstract_);
  }

  @Transactional
  public AbstractDto updateFigure(AccountDetails user, String uuid, FigureUpdateForm form)
      throws ResponseStatusException {
    final Account account = this.permissionService.requireAccount(user);
    final Figure figure = requireFigure(uuid);
    final Abstract abstract_ = figure.getAbstract_();
    this.abstractService.requireContentEditor(abstract_, account);
    figure.setCaption(form.getCaption().strip());
    this.figureRepository.flush();
    return AbstractDto.of(abstract_);
  }

  @Transactional
  public AbstractDto deleteFigure(AccountDetails user, String uuid) throws ResponseStatusException {
    final Account account = this.permissionService.requireAccount(user);
    final Figure figure = requireFigure(uuid);
    final Abstract abstract_ = figure.getAbstract_();
    this.abstractService.requireContentEditor(abstract_, account);
    abstract_.getFigures().remove(figure);
    this.figureRepository.flush();
    final File file = new File(this.appProperties.getPathFigures(), uuid);
    if (file.exists() && !file.delete()) {
      System.err.println("Failed to delete file: " + file.getPath());
    }
    return AbstractDto.of(abstract_);
  }

  private Figure requireFigure(String uuid) throws ResponseStatusException {
    final Figure figure = this.figureRepository.findFirstByUuid(uuid);
    if (figure == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "no figure data found");
    }
    return figure;
  }

}
