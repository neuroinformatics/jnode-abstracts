package jp.neuroinf.abstracts.controller;

import org.springframework.beans.factory.annotation.Autowired;
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
import jp.neuroinf.abstracts.service.FigureService;

@RestController
@RequestMapping("/api/figures")
public class RestApiFiguresController {

    private final FigureService figureService;

    @Autowired
    public RestApiFiguresController(FigureService abstractService) {
        this.figureService = abstractService;
    }

    @GetMapping("/{uuid}")
    public FigureDto retrieveFigure(@AuthenticationPrincipal AccountDetails user, @PathVariable String uuid)
            throws Exception {
        Account account = user != null ? user.getAccount() : null;
        FigureDto figure = this.figureService.getFigure(account, uuid);
        if (figure == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "no figure data found");
        }
        return figure;
    }

    @GetMapping("/{uuid}/image")
    public void imageFigure(@AuthenticationPrincipal AccountDetails user, @PathVariable String uuid,
            HttpServletResponse response)
            throws Exception {
        Account account = user != null ? user.getAccount() : null;
        try {
            this.figureService.downloadFigureImage(account, uuid, response);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "no figure data found");
        }
    }

}