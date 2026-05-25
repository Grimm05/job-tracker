package com.jobtracker.controller;

import com.jobtracker.dto.request.ApplicationCreateRequest;
import com.jobtracker.dto.request.ApplicationFilterRequest;
import com.jobtracker.dto.request.ApplicationUpdateRequest;
import com.jobtracker.dto.response.ApplicationResponse;
import com.jobtracker.entity.ApplicationStatus;
import com.jobtracker.service.ApplicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/applications")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService service;

    // ─────────────────────────────────────────
    // GET /api/v1/applications
    // ?page=0&size=10&sort=createdAt,desc
    // ─────────────────────────────────────────
    @GetMapping
    public ResponseEntity<Page<ApplicationResponse>> findAll(
            @PageableDefault(size = 10, sort = "createdAt") Pageable pageable
    ) {
        return ResponseEntity.ok(service.findAll(pageable));
    }

    // ─────────────────────────────────────────
    // GET /api/v1/applications/{id}
    // ─────────────────────────────────────────
    @GetMapping("/{id}")
    public ResponseEntity<ApplicationResponse> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.findById(id));
    }

    // ─────────────────────────────────────────
    // POST /api/v1/applications
    // ─────────────────────────────────────────
    @PostMapping
    public ResponseEntity<ApplicationResponse> create(
            @Valid @RequestBody ApplicationCreateRequest request
    ) {
        ApplicationResponse created = service.create(request);

        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(created.id())
                .toUri();

        return ResponseEntity.created(location).body(created);
    }

    // ─────────────────────────────────────────
    // PUT /api/v1/applications/{id}
    // ─────────────────────────────────────────
    @PutMapping("/{id}")
    public ResponseEntity<ApplicationResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody ApplicationUpdateRequest request
    ) {
        return ResponseEntity.ok(service.update(id, request));
    }

    // ─────────────────────────────────────────
    // DELETE /api/v1/applications/{id}
    // ─────────────────────────────────────────
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    // GET /api/v1/applications/search
    // ?keyword=google&status=APPLIED&page=0&size=10&sortBy=createdAt&sortDir=desc
    @GetMapping("/search")
    public ResponseEntity<Page<ApplicationResponse>> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String company,
            @RequestParam(required = false) ApplicationStatus status,
            @RequestParam(defaultValue = "0")    int page,
            @RequestParam(defaultValue = "10")   int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        ApplicationFilterRequest filter = new ApplicationFilterRequest(
                keyword, company, status, page, size, sortBy, sortDir
        );
        return ResponseEntity.ok(service.search(filter));
    }
}