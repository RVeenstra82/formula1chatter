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

@RestController
@RequestMapping("/auth")
class AuthController(
    private val userService: UserService
) {
    @GetMapping("/user")
    fun getUser(@AuthenticationPrincipal principal: OAuth2User?): ResponseEntity<UserDto> {
        if (principal == null) {
            return ResponseEntity.status(401).build()
        }
        
        val auth = OAuth2AuthenticationToken(principal, emptyList(), "facebook")
        val user = userService.processOAuthPostLogin(auth)
        
        return ResponseEntity.ok(user)
    }
} 