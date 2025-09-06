package com.f1chatter.backend.config

import com.f1chatter.backend.service.JwtService
import com.f1chatter.backend.service.UserService
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import mu.KotlinLogging
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.core.userdetails.User
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter

@Component
class JwtAuthenticationFilter(
    private val jwtService: JwtService,
    private val userService: UserService
) : OncePerRequestFilter() {
    
    private val logger = KotlinLogging.logger {}
    
    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        val authHeader = request.getHeader("Authorization")
        val token = jwtService.extractTokenFromHeader(authHeader)
        
        if (token != null && SecurityContextHolder.getContext().authentication == null) {
            // Handle TestUser authentication
            if (token == "test-token") {
                logger.debug { "TestUser authentication detected" }
                
                // Create UserDetails for TestUser
                val userDetails: UserDetails = User.builder()
                    .username("Test User")
                    .password("") // No password needed for JWT auth
                    .authorities("USER", "ADMIN") // TestUser has admin rights
                    .build()
                
                // Create authentication token
                val authToken = UsernamePasswordAuthenticationToken(
                    userDetails,
                    null,
                    userDetails.authorities
                )
                authToken.details = WebAuthenticationDetailsSource().buildDetails(request)
                
                // Set authentication in security context
                SecurityContextHolder.getContext().authentication = authToken
                
                logger.debug { "TestUser authentication successful" }
            } else if (jwtService.isTokenValid(token)) {
                val userId = jwtService.extractUserId(token)
                val username = jwtService.extractUsername(token)
                val email = jwtService.extractEmail(token)
                
                if (userId != null && username != null && email != null) {
                    try {
                        // Verify user still exists in database
                        val userDto = userService.getUserById(userId)
                        
                        // Create UserDetails for Spring Security
                        val userDetails: UserDetails = User.builder()
                            .username(userDto.name)
                            .password("") // No password needed for JWT auth
                            .authorities("USER")
                            .build()
                        
                        // Create authentication token
                        val authToken = UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.authorities
                        )
                        authToken.details = WebAuthenticationDetailsSource().buildDetails(request)
                        
                        // Set authentication in security context
                        SecurityContextHolder.getContext().authentication = authToken
                        
                        logger.debug { "JWT authentication successful for user: $username" }
                    } catch (e: Exception) {
                        logger.warn { "JWT authentication failed for user ID $userId: ${e.message}" }
                    }
                }
            } else {
                logger.debug { "Invalid JWT token" }
            }
        }
        
        filterChain.doFilter(request, response)
    }
}
