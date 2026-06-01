package com.example.enipath.repository;


import com.example.enipath.model.Users.Admin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AdminRepository extends JpaRepository<Admin, Long> {
    // JpaRepository already provides all CRUD — course page 55
}
