package com.f1chatter.backend.controller

import com.f1chatter.backend.dto.SprintRaceDto
import com.f1chatter.backend.service.SprintRaceService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/sprint-races")
class SprintRaceController(
    private val sprintRaceService: SprintRaceService
) {
    @GetMapping("/current-season")
    fun getCurrentSeasonSprintRaces(): ResponseEntity<List<SprintRaceDto>> {
        val sprintRaces = sprintRaceService.getCurrentSeasonSprintRaces()
        return ResponseEntity.ok(sprintRaces)
    }
    
    @GetMapping("/upcoming")
    fun getUpcomingSprintRaces(): ResponseEntity<List<SprintRaceDto>> {
        val sprintRaces = sprintRaceService.getUpcomingSprintRaces()
        return ResponseEntity.ok(sprintRaces)
    }
    
    @GetMapping("/{id}")
    fun getSprintRaceById(@PathVariable id: String): ResponseEntity<SprintRaceDto> {
        return try {
            val sprintRace = sprintRaceService.getSprintRaceById(id)
            ResponseEntity.ok(sprintRace)
        } catch (e: Exception) {
            ResponseEntity.notFound().build()
        }
    }
    
    @GetMapping("/season/{season}/round/{round}")
    fun getSprintRaceBySeasonAndRound(
        @PathVariable season: Int,
        @PathVariable round: Int
    ): ResponseEntity<SprintRaceDto> {
        val sprintRace = sprintRaceService.getSprintRaceBySeasonAndRound(season, round)
        return if (sprintRace != null) {
            ResponseEntity.ok(sprintRace)
        } else {
            ResponseEntity.notFound().build()
        }
    }
}
