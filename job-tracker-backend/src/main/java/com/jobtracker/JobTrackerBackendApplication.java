package com.jobtracker;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication  // ← seulement ça, plus @EnableJpaAuditing
public class JobTrackerBackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(JobTrackerBackendApplication.class, args);
    }
}
