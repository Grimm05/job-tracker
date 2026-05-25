package com.jobtracker.dto.request;

import com.jobtracker.entity.ApplicationStatus;

import java.time.LocalDate;

public record ApplicationUpdateRequest(
        String company,
        String position,
        ApplicationStatus status,
        Integer salary,
        String location,
        LocalDate applicationDate,
        String jobUrl,
        String notes
) {}