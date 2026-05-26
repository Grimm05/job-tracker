package com.jobtracker.service;

import com.jobtracker.dto.response.DashboardStatsResponse;
import com.jobtracker.entity.ApplicationStatus;
import com.jobtracker.repository.ApplicationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private final ApplicationRepository repository;

    public DashboardStatsResponse getStats() {
        long total = repository.count();

        if (total == 0) {
            return new DashboardStatsResponse(0, 0, 0, 0, 0, 0, 0, Map.of());
        }

        // Compter par statut en une seule requête
        Map<String, Long> byStatus = Arrays.stream(ApplicationStatus.values())
                .collect(Collectors.toMap(
                        Enum::name,
                        status -> repository.countByStatus(status)
                ));

        long applied    = byStatus.getOrDefault("APPLIED", 0L);
        long hr         = byStatus.getOrDefault("HR_INTERVIEW", 0L);
        long tech       = byStatus.getOrDefault("TECH_INTERVIEW", 0L);
        long finalInt   = byStatus.getOrDefault("FINAL_INTERVIEW", 0L);
        long offers     = byStatus.getOrDefault("OFFER", 0L);
        long rejected   = byStatus.getOrDefault("REJECTED", 0L);
        long saved      = byStatus.getOrDefault("SAVED", 0L);

        long inProgress  = hr + tech + finalInt;
        long contacted   = total - saved;             // ont reçu une réponse ou posé
        long concluded   = offers + rejected;

        double responseRate = contacted > 0
                ? Math.round((double) contacted / total * 1000) / 10.0
                : 0;

        double successRate = concluded > 0
                ? Math.round((double) offers / concluded * 1000) / 10.0
                : 0;

        return new DashboardStatsResponse(
                total, applied, inProgress, offers, rejected,
                responseRate, successRate, byStatus
        );
    }
}