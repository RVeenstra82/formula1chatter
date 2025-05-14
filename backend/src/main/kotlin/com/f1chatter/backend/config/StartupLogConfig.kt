package com.f1chatter.backend.config

import mu.KotlinLogging
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.context.event.ApplicationReadyEvent
import org.springframework.context.ApplicationListener
import org.springframework.context.annotation.Configuration
import org.springframework.core.env.Environment

@Configuration
class StartupLogConfig(
    private val env: Environment,
    @Value("\${server.port:8080}") private val serverPort: String,
    @Value("\${server.servlet.context-path:}") private val contextPath: String
) : ApplicationListener<ApplicationReadyEvent> {
    
    private val logger = KotlinLogging.logger {}
    
    override fun onApplicationEvent(event: ApplicationReadyEvent) {
        val protocol = if (env.getProperty("server.ssl.enabled") == "true") "https" else "http"
        val hostAddress = "localhost"
        
        logger.info { "" }
        logger.info { "===========================================================" }
        logger.info { "    APPLICATION IS RUNNING!" }
        logger.info { "===========================================================" }
        logger.info { "    Backend API: $protocol://$hostAddress:$serverPort$contextPath" }
        logger.info { "    Frontend: http://localhost:5173" }
        logger.info { "    Database: PostgreSQL on port 5433" }
        logger.info { "    Admin UI: http://localhost:5050 (email: admin@f1chatter.com, password: admin)" }
        logger.info { "===========================================================" }
        logger.info { "" }
    }
} 