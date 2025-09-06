package com.f1chatter.backend.service

import com.f1chatter.backend.dto.SprintRaceDto
import com.f1chatter.backend.model.SprintRace
import com.f1chatter.backend.repository.SprintRaceRepository
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import java.time.LocalDate
import java.util.NoSuchElementException

@Service
class SprintRaceService(
    private val sprintRaceRepository: SprintRaceRepository
) {
    fun getCurrentSeasonSprintRaces(): List<SprintRaceDto> {
        val currentYear = LocalDate.now().year
        val sprintRaces = sprintRaceRepository.findBySeason(currentYear)
        return sprintRaces.map { mapToDto(it) }
    }
    
    fun getUpcomingSprintRaces(): List<SprintRaceDto> {
        val today = LocalDate.now()
        val sprintRaces = sprintRaceRepository.findUpcomingSprintRaces(today)
        return sprintRaces.map { mapToDto(it) }
    }
    
    fun getSprintRaceById(id: String): SprintRaceDto {
        val sprintRace = sprintRaceRepository.findByIdOrNull(id)
            ?: throw NoSuchElementException("Sprint race not found with id: $id")
        
        return mapToDto(sprintRace)
    }
    
    fun getSprintRaceBySeasonAndRound(season: Int, round: Int): SprintRaceDto? {
        val sprintRace = sprintRaceRepository.findBySeasonAndRound(season, round)
        return sprintRace?.let { mapToDto(it) }
    }
    
    private fun mapToDto(sprintRace: SprintRace): SprintRaceDto {
        return SprintRaceDto(
            id = sprintRace.id,
            season = sprintRace.season,
            round = sprintRace.round,
            raceName = sprintRace.raceName,
            circuitName = sprintRace.circuitName,
            country = sprintRace.country,
            locality = sprintRace.locality,
            date = sprintRace.date,
            time = sprintRace.time,
            
            // Sprint qualifying
            sprintQualifyingDate = sprintRace.sprintQualifyingDate,
            sprintQualifyingTime = sprintRace.sprintQualifyingTime,
            
            // Sprint race results
            firstPlaceDriverId = sprintRace.firstPlaceDriverId,
            secondPlaceDriverId = sprintRace.secondPlaceDriverId,
            thirdPlaceDriverId = sprintRace.thirdPlaceDriverId,
            completed = sprintRace.sprintCompleted
        )
    }
}
