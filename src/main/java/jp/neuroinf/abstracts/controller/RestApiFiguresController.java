package jp.neuroinf.abstracts.controller;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import jakarta.servlet.http.HttpServletResponse;
import jp.neuroinf.abstracts.core.AccountDetails;
import jp.neuroinf.abstracts.dto.FigureDto;
import jp.neuroinf.abstracts.entity.Account;
import jp.neuroinf.abstracts.service.PermissionService;
import jp.neuroinf.abstracts.service.FigureService;

@RestController
@RequestMapping("/api/figures")
public class RestApiFiguresController {

    private final PermissionService permissionService;
    private final FigureService figureService;

    public RestApiFiguresController(PermissionService permissionService, FigureService abstractService) {
        this.permissionService = permissionService;
        this.figureService = abstractService;
    }

    @GetMapping("/{uuid}")
    public FigureDto retrieveFigure(@AuthenticationPrincipal AccountDetails user, @PathVariable String uuid)
            throws ResponseStatusException {
        Account account = this.permissionService.findAccount(user);
        FigureDto figure = this.figureService.getFigure(account, uuid);
        if (figure == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "no figure data found");
        }
        return figure;
    }

    @GetMapping("/{uuid}/image")
    public void imageFigure(@AuthenticationPrincipal AccountDetails user, @PathVariable String uuid,
            HttpServletResponse response)
            throws ResponseStatusException {
        Account account = this.permissionService.findAccount(user);
        try {
            this.figureService.downloadFigureImage(account, uuid, response);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "no figure data found");
        }
    }

}