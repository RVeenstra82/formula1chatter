package com.f1chatter.backend.controller

import com.f1chatter.backend.dto.UserDto
import com.f1chatter.backend.service.UserService
import com.f1chatter.backend.service.JwtService
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken
import org.springframework.security.oauth2.core.user.OAuth2User
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.bind.annotation.RequestHeader
import mu.KotlinLogging
import org.springframework.web.client.RestTemplate
import org.springframework.beans.factory.annotation.Value

@RestController
@RequestMapping("/auth")
class AuthController(
    private val userService: UserService,
    private val jwtService: JwtService
) {
    private val logger = KotlinLogging.logger {}
    
    @GetMapping("/user")
    fun getUser(
        @AuthenticationPrincipal principal: OAuth2User?,
        @AuthenticationPrincipal userDetails: UserDetails?,
        @RequestHeader("Authorization", required = false) authHeader: String?
    ): ResponseEntity<Any> {
        logger.info { "AuthController.getUser called" }
        
        // Try JWT authentication first
        val token = jwtService.extractTokenFromHeader(authHeader)
        if (token != null && jwtService.isTokenValid(token)) {
            val userId = jwtService.extractUserId(token)
            if (userId != null) {
                try {
                    val user = userService.getUserById(userId)
                    logger.info { "JWT authentication successful for user: ${user.name}" }
                    return ResponseEntity.ok(user)
                } catch (e: Exception) {
                    logger.warn { "JWT authentication failed: ${e.message}" }
                }
            }
        }
        
        // Fallback to OAuth2 authentication (for the OAuth2 callback)
        if (principal != null) {
            logger.info { "OAuth2 principal found: ${principal.name}" }
            
            val auth = OAuth2AuthenticationToken(principal, emptyList(), "facebook")
            val user = userService.processOAuthPostLogin(auth)
            
            // Generate JWT token for the user
            val jwtToken = jwtService.generateToken(user.id, user.name, user.email)
            
            logger.info { "OAuth2 authentication successful, generated JWT for user: ${user.name}" }
            
            // Return both user data and JWT token
            return ResponseEntity.ok(mapOf(
                "user" to user,
                "token" to jwtToken
            ))
        }
        
        logger.warn { "No valid authentication found, returning 401" }
        return ResponseEntity.status(401).build()
    }
    
    @GetMapping("/login-failed")
    fun loginFailed(): ResponseEntity<Map<String, String>> {
        logger.warn { "Login failed endpoint called" }
        return ResponseEntity.status(401).body(mapOf("error" to "Login failed"))
    }
    
    @GetMapping("/status")
    fun getAuthStatus(@AuthenticationPrincipal principal: OAuth2User?): ResponseEntity<Map<String, Any>> {
        logger.info { "Auth status check - principal: ${principal != null}" }
        return if (principal != null) {
            ResponseEntity.ok(mapOf("authenticated" to true))
        } else {
            ResponseEntity.ok(mapOf("authenticated" to false))
        }
    }

    @GetMapping("/oauth2/callback")
    fun oauthCallback(@AuthenticationPrincipal principal: OAuth2User?): ResponseEntity<String> {
        logger.info { "OAuth2 callback endpoint called with principal: ${principal != null}" }
        if (principal != null) {
            logger.info { "Principal details: ${principal.name}, attributes: ${principal.attributes}" }
        }
        
        if (principal != null) {
            logger.info { "OAuth2 callback - principal found: ${principal.name}" }
            
            val auth = OAuth2AuthenticationToken(principal, emptyList(), "facebook")
            val user = userService.processOAuthPostLogin(auth)
            
            // Generate JWT token for the user
            val jwtToken = jwtService.generateToken(user.id, user.name, user.email)
            
            logger.info { "OAuth2 callback successful, generated JWT for user: ${user.name}" }
            
            // Redirect to frontend with token as URL parameters
            val userJson = """
                {
                    "id": ${user.id},
                    "name": "${user.name}",
                    "email": "${user.email}",
                    "profilePictureUrl": "${user.profilePictureUrl ?: ""}"
                }
            """.trimIndent().replace("\n", "").replace(" ", "")
            
            val redirectUrl = "https://formula1chatter.vercel.app/#/?token=${jwtToken}&user=${userJson}"
            
            return ResponseEntity.status(302)
                .header("Location", redirectUrl)
                .build()
        }
        
        logger.warn { "OAuth2 callback failed - no principal" }
        return ResponseEntity.status(401)
            .header("Content-Type", "text/html")
            .body("<html><body><h1>Login failed</h1></body></html>")
    }
    
    @GetMapping("/test-oauth")
    fun testOAuth(): ResponseEntity<Map<String, Any>> {
        logger.info { "OAuth2 test endpoint called" }
        
        return ResponseEntity.ok(mapOf(
            "message" to "OAuth2 endpoint accessible",
            "timestamp" to System.currentTimeMillis()
        ))
    }

    @GetMapping("/test-facebook-config")
    fun testFacebookConfig(
        @Value("\${spring.security.oauth2.client.registration.facebook.client-id:}") clientId: String,
        @Value("\${spring.security.oauth2.client.registration.facebook.client-secret:}") clientSecret: String,
        @Value("\${spring.security.oauth2.client.registration.facebook.redirect-uri:}") redirectUri: String
    ): ResponseEntity<Map<String, Any>> {
        logger.info { "Facebook config test endpoint called" }
        
        val config = mutableMapOf<String, Any>()
        
        // Check credentials
        config["clientIdConfigured"] = clientId.isNotBlank() && clientId != "dummy-client-id"
        config["clientSecretConfigured"] = clientSecret.isNotBlank() && clientSecret != "dummy-client-secret"
        config["redirectUriTemplate"] = redirectUri
        config["expectedRedirectUri"] = "https://formula1chatter.onrender.com/api/login/oauth2/code/facebook"
        config["successRedirectUrl"] = "https://formula1chatter.vercel.app/#/"
        
        // Test Facebook app accessibility
        if (clientId.isNotBlank() && clientId != "dummy-client-id") {
            try {
                val testUrl = "https://graph.facebook.com/$clientId"
                val restTemplate = RestTemplate()
                val response = restTemplate.getForObject(testUrl, String::class.java)
                
                config["facebookAppAccessible"] = response != null && response.contains("name")
                config["facebookAppResponse"] = response?.take(200) ?: "null"
            } catch (e: Exception) {
                config["facebookAppAccessible"] = false
                config["facebookAppError"] = e.message ?: "Unknown error"
            }
        } else {
            config["facebookAppAccessible"] = false
            config["facebookAppError"] = "Client ID not configured"
        }
        
        // OAuth2 endpoints
        config["oauth2AuthorizationUrl"] = "https://formula1chatter.onrender.com/api/oauth2/authorization/facebook"
        config["oauth2CallbackUrl"] = "https://formula1chatter.onrender.com/api/login/oauth2/code/facebook"
        
        return ResponseEntity.ok(config)
    }
} 