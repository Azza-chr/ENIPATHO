package com.example.enipath.controller;

import com.example.enipath.dto.AnnouncementDto;
import com.example.enipath.dto.CreateAnnouncementRequest;
import com.example.enipath.service.AnnouncementService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/annonces")
public class AnnouncementController {

    private final AnnouncementService announcementService;

    public AnnouncementController(AnnouncementService announcementService) {
        this.announcementService = announcementService;
    }

    @GetMapping
    public List<AnnouncementDto> getAll() {
        return announcementService.getAll();
    }

    @PostMapping
    public AnnouncementDto create(@RequestBody CreateAnnouncementRequest request) {
        return announcementService.create(request);
    }
}
