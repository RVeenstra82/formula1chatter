package com.f1chatter.backend.controller

import com.f1chatter.backend.dto.SprintPredictionDto
import com.f1chatter.backend.service.SprintPredictionService
import com.f1chatter.backend.service.SprintPredictionResultDto
import org.springframework.http.ResponseEntity
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.web.bind.annotation.*
import java.util.NoSuchElementException

@RestController
@RequestMapping("/sprint-predictions")
class SprintPredictionController(
    private val sprintPredictionService: SprintPredictionService
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

    @PostMapping("/{sprintRaceId}")
    fun saveSprintPrediction(
        @PathVariable sprintRaceId: String,
        @RequestBody predictionDto: SprintPredictionDto
    ): ResponseEntity<Any> {
        return try {
            val userId = getAuthenticatedUserId()
            sprintPredictionService.saveSprintPrediction(userId, sprintRaceId, predictionDto)
            ResponseEntity.ok(predictionDto)
        } catch (e: IllegalStateException) {
            ResponseEntity.badRequest().body(mapOf("error" to e.message))
        } catch (e: NoSuchElementException) {
            ResponseEntity.status(404).body(mapOf("error" to e.message))
        }
    }
    
    @GetMapping("/user/{userId}/sprint-race/{sprintRaceId}")
    fun getUserSprintPredictionForRace(
        @PathVariable userId: Long,
        @PathVariable sprintRaceId: String
    ): ResponseEntity<SprintPredictionDto> {
        val prediction = sprintPredictionService.getUserSprintPredictionForRace(userId, sprintRaceId)
        return if (prediction != null) {
            ResponseEntity.ok(prediction)
        } else {
            ResponseEntity.notFound().build()
        }
    }
    
    @GetMapping("/sprint-race/{sprintRaceId}/results")
    fun getSprintRaceResults(@PathVariable sprintRaceId: String): ResponseEntity<List<SprintPredictionResultDto>> {
        val results = sprintPredictionService.getSprintRaceResults(sprintRaceId)
        return ResponseEntity.ok(results)
    }
}
