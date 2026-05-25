package com.jobtracker.dto.request;

import com.jobtracker.entity.ApplicationStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record ApplicationCreateRequest(

        @NotBlank(message = "Company is required")
        String company,

        @NotBlank(message = "Position is required")
        String position,

        @NotNull(message = "Status is required")
        ApplicationStatus status,

        Integer salary,
        String location,
        LocalDate applicationDate,
        String jobUrl,
        String notes
) {}