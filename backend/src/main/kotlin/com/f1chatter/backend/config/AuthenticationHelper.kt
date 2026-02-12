package com.f1chatter.backend.config

import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.stereotype.Component

@Component
class AuthenticationHelper {

    fun getAuthenticatedUserId(): Long {
        val authentication = SecurityContextHolder.getContext().authentication
            ?: throw IllegalStateException("Not authenticated")
        val principal = authentication.principal
        val username = when (principal) {
            is UserDetails -> {
                if (principal.username == "anonymousUser") throw IllegalStateException("Not authenticated")
                principal.username
            }
            is String -> if (principal == "anonymousUser") throw IllegalStateException("Not authenticated") else principal
            else -> throw IllegalStateException("Not authenticated. Please use a JWT token for API requests.")
        }
        return username.toLongOrNull() ?: throw IllegalStateException("Invalid user ID in token")
    }
}
