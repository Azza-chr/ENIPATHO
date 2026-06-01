package com.example.enipath.controller;

import com.example.enipath.model.Users.Admin;
import com.example.enipath.repository.AdminRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/admins")
public class AdminController {

    private final AdminRepository repo;
    public AdminController(AdminRepository repo) { this.repo = repo; }

    @GetMapping
    public List<Admin> getAll() { return repo.findAll(); }

    @GetMapping("/{id}")
    public Admin getById(@PathVariable Long id) { return repo.findById(id).orElse(null); }

    @PostMapping
    public Admin create(@RequestBody Admin a) { return repo.save(a); }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) { repo.deleteById(id); }
}