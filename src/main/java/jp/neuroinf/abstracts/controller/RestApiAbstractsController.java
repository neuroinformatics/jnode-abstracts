package jp.neuroinf.abstracts.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import jakarta.validation.Valid;
import jp.neuroinf.abstracts.core.AccountDetails;
import jp.neuroinf.abstracts.core.RestSuccessResponseBody;
import jp.neuroinf.abstracts.dto.AbstractDto;
import jp.neuroinf.abstracts.form.AbstractEditForm;
import jp.neuroinf.abstracts.form.AbstractUpdateOwnersForm;
import jp.neuroinf.abstracts.form.AbstractUpdatePublicationForm;
import jp.neuroinf.abstracts.form.AbstractUpdateStateForm;
import jp.neuroinf.abstracts.form.FigureUploadForm;
import jp.neuroinf.abstracts.service.AbstractService;
import jp.neuroinf.abstracts.service.FavoriteService;
import jp.neuroinf.abstracts.service.FigureService;

@RestController
@RequestMapping("/api/abstracts")
public class RestApiAbstractsController {

    private final AbstractService abstractService;
    private final FigureService figureService;
    private final FavoriteService favoriteService;

    public RestApiAbstractsController(AbstractService abstractService, FigureService figureService,
            FavoriteService favoriteService) {
        this.abstractService = abstractService;
        this.figureService = figureService;
        this.favoriteService = favoriteService;
    }

    @GetMapping("/{uuid}")
    public AbstractDto retrieveAbstract(@AuthenticationPrincipal AccountDetails user, @PathVariable String uuid)
            throws ResponseStatusException {
        return this.abstractService.getAbstract(user, uuid);
    }

    @PutMapping("/{uuid}")
    public AbstractDto updateAbstract(@AuthenticationPrincipal AccountDetails user,
            @PathVariable("uuid") String uuid, @Valid @RequestBody AbstractEditForm form)
            throws ResponseStatusException {
        return this.abstractService.updateAbstract(user, uuid, form);
    }

    @DeleteMapping("/{uuid}")
    public RestSuccessResponseBody deleteAbstract(@AuthenticationPrincipal AccountDetails user,
            @PathVariable("uuid") String uuid) throws ResponseStatusException {
        return this.abstractService.deleteAbstract(user, uuid);
    }

    @PutMapping("/{uuid}/owners")
    public AbstractDto updateAbstractOwners(@AuthenticationPrincipal AccountDetails user,
            @PathVariable("uuid") String uuid, @Valid AbstractUpdateOwnersForm form) throws ResponseStatusException {
        return this.abstractService.updateOwners(user, uuid, form);
    }

    @PostMapping("/{uuid}/figures")
    public AbstractDto uploadAbstractFigure(@AuthenticationPrincipal AccountDetails user,
            @PathVariable("uuid") String uuid, @Valid FigureUploadForm form) throws ResponseStatusException {
        return this.figureService.uploadFigure(user, uuid, form);
    }

    @PutMapping("/{uuid}/favorite")
    public RestSuccessResponseBody addAbstractFavorite(@AuthenticationPrincipal AccountDetails user,
            @PathVariable("uuid") String uuid) throws ResponseStatusException {
        return this.favoriteService.addFavorite(user, uuid);
    }

    @DeleteMapping("/{uuid}/favorite")
    public RestSuccessResponseBody removeAbstractFavorite(@AuthenticationPrincipal AccountDetails user,
            @PathVariable("uuid") String uuid) throws ResponseStatusException {
        return this.favoriteService.removeFavorite(user, uuid);
    }

    @PutMapping("/{uuid}/state")
    public AbstractDto updateAbstractState(@AuthenticationPrincipal AccountDetails user,
            @PathVariable("uuid") String uuid, @Valid AbstractUpdateStateForm form) throws ResponseStatusException {
        return this.abstractService.updateState(user, uuid, form);
    }

    @PutMapping("/{uuid}/publication")
    public AbstractDto updateAbstractPublication(@AuthenticationPrincipal AccountDetails user,
            @PathVariable("uuid") String uuid, @Valid AbstractUpdatePublicationForm form)
            throws ResponseStatusException {
        return this.abstractService.updatePublication(user, uuid, form);
    }

}