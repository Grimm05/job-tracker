package com.jobtracker.dto.request;

import com.jobtracker.entity.ApplicationStatus;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

public record ApplicationFilterRequest(
        String keyword,
        String company,
        ApplicationStatus status,
        int page,
        int size,
        String sortBy,
        String sortDir
) {
    // Valeurs par défaut si absent de la query string
    public ApplicationFilterRequest {
        if (size   <= 0)          size    = 10;
        if (page   <  0)          page    = 0;
        if (sortBy == null)       sortBy  = "createdAt";
        if (sortDir == null)      sortDir = "desc";
    }

    public Pageable toPageable() {
        Sort.Direction direction = "asc".equalsIgnoreCase(sortDir)
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;

        return PageRequest.of(page, size, Sort.by(direction, sortBy));
    }
}