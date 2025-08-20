package com.f1chatter.backend.service

import com.f1chatter.backend.dto.RaceDto
import com.f1chatter.backend.model.Race
import com.f1chatter.backend.repository.RaceRepository
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import java.time.LocalDate
import java.util.NoSuchElementException

@Service
class RaceService(
    private val raceRepository: RaceRepository
) {
    fun getCurrentSeasonRaces(): List<RaceDto> {
        val currentYear = LocalDate.now().year
        val races = raceRepository.findBySeason(currentYear)
        return races.map { mapToDto(it) }
    }
    
    fun getUpcomingRaces(): List<RaceDto> {
        val today = LocalDate.now()
        val races = raceRepository.findUpcomingRaces(today)
        return races.map { mapToDto(it) }
    }
    
    fun getNextRace(): RaceDto? {
        val today = LocalDate.now()
        val nextRace = raceRepository.findNextRace(today)
        return nextRace?.let { mapToDto(it) }
    }
    
    fun getRaceById(id: String): RaceDto {
        val race = raceRepository.findByIdOrNull(id)
            ?: throw NoSuchElementException("Race not found with id: $id")
        
        return mapToDto(race)
    }
    
    private fun mapToDto(race: Race): RaceDto {
        return RaceDto(
            id = race.id,
            season = race.season,
            round = race.round,
            raceName = race.raceName,
            circuitName = race.circuitName,
            country = race.country,
            locality = race.locality,
            date = race.date,
            time = race.time,
            firstPlaceDriverId = race.firstPlaceDriverId,
            secondPlaceDriverId = race.secondPlaceDriverId,
            thirdPlaceDriverId = race.thirdPlaceDriverId,
            fastestLapDriverId = race.fastestLapDriverId,
            driverOfTheDayId = race.driverOfTheDayId,
            completed = race.raceCompleted
        )
    }
} 