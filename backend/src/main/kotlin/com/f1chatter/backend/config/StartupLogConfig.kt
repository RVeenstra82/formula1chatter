package com.f1chatter.backend.config

import mu.KotlinLogging
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.CommandLineRunner
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.web.client.RestTemplate
import java.net.URL

@Configuration
class StartupLogConfig {
    private val logger = KotlinLogging.logger {}

    @Bean
    fun startupLogging(): CommandLineRunner {
        return CommandLineRunner {
            logger.info("")
            logger.info("==========================================================")
            logger.info("    APPLICATION IS RUNNING!")
            logger.info("==========================================================")
            logger.info("    Backend API: http://localhost:10000/api")
            logger.info("    Frontend: http://localhost:5173")
            logger.info("    Database: PostgreSQL on port 5433")
            logger.info("    Admin UI: http://localhost:5050 (email: admin@f1chatter.com, password: admin)")
            logger.info("==========================================================")
            logger.info("")
        }
    }

    @Bean
    fun facebookOAuthValidation(
        @Value("\${spring.security.oauth2.client.registration.facebook.client-id:}") clientId: String,
        @Value("\${spring.security.oauth2.client.registration.facebook.client-secret:}") clientSecret: String,
        @Value("\${spring.security.oauth2.client.registration.facebook.redirect-uri:}") redirectUri: String
    ): CommandLineRunner {
        return CommandLineRunner {
            logger.info("")
            logger.info("==========================================================")
            logger.info("    FACEBOOK OAUTH CONFIGURATION CHECK")
            logger.info("==========================================================")
            
            // Check if credentials are set
            if (clientId.isBlank() || clientId == "dummy-client-id") {
                logger.error("❌ FACEBOOK_CLIENT_ID is not set or is dummy value!")
            } else {
                logger.info("✅ FACEBOOK_CLIENT_ID is configured: ${clientId.take(8)}...")
            }
            
            if (clientSecret.isBlank() || clientSecret == "dummy-client-secret") {
                logger.error("❌ FACEBOOK_CLIENT_SECRET is not set or is dummy value!")
            } else {
                logger.info("✅ FACEBOOK_CLIENT_SECRET is configured: ${clientSecret.take(8)}...")
            }
            
            logger.info("📋 Redirect URI template: $redirectUri")
            logger.info("📋 Expected redirect URI: https://formula1chatter.onrender.com/api/login/oauth2/code/facebook")
            logger.info("📋 Success redirect URL: https://formula1chatter.vercel.app/#/")
            
            // Test Facebook app accessibility
            if (clientId.isNotBlank() && clientId != "dummy-client-id") {
                try {
                    val testUrl = "https://graph.facebook.com/$clientId"
                    val restTemplate = RestTemplate()
                    val response = restTemplate.getForObject(testUrl, String::class.java)
                    
                    if (response != null && response.contains("name")) {
                        logger.info("✅ Facebook app is accessible and valid")
                    } else {
                        logger.warn("⚠️  Facebook app response is unexpected: $response")
                    }
                } catch (e: Exception) {
                    if (e.message?.contains("400 Bad Request") == true) {
                        logger.warn("⚠️  Facebook app is in development mode or has restricted access")
                        logger.info("ℹ️  This is normal for development. App will work for app developers and test users.")
                    } else {
                        logger.error("❌ Cannot access Facebook app: ${e.message}")
                    }
                }
            }
            
            logger.info("")
            logger.info("🔧 FACEBOOK APP SETUP CHECKLIST:")
            logger.info("   1. App is in 'Live' mode (not development)")
            logger.info("   2. Facebook Login product is added")
            logger.info("   3. Valid OAuth Redirect URIs include:")
            logger.info("      - https://formula1chatter.onrender.com/api/login/oauth2/code/facebook")
            logger.info("      - https://formula1chatter.vercel.app/api/login/oauth2/code/facebook")
            logger.info("   4. App ID and App Secret are correct")
            logger.info("==========================================================")
            logger.info("")
        }
    }
} 