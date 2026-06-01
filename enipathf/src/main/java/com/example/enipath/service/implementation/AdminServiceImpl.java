package com.example.enipath.service.implementation;

import com.example.enipath.model.Users.Admin;
import com.example.enipath.repository.AdminRepository;
import com.example.enipath.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
@RequiredArgsConstructor

public class AdminServiceImpl implements AdminService {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public Admin save(Admin admin) {
        admin.setMdp(passwordEncoder.encode(admin.getMdp()));
        admin.setActif(true);
        return adminRepository.save(admin);
    }

    @Override
    public Optional<Admin> findById(Long id) {
        return adminRepository.findById(id);
    }

    @Override
    public List<Admin> findAll() {
        return adminRepository.findAll();
    }

    @Override
    public void delete(Long id) {
        adminRepository.deleteById(id);
    }
}
