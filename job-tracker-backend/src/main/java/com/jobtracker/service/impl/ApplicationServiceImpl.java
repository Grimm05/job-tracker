package com.jobtracker.service.impl;

import com.jobtracker.dto.request.ApplicationCreateRequest;
import com.jobtracker.dto.request.ApplicationFilterRequest;
import com.jobtracker.dto.request.ApplicationUpdateRequest;
import com.jobtracker.dto.response.ApplicationResponse;
import com.jobtracker.entity.Application;
import com.jobtracker.exception.ResourceNotFoundException;
import com.jobtracker.mapper.ApplicationMapper;
import com.jobtracker.repository.ApplicationRepository;
import com.jobtracker.repository.specification.ApplicationSpecification;
import com.jobtracker.service.ApplicationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor  // ← Lombok génère le constructeur avec tous les champs final
@Slf4j                    // ← Lombok génère un logger log.info(), log.error()…
@Transactional(readOnly = true)  // ← toutes les méthodes sont readOnly par défaut
public class ApplicationServiceImpl implements ApplicationService {

    private final ApplicationRepository repository;
    private final ApplicationMapper mapper;

    @Override
    @Transactional  // ← override : cette méthode écrit en base
    public ApplicationResponse create(ApplicationCreateRequest request) {
        log.info("Creating application for company: {}", request.company());

        Application application = mapper.toEntity(request);
        Application saved = repository.save(application);

        log.info("Application created with id: {}", saved.getId());
        return mapper.toResponse(saved);
    }

    @Override
    public ApplicationResponse findById(UUID id) {
        return repository.findById(id)
                .map(mapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Application", id));
    }

    @Override
    public Page<ApplicationResponse> findAll(Pageable pageable) {
        return repository.findAll(pageable)
                .map(mapper::toResponse);
    }

    @Override
    @Transactional
    public ApplicationResponse update(UUID id, ApplicationUpdateRequest request) {
        log.info("Updating application id: {}", id);

        Application application = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application", id));

        mapper.updateEntityFromRequest(request, application);
        // Pas besoin de save() explicite : l'entity est managed dans la transaction,
        // Hibernate détecte les changements et flush automatiquement

        return mapper.toResponse(application);
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        log.info("Deleting application id: {}", id);

        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Application", id);
        }
        repository.deleteById(id);
    }

    @Override
    public Page<ApplicationResponse> search(ApplicationFilterRequest filter) {
        Specification<Application> spec = ApplicationSpecification.buildFilter(
                filter.keyword(),
                filter.company(),
                filter.status()
        );
        return repository.findAll(spec, filter.toPageable())
                .map(mapper::toResponse);
    }
}