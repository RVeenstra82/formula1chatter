package com.f1chatter.backend.model

import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Lob
import jakarta.persistence.Table
import java.time.LocalDateTime

@Entity
@Table(name = "api_cache")
data class ApiCache(
    @Id
    val url: String,
    
    @Lob
    val responseData: String, // JSON string of the response
    
    val lastFetched: LocalDateTime,
    
    val expiresAt: LocalDateTime,
    
    val responseSize: Int, // Size of response in bytes
    
    val httpStatus: Int = 200,
    
    val errorMessage: String? = null
)
