package com.f1chatter.backend.config

import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.oauth2.core.user.OAuth2User
import org.springframework.stereotype.Component

@Component
class AuthenticationHelper(
    private val userService: com.f1chatter.backend.service.UserService
) {

    fun getAuthenticatedUserId(): Long {
        val authentication = SecurityContextHolder.getContext().authentication
            ?: throw IllegalStateException("Not authenticated")
        val principal = authentication.principal
        val username = when (principal) {
            is UserDetails -> {
                if (principal.username == "anonymousUser") throw IllegalStateException("Not authenticated")
                principal.username
            }
            is OAuth2User -> {
                // Fallback for OAuth2 session auth — look up user by Facebook ID
                val facebookId = principal.name
                    ?: throw IllegalStateException("Not authenticated")
                val user = userService.findByFacebookId(facebookId)
                    ?: throw IllegalStateException("Not authenticated: user not found")
                return user.id
            }
            is String -> if (principal == "anonymousUser") throw IllegalStateException("Not authenticated") else principal
            else -> throw IllegalStateException("Not authenticated. Please use a JWT token for API requests.")
        }
        return username.toLongOrNull() ?: throw IllegalStateException("Invalid user ID in token")
    }
}
