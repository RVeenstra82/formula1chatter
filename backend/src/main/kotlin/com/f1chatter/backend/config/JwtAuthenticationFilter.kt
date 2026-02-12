package com.f1chatter.backend.config

import com.f1chatter.backend.service.JwtService
import com.f1chatter.backend.service.UserService
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import mu.KotlinLogging
import org.springframework.core.env.Environment
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.core.userdetails.User
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter

@Component
class JwtAuthenticationFilter(
    private val jwtService: JwtService,
    private val userService: UserService,
    private val environment: Environment
) : OncePerRequestFilter() {

    private val logger = KotlinLogging.logger {}

    private val isDevProfile: Boolean by lazy {
        environment.activeProfiles.contains("dev")
    }

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        val authHeader = request.getHeader("Authorization")
        val token = jwtService.extractTokenFromHeader(authHeader)

        if (token != null && SecurityContextHolder.getContext().authentication == null) {
            // Handle TestUser authentication — dev profile only
            if (token == "test-token" && isDevProfile) {
                logger.debug { "TestUser authentication detected (dev profile)" }

                val userDetails: UserDetails = User.builder()
                    .username("Test User")
                    .password("")
                    .authorities("USER", "ADMIN")
                    .build()

                val authToken = UsernamePasswordAuthenticationToken(
                    userDetails,
                    null,
                    userDetails.authorities
                )
                authToken.details = WebAuthenticationDetailsSource().buildDetails(request)
                SecurityContextHolder.getContext().authentication = authToken

                logger.debug { "TestUser authentication successful" }
            } else if (token != "test-token" && jwtService.isTokenValid(token)) {
                val userId = jwtService.extractUserId(token)
                val username = jwtService.extractUsername(token)
                val email = jwtService.extractEmail(token)
                val isAdmin = jwtService.extractIsAdmin(token)

                if (userId != null && username != null && email != null) {
                    try {
                        // Verify user still exists in database
                        userService.getUserById(userId)

                        val authorities = mutableListOf<SimpleGrantedAuthority>(SimpleGrantedAuthority("USER"))
                        if (isAdmin) {
                            authorities.add(SimpleGrantedAuthority("ADMIN"))
                        }

                        val userDetails: UserDetails = User.builder()
                            .username(username)
                            .password("")
                            .authorities(authorities as Collection<SimpleGrantedAuthority>)
                            .build()

                        val authToken = UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.authorities
                        )
                        authToken.details = WebAuthenticationDetailsSource().buildDetails(request)
                        SecurityContextHolder.getContext().authentication = authToken

                        logger.debug { "JWT authentication successful for user: $username (admin=$isAdmin)" }
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
