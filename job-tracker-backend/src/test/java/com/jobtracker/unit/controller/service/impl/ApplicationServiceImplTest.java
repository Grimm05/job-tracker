package com.jobtracker.unit.controller.service.impl;

// JUnit 5

import com.jobtracker.dto.request.ApplicationCreateRequest;
import com.jobtracker.dto.response.ApplicationResponse;
import com.jobtracker.entity.Application;
import com.jobtracker.entity.ApplicationStatus;
import com.jobtracker.exception.ResourceNotFoundException;
import com.jobtracker.mapper.ApplicationMapper;
import com.jobtracker.repository.ApplicationRepository;
import com.jobtracker.service.impl.ApplicationServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ApplicationServiceImplTest {

    @Mock
    private ApplicationRepository repository;

    @Mock
    private ApplicationMapper mapper;

    @InjectMocks
    private ApplicationServiceImpl service;

    @Test
    void create_shouldReturnResponse_whenRequestIsValid() {
        // GIVEN
        ApplicationCreateRequest request = new ApplicationCreateRequest(
                "Google", "Backend Engineer", ApplicationStatus.APPLIED,
                75000, "Paris", LocalDate.now(), null, null
        );
        Application entity   = new Application();
        Application saved    = new Application();
        ApplicationResponse response = new ApplicationResponse(
                UUID.randomUUID(), "Google", "Backend Engineer",
                ApplicationStatus.APPLIED, 75000, "Paris",
                LocalDate.now(), null, null,
                LocalDateTime.now(), LocalDateTime.now()
        );

        when(mapper.toEntity(request)).thenReturn(entity);
        when(repository.save(entity)).thenReturn(saved);
        when(mapper.toResponse(saved)).thenReturn(response);

        // WHEN
        ApplicationResponse result = service.create(request);

        // THEN
        assertThat(result.company()).isEqualTo("Google");
        assertThat(result.status()).isEqualTo(ApplicationStatus.APPLIED);

        verify(repository, times(1)).save(entity);
        verify(mapper, times(1)).toResponse(saved);
    }

    @Test
    void findById_shouldThrowException_whenNotFound() {
        // GIVEN
        UUID id = UUID.randomUUID();
        when(repository.findById(id)).thenReturn(Optional.empty());

        // WHEN / THEN
        assertThatThrownBy(() -> service.findById(id))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining(id.toString());

        verify(repository, times(1)).findById(id);
    }

    @Test
    void delete_shouldCallRepository_whenApplicationExists() {
        UUID id = UUID.randomUUID();
        when(repository.existsById(id)).thenReturn(true);

        service.delete(id);

        verify(repository, times(1)).deleteById(id);
    }

    @Test
    void delete_shouldThrow_whenApplicationNotFound() {
        UUID id = UUID.randomUUID();
        when(repository.existsById(id)).thenReturn(false);

        assertThatThrownBy(() -> service.delete(id))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(repository, never()).deleteById(any());
    }
}