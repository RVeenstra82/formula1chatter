package com.f1chatter.backend.controller

import com.f1chatter.backend.dto.RaceDto
import com.f1chatter.backend.service.RaceService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/races")
class RaceController(
    private val raceService: RaceService
) {
    @GetMapping("/current-season")
    fun getCurrentSeasonRaces(): ResponseEntity<List<RaceDto>> {
        val races = raceService.getCurrentSeasonRaces()
        return ResponseEntity.ok(races)
    }
    
    @GetMapping("/upcoming")
    fun getUpcomingRaces(): ResponseEntity<List<RaceDto>> {
        val races = raceService.getUpcomingRaces()
        return ResponseEntity.ok(races)
    }
    
    @GetMapping("/next")
    fun getNextRace(): ResponseEntity<RaceDto> {
        val race = raceService.getNextRace()
        return if (race != null) {
            ResponseEntity.ok(race)
        } else {
            ResponseEntity.notFound().build()
        }
    }
    
    @GetMapping("/{id}")
    fun getRaceById(@PathVariable id: String): ResponseEntity<RaceDto> {
        return try {
            val race = raceService.getRaceById(id)
            ResponseEntity.ok(race)
        } catch (e: Exception) {
            ResponseEntity.notFound().build()
        }
    }
} 