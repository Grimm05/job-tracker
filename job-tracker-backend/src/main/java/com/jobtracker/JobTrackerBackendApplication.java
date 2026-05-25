package com.jobtracker;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing  // ← active @CreatedDate / @LastModifiedDate
public class JobTrackerBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(JobTrackerBackendApplication.class, args);
    }

}
