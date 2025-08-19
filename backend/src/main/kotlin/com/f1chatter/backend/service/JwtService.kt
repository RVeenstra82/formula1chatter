package com.f1chatter.backend.service

import io.jsonwebtoken.Claims
import io.jsonwebtoken.Jwts
import io.jsonwebtoken.security.Keys
import mu.KotlinLogging
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import java.time.Instant
import java.time.temporal.ChronoUnit
import java.util.*
import javax.crypto.SecretKey

@Service
class JwtService(
    @Value("\${jwt.secret:default-secret-key-that-is-at-least-32-characters-long-for-security}")
    private val secretKey: String,
    @Value("\${jwt.expiration:86400}") // 24 hours in seconds
    private val expirationSeconds: Long
) {
    private val logger = KotlinLogging.logger {}
    
    private val key: SecretKey by lazy {
        Keys.hmacShaKeyFor(secretKey.toByteArray())
    }
    
    /**
     * Generate a JWT token for a user
     */
    fun generateToken(userId: Long, username: String, email: String): String {
        val now = Instant.now()
        val expiration = now.plus(expirationSeconds, ChronoUnit.SECONDS)
        
        val token = Jwts.builder()
            .subject(userId.toString())
            .claim("username", username)
            .claim("email", email)
            .issuedAt(Date.from(now))
            .expiration(Date.from(expiration))
            .signWith(key)
            .compact()
            
        logger.debug { "Generated JWT token for user $userId (${username})" }
        return token
    }
    
    /**
     * Extract user ID from JWT token
     */
    fun extractUserId(token: String): Long? {
        return try {
            val claims = extractAllClaims(token)
            claims.subject.toLong()
        } catch (e: Exception) {
            logger.warn { "Failed to extract user ID from token: ${e.message}" }
            null
        }
    }
    
    /**
     * Extract username from JWT token
     */
    fun extractUsername(token: String): String? {
        return try {
            val claims = extractAllClaims(token)
            claims["username"] as? String
        } catch (e: Exception) {
            logger.warn { "Failed to extract username from token: ${e.message}" }
            null
        }
    }
    
    /**
     * Extract email from JWT token
     */
    fun extractEmail(token: String): String? {
        return try {
            val claims = extractAllClaims(token)
            claims["email"] as? String
        } catch (e: Exception) {
            logger.warn { "Failed to extract email from token: ${e.message}" }
            null
        }
    }
    
    /**
     * Validate JWT token
     */
    fun isTokenValid(token: String): Boolean {
        return try {
            val claims = extractAllClaims(token)
            val expiration = claims.expiration
            expiration.after(Date())
        } catch (e: Exception) {
            logger.debug { "Token validation failed: ${e.message}" }
            false
        }
    }
    
    /**
     * Check if token is expired
     */
    fun isTokenExpired(token: String): Boolean {
        return try {
            val claims = extractAllClaims(token)
            val expiration = claims.expiration
            expiration.before(Date())
        } catch (e: Exception) {
            logger.debug { "Token expiration check failed: ${e.message}" }
            true
        }
    }
    
    /**
     * Extract all claims from JWT token
     */
    private fun extractAllClaims(token: String): Claims {
        return Jwts.parser()
            .verifyWith(key)
            .build()
            .parseSignedClaims(token)
            .payload
    }
    
    /**
     * Extract token from Authorization header
     */
    fun extractTokenFromHeader(authHeader: String?): String? {
        return if (authHeader != null && authHeader.startsWith("Bearer ")) {
            authHeader.substring(7)
        } else {
            null
        }
    }
}
