package com.example.enipath.repository;

import com.example.enipath.model.academic.CoursPdf;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

@org.springframework.stereotype.Repository("academicCoursPdfRepository")
public interface CoursPdfRepository extends JpaRepository<CoursPdf, Long> {

    List<CoursPdf> findByMatiereIdOrderByCreatedAtDesc(Long matiereId);
}
