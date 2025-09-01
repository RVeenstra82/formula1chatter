package com.f1chatter.backend.repository

import com.f1chatter.backend.model.ApiCache
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.time.LocalDateTime

@Repository
interface ApiCacheRepository : JpaRepository<ApiCache, String> {
    
    fun findByExpiresAtBefore(expiryTime: LocalDateTime): List<ApiCache>
    
    fun findByUrl(url: String): ApiCache?
    
    @Query("SELECT a FROM ApiCache a WHERE a.url = ?1 AND a.expiresAt > ?2")
    fun findValidCacheByUrl(url: String, currentTime: LocalDateTime): ApiCache?
    
    @Query("SELECT COUNT(a) FROM ApiCache a WHERE a.expiresAt > ?1")
    fun countValidCaches(currentTime: LocalDateTime): Long
    
    fun deleteByExpiresAtBefore(expiryTime: LocalDateTime)
    
    fun deleteByUrl(url: String)
}
