package com.f1chatter.backend.controller

import com.f1chatter.backend.dto.UserDto
import com.f1chatter.backend.service.UserService
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken
import org.springframework.security.oauth2.core.user.OAuth2User
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import mu.KotlinLogging
import javax.servlet.http.HttpServletRequest

@RestController
@RequestMapping("/auth")
class AuthController(
    private val userService: UserService
) {
    private val logger = KotlinLogging.logger {}
    
    @GetMapping("/user")
    fun getUser(@AuthenticationPrincipal principal: OAuth2User?): ResponseEntity<UserDto> {
        logger.info { "AuthController.getUser called with principal: ${principal != null}" }
        
        if (principal == null) {
            logger.warn { "No principal found, returning 401" }
            return ResponseEntity.status(401).build()
        }
        
        logger.info { "Principal found: ${principal.name}, attributes: ${principal.attributes}" }
        
        val auth = OAuth2AuthenticationToken(principal, emptyList(), "facebook")
        val user = userService.processOAuthPostLogin(auth)
        
        logger.info { "User processed successfully: ${user.name}" }
        return ResponseEntity.ok(user)
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

    @GetMapping("/debug")
    fun debugAuth(request: HttpServletRequest): ResponseEntity<Map<String, Any>> {
        logger.info { "Debug endpoint called" }
        
        val session = request.getSession(false)
        val sessionId = session?.id
        val cookies = request.cookies?.map { "${it.name}=${it.value}" } ?: emptyList()
        
        logger.info { "Session ID: $sessionId" }
        logger.info { "Cookies: $cookies" }
        
        return ResponseEntity.ok(mapOf(
            "sessionId" to (sessionId ?: "null"),
            "cookies" to cookies,
            "userAgent" to (request.getHeader("User-Agent") ?: "unknown"),
            "origin" to (request.getHeader("Origin") ?: "unknown"),
            "referer" to (request.getHeader("Referer") ?: "unknown")
        ))
    }
} 