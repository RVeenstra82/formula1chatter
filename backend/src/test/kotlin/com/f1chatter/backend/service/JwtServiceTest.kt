package com.f1chatter.backend.service

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test

class JwtServiceTest {

    private val service = JwtService(
        secretKey = "this-is-a-very-long-test-secret-key-1234567890",
        expirationSeconds = 2 // short for expiry test
    )

    @Test
    fun `generate and parse token happy path`() {
        val token = service.generateToken(42, "max", "max@example.com")

        assertTrue(service.isTokenValid(token))
        assertEquals(42L, service.extractUserId(token))
        assertEquals("max", service.extractUsername(token))
        assertEquals("max@example.com", service.extractEmail(token))
    }

    @Test
    fun `extract token from header`() {
        val t = "abc.def.ghi"
        assertEquals(t, service.extractTokenFromHeader("Bearer $t"))
        assertNull(service.extractTokenFromHeader("Basic $t"))
        assertNull(service.extractTokenFromHeader(null))
    }

    @Test
    fun `expired token returns invalid`() {
        val token = JwtService(
            secretKey = "this-is-a-very-long-test-secret-key-1234567890",
            expirationSeconds = 0
        ).generateToken(1, "u", "u@e.com")

        assertTrue(service.isTokenExpired(token))
        assertFalse(service.isTokenValid(token))
    }
}


