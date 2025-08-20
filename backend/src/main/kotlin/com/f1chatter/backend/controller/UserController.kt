package com.f1chatter.backend.controller

import com.f1chatter.backend.service.JwtService
import com.f1chatter.backend.service.UserService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.RequestHeader
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/users")
class UserController(
    private val userService: UserService,
    private val jwtService: JwtService
) {
    @DeleteMapping("/me")
    fun deleteMyAccount(@RequestHeader("Authorization", required = false) authHeader: String?): ResponseEntity<Map<String, String>> {
        val token = jwtService.extractTokenFromHeader(authHeader)
            ?: return ResponseEntity.status(401).body(mapOf("error" to "Unauthorized"))
        val userId = jwtService.extractUserId(token)
            ?: return ResponseEntity.status(401).body(mapOf("error" to "Unauthorized"))

        return try {
            userService.deleteUserAndData(userId)
            ResponseEntity.ok(mapOf("message" to "Account deleted"))
        } catch (e: Exception) {
            ResponseEntity.status(500).body(mapOf("error" to (e.message ?: "Failed to delete account")))
        }
    }
}


