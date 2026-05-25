package com.jobtracker.dto.response;

import com.jobtracker.entity.ApplicationStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record ApplicationResponse(
        UUID id,
        String company,
        String position,
        ApplicationStatus status,
        Integer salary,
        String location,
        LocalDate applicationDate,
        String jobUrl,
        String notes,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}