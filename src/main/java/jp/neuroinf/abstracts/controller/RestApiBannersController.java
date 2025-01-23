package jp.neuroinf.abstracts.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import jakarta.servlet.http.HttpServletResponse;
import jp.neuroinf.abstracts.dto.BannerDto;
import jp.neuroinf.abstracts.service.BannerService;

@RestController
@RequestMapping("/api/banners")
public class RestApiBannersController {

    private final BannerService bannerService;

    public RestApiBannersController(BannerService abstractService) {
        this.bannerService = abstractService;
    }

    @GetMapping("/{uuid}")
    public BannerDto retrieveBanner(@PathVariable String uuid) throws ResponseStatusException {
        BannerDto figure = this.bannerService.getBanner(uuid);
        if (figure == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "no figure data found");
        }
        return figure;
    }

    @GetMapping("/{uuid}/image")
    public void imageFigure(@PathVariable String uuid, HttpServletResponse response) throws ResponseStatusException {
        try {
            this.bannerService.downloadBannerImage(uuid, response);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "no figure data found");
        }
    }

}