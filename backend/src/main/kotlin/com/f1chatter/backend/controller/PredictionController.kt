package com.f1chatter.backend.controller

import com.f1chatter.backend.dto.LeaderboardEntryDto
import com.f1chatter.backend.dto.PredictionDto
import com.f1chatter.backend.dto.PredictionResultDto
import com.f1chatter.backend.service.PredictionService
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.core.user.OAuth2User
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/predictions")
class PredictionController(
    private val predictionService: PredictionService
) {
    @PostMapping("/{raceId}")
    fun savePrediction(
        @PathVariable raceId: String,
        @RequestBody predictionDto: PredictionDto,
        @RequestParam userId: Long
    ): ResponseEntity<Any> {
        return try {
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
        val currentSeason = season ?: java.time.LocalDate.now().year
        val leaderboard = predictionService.getSeasonLeaderboard(currentSeason)
        return ResponseEntity.ok(leaderboard)
    }
    
    @GetMapping("/user/{userId}/score")
    fun getUserSeasonScore(
        @PathVariable userId: Long,
        @RequestParam(required = false) season: Int?
    ): ResponseEntity<Int> {
        val currentSeason = season ?: java.time.LocalDate.now().year
        val score = predictionService.getUserSeasonScore(userId, currentSeason)
        return ResponseEntity.ok(score)
    }
} 