package jp.neuroinf.abstracts.form;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Value;

@Value
public class ConferenceUpdateForm {

  @NotNull
  final Boolean isOpen;

  @NotNull
  final Boolean isPublished;

  @NotNull
  final Boolean isActive;

  @NotNull
  final String name;

  @NotNull
  final String shortName;

  final String conferenceGroup;

  final String cite;

  @NotNull
  @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
  final LocalDateTime startDate;

  @NotNull
  @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
  final LocalDateTime endDate;

  @NotNull
  @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
  final LocalDateTime deadline;

  final String logoUuid;

  final MultipartFile logoFile;

  final String logoLink;

  final String thumbnailUuid;

  final MultipartFile thumbnailFile;

  final String thumbnailLink;

  final String iosApp;

  final String link;

  final String description;

  final String notice;

  @NotNull
  final Boolean hasPresentationPrefs;

  @Valid
  final List<TopicForm> topics;

  @NotNull
  final Integer abstractMaxLength;

  @NotNull
  final Integer abstractMaxFigures;

  @Value
  public class TopicForm {

    private String uuid;

    @NotNull
    @Min(0)
    private Integer position;

    @NotNull
    private String topic;
  }
}
