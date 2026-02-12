package com.f1chatter.backend.controller

import com.f1chatter.backend.dto.LeaderboardEntryDto
import com.f1chatter.backend.dto.PredictionDto
import com.f1chatter.backend.dto.PredictionResultDto
import com.f1chatter.backend.service.PredictionService
import com.f1chatter.backend.util.F1SeasonUtils
import org.springframework.http.ResponseEntity
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/predictions")
class PredictionController(
    private val predictionService: PredictionService
) {
    private fun getAuthenticatedUserId(): Long {
        val principal = SecurityContextHolder.getContext().authentication?.principal
        val username = when (principal) {
            is UserDetails -> principal.username
            is String -> principal
            else -> throw IllegalStateException("Not authenticated")
        }
        return username.toLongOrNull() ?: throw IllegalStateException("Invalid user ID in token")
    }

    @PostMapping("/{raceId}")
    fun savePrediction(
        @PathVariable raceId: String,
        @RequestBody predictionDto: PredictionDto
    ): ResponseEntity<Any> {
        return try {
            val userId = getAuthenticatedUserId()
            predictionService.savePrediction(userId, raceId, predictionDto)
            ResponseEntity.ok(predictionDto)
        } catch (e: IllegalStateException) {
            ResponseEntity.badRequest().body(mapOf("error" to e.message))
        }
    }
    
    @GetMapping("/user/{userId}/race/{raceId}")
    fun getUserPredictionForRace(
        @PathVariable userId: Long,
        @PathVariable raceId: String
    ): ResponseEntity<PredictionDto> {
        val prediction = predictionService.getUserPredictionForRace(userId, raceId)
        return if (prediction != null) {
            ResponseEntity.ok(prediction)
        } else {
            ResponseEntity.notFound().build()
        }
    }
    
    @GetMapping("/race/{raceId}/results")
    fun getRaceResults(@PathVariable raceId: String): ResponseEntity<List<PredictionResultDto>> {
        val results = predictionService.getRaceResults(raceId)
        return ResponseEntity.ok(results)
    }
    
    @GetMapping("/leaderboard")
    fun getSeasonLeaderboard(@RequestParam(required = false) season: Int?): ResponseEntity<List<LeaderboardEntryDto>> {
        val currentSeason = season ?: F1SeasonUtils.getCurrentSeason()
        val leaderboard = predictionService.getSeasonLeaderboard(currentSeason)
        return ResponseEntity.ok(leaderboard)
    }
    
    @GetMapping("/user/{userId}/score")
    fun getUserSeasonScore(
        @PathVariable userId: Long,
        @RequestParam(required = false) season: Int?
    ): ResponseEntity<Int> {
        val currentSeason = season ?: F1SeasonUtils.getCurrentSeason()
        val score = predictionService.getUserSeasonScore(userId, currentSeason)
        return ResponseEntity.ok(score)
    }
} 