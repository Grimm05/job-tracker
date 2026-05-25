package com.jobtracker.service;

import com.jobtracker.dto.request.ApplicationCreateRequest;
import com.jobtracker.dto.request.ApplicationFilterRequest;
import com.jobtracker.dto.request.ApplicationUpdateRequest;
import com.jobtracker.dto.response.ApplicationResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface ApplicationService {

    ApplicationResponse create(ApplicationCreateRequest request);

    ApplicationResponse findById(UUID id);

    Page<ApplicationResponse> findAll(Pageable pageable);

    ApplicationResponse update(UUID id, ApplicationUpdateRequest request);

    void delete(UUID id);

    Page<ApplicationResponse> search(ApplicationFilterRequest filter);
}