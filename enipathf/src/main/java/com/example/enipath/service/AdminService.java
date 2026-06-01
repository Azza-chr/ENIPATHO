package com.example.enipath.service;

import com.example.enipath.model.Users.Admin;
import java.util.List;
import java.util.Optional;

public interface AdminService {

    Admin save(Admin admin);
    Optional<Admin> findById(Long id);
    List<Admin> findAll();
    void delete(Long id);
}
