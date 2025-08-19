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
            // Extract username and password from the URL or use separate environment variables
            val dbUsername = System.getenv("DB_USERNAME")
            val dbPassword = System.getenv("DB_PASSWORD")
            
            var username: String? = null
            var password: String? = null
            
            if (dbUsername != null && dbPassword != null) {
                // Use separate environment variables if they exist
                username = dbUsername
                password = dbPassword
                logger.info("Using separate DB_USERNAME and DB_PASSWORD environment variables")
            } else {
                // Extract from URL if separate variables don't exist
				logger.info("Extracting username and password from DATABASE_URL")
                try {
                    val urlParts = databaseUrl.substring("postgresql://".length)
                    val atIndex = urlParts.indexOf("@")
                    if (atIndex > 0) {
                        val credentials = urlParts.substring(0, atIndex)
                        val colonIndex = credentials.indexOf(":")
                        if (colonIndex > 0) {
                            username = credentials.substring(0, colonIndex)
                            password = credentials.substring(colonIndex + 1)
                            logger.info("Extracted username and password from DATABASE_URL")
                        }
                    }
                } catch (e: Exception) {
                    logger.warn("Failed to parse credentials from DATABASE_URL: ${e.message}")
                    // If parsing fails, use the separate environment variables or defaults
                    username = dbUsername ?: "postgres"
                    password = dbPassword ?: "postgres"
                }
            }
            
            // Create a clean JDBC URL without credentials
            val cleanUrl = createCleanJdbcUrl(databaseUrl)
            properties.url = cleanUrl
            properties.username = username
            properties.password = password
            
            logger.info("Clean JDBC URL: ${cleanUrl.take(50)}...")
        }
        
        return properties
    }

    private fun createCleanJdbcUrl(databaseUrl: String): String {
        // Remove credentials from the URL and convert to JDBC format
        val urlWithoutProtocol = databaseUrl.substring("postgresql://".length)
        val atIndex = urlWithoutProtocol.indexOf("@")
        
        return if (atIndex > 0) {
            // Extract the part after @ (host:port/database)
            val hostAndDatabase = urlWithoutProtocol.substring(atIndex + 1)
            "jdbc:postgresql://$hostAndDatabase?sslmode=require"
        } else {
            // No credentials in URL, just convert protocol
            databaseUrl.replace("postgresql://", "jdbc:postgresql://") + "?sslmode=require"
        }
    }

    @Bean
    @Primary
    fun dataSource(properties: DataSourceProperties): DataSource {
        return properties.initializeDataSourceBuilder().build()
    }
}
