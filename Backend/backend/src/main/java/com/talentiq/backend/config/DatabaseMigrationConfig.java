package com.talentiq.backend.config;

import org.springframework.context.annotation.Configuration;

@Configuration
public class DatabaseMigrationConfig {
    // Migration disabled - Hibernate DDL-auto will handle schema updates
    // The previous migration logic was conflicting with Hibernate's automatic schema management
}