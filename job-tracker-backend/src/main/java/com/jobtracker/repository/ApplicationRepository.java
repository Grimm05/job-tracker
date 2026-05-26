package com.jobtracker.repository;

import com.jobtracker.entity.Application;
import com.jobtracker.entity.ApplicationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ApplicationRepository
        extends JpaRepository<Application, UUID>,
        JpaSpecificationExecutor<Application> {  // ← Phase 3 : filtres dynamiques

    Page<Application> findByStatus(ApplicationStatus status, Pageable pageable);

    Page<Application> findByCompanyContainingIgnoreCase(String company, Pageable pageable);

    boolean existsByCompanyAndPosition(String company, String position);

    long countByStatus(ApplicationStatus status);
}