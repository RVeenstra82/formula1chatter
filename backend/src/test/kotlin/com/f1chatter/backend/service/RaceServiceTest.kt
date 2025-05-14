package com.f1chatter.backend.service

import com.f1chatter.backend.dto.RaceDto
import com.f1chatter.backend.model.Race
import com.f1chatter.backend.repository.RaceRepository
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import java.time.LocalDate
import java.time.LocalTime
import java.util.NoSuchElementException
import java.util.Optional

class RaceServiceTest {
    
    private lateinit var raceRepository: RaceRepository
    private lateinit var raceService: RaceService
    
    @BeforeEach
    fun setup() {
        raceRepository = mockk()
        raceService = RaceService(raceRepository)
    }
    
    @Test
    fun `getCurrentSeasonRaces returns mapped races for current year`() {
        // Arrange
        val currentYear = LocalDate.now().year
        val races = listOf(
            createSampleRace("2023-1", currentYear, 1),
            createSampleRace("2023-2", currentYear, 2)
        )
        
        every { raceRepository.findBySeason(currentYear) } returns races
        
        // Act
        val result = raceService.getCurrentSeasonRaces()
        
        // Assert
        assertEquals(2, result.size)
        assertEquals("2023-1", result[0].id)
        assertEquals("2023-2", result[1].id)
        verify { raceRepository.findBySeason(currentYear) }
    }
    
    @Test
    fun `getUpcomingRaces returns races after today`() {
        // Arrange
        val today = LocalDate.now()
        val races = listOf(
            createSampleRace("2023-3", 2023, 3),
            createSampleRace("2023-4", 2023, 4)
        )
        
        every { raceRepository.findUpcomingRaces(today) } returns races
        
        // Act
        val result = raceService.getUpcomingRaces()
        
        // Assert
        assertEquals(2, result.size)
        assertEquals("2023-3", result[0].id)
        assertEquals("2023-4", result[1].id)
        verify { raceRepository.findUpcomingRaces(today) }
    }
    
    @Test
    fun `getNextRace returns next upcoming race`() {
        // Arrange
        val today = LocalDate.now()
        val race = createSampleRace("2023-5", 2023, 5)
        
        every { raceRepository.findNextRace(today) } returns Optional.of(race)
        
        // Act
        val result = raceService.getNextRace()
        
        // Assert
        assertEquals("2023-5", result?.id)
        verify { raceRepository.findNextRace(today) }
    }
    
    @Test
    fun `getNextRace returns null when no upcoming races`() {
        // Arrange
        val today = LocalDate.now()
        
        every { raceRepository.findNextRace(today) } returns Optional.empty()
        
        // Act
        val result = raceService.getNextRace()
        
        // Assert
        assertNull(result)
        verify { raceRepository.findNextRace(today) }
    }
    
    @Test
    fun `getRaceById returns race when found`() {
        // Arrange
        val raceId = "2023-6"
        val race = createSampleRace(raceId, 2023, 6)
        
        every { raceRepository.findById(raceId) } returns Optional.of(race)
        
        // Act
        val result = raceService.getRaceById(raceId)
        
        // Assert
        assertEquals(raceId, result.id)
        verify { raceRepository.findById(raceId) }
    }
    
    @Test
    fun `getRaceById throws exception when race not found`() {
        // Arrange
        val raceId = "2023-7"
        
        every { raceRepository.findById(raceId) } returns Optional.empty()
        
        // Act & Assert
        org.junit.jupiter.api.assertThrows<NoSuchElementException> {
            raceService.getRaceById(raceId)
        }
        
        verify { raceRepository.findById(raceId) }
    }
    
    private fun createSampleRace(id: String, season: Int, round: Int): Race {
        return Race(
            id = id,
            season = season,
            round = round,
            raceName = "Test Grand Prix",
            circuitId = "test",
            circuitName = "Test Circuit",
            country = "Test Country",
            locality = "Test City",
            date = LocalDate.now().plusDays(round.toLong()),
            time = LocalTime.NOON,
            firstPlaceDriverId = null,
            secondPlaceDriverId = null,
            thirdPlaceDriverId = null,
            fastestLapDriverId = null,
            driverOfTheDayId = null,
            raceCompleted = false
        )
    }
} 