package com.example.enipath.controller;

import com.example.enipath.model.academic.Groupe;
import com.example.enipath.repository.GroupeRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/groupes")
public class GroupeController {
    
    private final GroupeRepository repo;
    
    public GroupeController(GroupeRepository repo) { 
        this.repo = repo; 
    }

    @GetMapping
    public List<Groupe> getAll() { 
        return repo.findAll(); 
    }
}
