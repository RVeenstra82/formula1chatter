package com.f1chatter.backend.config

import org.slf4j.LoggerFactory
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties
import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Primary
import javax.sql.DataSource

@Configuration
class DatabaseConfig {

    private val logger = LoggerFactory.getLogger(DatabaseConfig::class.java)

    @Bean
    @Primary
    @ConfigurationProperties("spring.datasource")
    fun dataSourceProperties(): DataSourceProperties {
        val properties = DataSourceProperties()
        
        // Get the DATABASE_URL from environment
        val databaseUrl = System.getenv("DATABASE_URL")
        logger.info("DATABASE_URL from environment: ${databaseUrl?.take(20)}...")
        
        if (databaseUrl != null && databaseUrl.startsWith("postgresql://")) {
            // Convert postgresql:// to jdbc:postgresql:// and add SSL parameters for Render
            var jdbcUrl = databaseUrl.replace("postgresql://", "jdbc:postgresql://")
            
            // Add SSL parameters for Render's PostgreSQL service
            if (!jdbcUrl.contains("?")) {
                jdbcUrl += "?sslmode=require"
            } else {
                jdbcUrl += "&sslmode=require"
            }
            
            properties.url = jdbcUrl
            logger.info("Converted JDBC URL: ${jdbcUrl.take(50)}...")
            
            // Extract username and password from the URL if they're not set separately
            if (System.getenv("DB_USERNAME") == null && System.getenv("DB_PASSWORD") == null) {
                try {
                    val urlParts = databaseUrl.substring("postgresql://".length)
                    val atIndex = urlParts.indexOf("@")
                    if (atIndex > 0) {
                        val credentials = urlParts.substring(0, atIndex)
                        val colonIndex = credentials.indexOf(":")
                        if (colonIndex > 0) {
                            properties.username = credentials.substring(0, colonIndex)
                            properties.password = credentials.substring(colonIndex + 1)
                        }
                    }
                } catch (e: Exception) {
                    // If parsing fails, use the default values
                    properties.username = System.getenv("DB_USERNAME") ?: "postgres"
                    properties.password = System.getenv("DB_PASSWORD") ?: "postgres"
                }
            }
        }
        
        return properties
    }

    @Bean
    @Primary
    fun dataSource(properties: DataSourceProperties): DataSource {
        return properties.initializeDataSourceBuilder().build()
    }
}
