package com.f1chatter.backend.controller

import com.f1chatter.backend.service.StatsService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.Authentication

@RestController
@RequestMapping("/stats")
class StatsController(
    private val statsService: StatsService
) {
    
    @GetMapping("/driver-performance")
    fun getDriverPerformanceStats(): ResponseEntity<Map<String, Any>> {
        return ResponseEntity.ok(statsService.getDriverPerformanceStats())
    }
    
    @GetMapping("/prediction-accuracy")
    fun getPredictionAccuracyStats(): ResponseEntity<Map<String, Any>> {
        return ResponseEntity.ok(statsService.getPredictionAccuracyStats())
    }
    
    @GetMapping("/circuit-difficulty")
    fun getCircuitDifficultyStats(): ResponseEntity<Map<String, Any>> {
        return ResponseEntity.ok(statsService.getCircuitDifficultyStats())
    }
    
    @GetMapping("/user-comparison")
    @PreAuthorize("isAuthenticated()")
    fun getUserComparisonStats(): ResponseEntity<Map<String, Any>> {
        return ResponseEntity.ok(statsService.getUserComparisonStats())
    }
    
    @GetMapping("/season-progress")
    fun getSeasonProgressStats(): ResponseEntity<Map<String, Any>> {
        return ResponseEntity.ok(statsService.getSeasonProgressStats())
    }
    
    @GetMapping("/constructor-performance")
    fun getConstructorPerformanceStats(): ResponseEntity<Map<String, Any>> {
        return ResponseEntity.ok(statsService.getConstructorPerformanceStats())
    }
    
    @GetMapping("/overview")
    fun getStatsOverview(): ResponseEntity<Map<String, Any?>> {
        return ResponseEntity.ok(statsService.getStatsOverview())
    }
}
