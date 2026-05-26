package com.jobtracker.dto.response;

import java.util.Map;

public record DashboardStatsResponse(
        long total,
        long applied,
        long inProgress,   // HR + TECH + FINAL
        long offers,
        long rejected,
        double responseRate,            // (total - SAVED) / total * 100
        double successRate,             // offers / (offers + rejected) * 100
        Map<String, Long> byStatus      // pour le breakdown complet
) {}