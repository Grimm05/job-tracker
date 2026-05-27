package com.jobtracker.unit.controller;

import tools.jackson.databind.ObjectMapper;
import com.jobtracker.controller.ApplicationController;
import com.jobtracker.dto.request.ApplicationCreateRequest;
import com.jobtracker.dto.response.ApplicationResponse;
import com.jobtracker.entity.ApplicationStatus;
import com.jobtracker.exception.ResourceNotFoundException;
import com.jobtracker.security.JwtService;
import com.jobtracker.service.ApplicationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ApplicationController.class)   // ← charge uniquement la couche web
@WithMockUser                              // ← simule un user authentifié pour tous les tests
class ApplicationControllerTest {

    @Autowired
    private MockMvc mockMvc;               // ← injecté automatiquement par @WebMvcTest

    @Autowired
    private ObjectMapper objectMapper;

    // Mocks nécessaires au démarrage du contexte web
    @MockitoBean
    private ApplicationService service;

    @MockitoBean
    private JwtService jwtService;         // ← requis par JwtAuthFilter

    @MockitoBean
    private UserDetailsService userDetailsService; // ← requis par SecurityConfig

    // ─────────────────────────────────────────
    @Test
    void getById_shouldReturn200_whenFound() throws Exception {
        UUID id = UUID.randomUUID();
        ApplicationResponse response = new ApplicationResponse(
                id, "Google", "Backend Dev", ApplicationStatus.APPLIED,
                75000, "Paris", LocalDate.now(), null, null,
                LocalDateTime.now(), LocalDateTime.now()
        );

        when(service.findById(id)).thenReturn(response);

        mockMvc.perform(get("/api/v1/applications/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.company").value("Google"))
                .andExpect(jsonPath("$.status").value("APPLIED"));
    }

    @Test
    void create_shouldReturn400_whenCompanyIsBlank() throws Exception {
        ApplicationCreateRequest invalid = new ApplicationCreateRequest(
                "", "Backend Dev", ApplicationStatus.APPLIED,
                null, null, null, null, null
        );

        mockMvc.perform(post("/api/v1/applications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalid)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.company").exists());
    }

    @Test
    void getById_shouldReturn404_whenNotFound() throws Exception {
        UUID id = UUID.randomUUID();
        when(service.findById(id))
                .thenThrow(new ResourceNotFoundException("Application", id));

        mockMvc.perform(get("/api/v1/applications/{id}", id))
                .andExpect(status().isNotFound());
    }

}