package com.jobtracker.integration;

import com.jobtracker.dto.request.ApplicationCreateRequest;
import com.jobtracker.dto.response.ApplicationResponse;
import com.jobtracker.entity.Application;
import com.jobtracker.entity.ApplicationStatus;
import com.jobtracker.repository.ApplicationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.springframework.boot.resttestclient.TestRestTemplate;

import java.time.LocalDate;
import java.util.UUID;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
@ActiveProfiles("test")
class ApplicationIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres =
            new PostgreSQLContainer<>("postgres:16-alpine");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url",      postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private ApplicationRepository repository;

    @BeforeEach
    void setUp() {
        repository.deleteAll();
    }

    @Test
    void createAndRetrieve_fullRoundTrip() {
        // CREATE
        ApplicationCreateRequest request = new ApplicationCreateRequest(
                "Spotify", "Senior Dev", ApplicationStatus.APPLIED,
                90000, "Stockholm", LocalDate.now(), null, null
        );

        ResponseEntity<ApplicationResponse> created = restTemplate.postForEntity(
                "/api/v1/applications", request, ApplicationResponse.class
        );

        assertThat(created.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(created.getBody()).isNotNull();
        UUID id = created.getBody().id();

        // RETRIEVE
        ResponseEntity<ApplicationResponse> fetched = restTemplate.getForEntity(
                "/api/v1/applications/{id}", ApplicationResponse.class, id
        );

        assertThat(fetched.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(fetched.getBody().company()).isEqualTo("Spotify");
        assertThat(fetched.getBody().salary()).isEqualTo(90000);
    }

    @Test
    void delete_shouldRemoveFromDatabase() {
        Application app = repository.save(Application.builder()
                .company("Netflix").position("Dev")
                .status(ApplicationStatus.SAVED)
                .build());

        restTemplate.delete("/api/v1/applications/{id}", app.getId());

        assertThat(repository.findById(app.getId())).isEmpty();
    }
}