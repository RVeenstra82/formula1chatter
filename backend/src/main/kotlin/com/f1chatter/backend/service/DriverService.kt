package com.f1chatter.backend.service

import com.f1chatter.backend.dto.DriverDto
import com.f1chatter.backend.model.Driver
import com.f1chatter.backend.repository.ConstructorRepository
import com.f1chatter.backend.repository.DriverRepository
import com.f1chatter.backend.repository.RaceRepository
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import java.time.LocalDate
import java.util.NoSuchElementException

@Service
class DriverService(
    private val driverRepository: DriverRepository,
    private val raceRepository: RaceRepository,
    private val constructorRepository: ConstructorRepository,
    private val openF1ApiService: OpenF1ApiService
) {
    fun getAllDrivers(): List<DriverDto> {
        return driverRepository.findAll().map { mapToDto(it) }
    }
    
    fun getDriverById(id: String): DriverDto {
        val driver = driverRepository.findByIdOrNull(id)
            ?: throw NoSuchElementException("Driver not found with id: $id")
        
        return mapToDto(driver)
    }

    fun getActiveDriversForRace(raceId: String): List<DriverDto> {
        val race = raceRepository.findByIdOrNull(raceId)
            ?: throw NoSuchElementException("Race not found with id: $raceId") 

        // Only hit OpenF1 on race day or later. For future dates, fall back to DB to keep UI fast.
        val participants = if (!race.date.isAfter(LocalDate.now())) {
            openF1ApiService.fetchActiveDriversForDate(race.date, constructorRepository)
        } else emptyList()

        val driversSource = if (participants.isNotEmpty()) participants else driverRepository.findAll()

        // Limit to max 2 per team, consistent ordering for UI
        val perTeamCount = mutableMapOf<String?, Int>()
        val filtered = driversSource
            .sortedWith(compareBy(
                { it.constructor?.name ?: "" },
                { it.permanentNumber?.toIntOrNull() ?: Int.MAX_VALUE },
                { it.familyName },
                { it.givenName }
            ))
            .filter { driver ->
                val teamId = driver.constructor?.id
                val count = perTeamCount.getOrDefault(teamId, 0)
                if (count < 2) {
                    perTeamCount[teamId] = count + 1
                    true
                } else {
                    false
                }
            }

        return filtered.map { mapToDto(it) }
    }
    
    private fun mapToDto(driver: Driver): DriverDto {
        return DriverDto(
            id = driver.id,
            code = driver.code,
            number = driver.permanentNumber,
            firstName = driver.givenName,
            lastName = driver.familyName,
            nationality = driver.nationality,
            constructorId = driver.constructor?.id,
            constructorName = driver.constructor?.name,
            profilePictureUrl = driver.profilePictureUrl
        )
    }
} 