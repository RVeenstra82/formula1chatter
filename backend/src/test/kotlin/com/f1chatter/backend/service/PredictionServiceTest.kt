package com.f1chatter.backend.service

import com.f1chatter.backend.dto.PredictionDto
import com.f1chatter.backend.model.Prediction
import com.f1chatter.backend.model.Race
import com.f1chatter.backend.model.User
import com.f1chatter.backend.repository.PredictionRepository
import com.f1chatter.backend.repository.RaceRepository
import com.f1chatter.backend.repository.UserRepository
import io.mockk.every
import io.mockk.mockk
import io.mockk.slot
import io.mockk.verify
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import java.time.LocalDate
import java.time.LocalTime
import java.util.NoSuchElementException
import java.util.Optional

class PredictionServiceTest {
    
    private lateinit var predictionRepository: PredictionRepository
    private lateinit var raceRepository: RaceRepository
    private lateinit var userRepository: UserRepository
    private lateinit var driverService: DriverService
    private lateinit var predictionService: PredictionService
    
    @BeforeEach
    fun setup() {
        predictionRepository = mockk(relaxed = true)
        raceRepository = mockk()
        userRepository = mockk()
        driverService = mockk()
        predictionService = PredictionService(
            predictionRepository,
            raceRepository,
            userRepository,
            driverService
        )
    }
    
    @Test
    fun `savePrediction creates new prediction when none exists`() {
        // Arrange
        val userId = 1L
        val raceId = "2023-1"
        val predictionDto = PredictionDto(
            firstPlaceDriverId = "hamilton",
            secondPlaceDriverId = "verstappen",
            thirdPlaceDriverId = "leclerc",
            fastestLapDriverId = "hamilton",
            driverOfTheDayId = "leclerc"
        )
        
        val user = User(id = userId, facebookId = "fb123", name = "Test User", email = "test@example.com", profilePictureUrl = null)
        val race = createSampleRace(raceId, 2023, 1)
        
        every { userRepository.findById(userId) } returns Optional.of(user)
        every { raceRepository.findById(raceId) } returns Optional.of(race)
        every { predictionRepository.findByUserAndRace(user, race) } returns Optional.empty()
        
        val predictionSlot = slot<Prediction>()
        every { predictionRepository.save(capture(predictionSlot)) } answers { predictionSlot.captured }
        
        // Act
        val result = predictionService.savePrediction(userId, raceId, predictionDto)
        
        // Assert
        assertEquals(user, result.user)
        assertEquals(race, result.race)
        assertEquals("hamilton", result.firstPlaceDriverId)
        assertEquals("verstappen", result.secondPlaceDriverId)
        assertEquals("leclerc", result.thirdPlaceDriverId)
        verify { predictionRepository.save(any()) }
    }
    
    @Test
    fun `savePrediction updates existing prediction`() {
        // Arrange
        val userId = 1L
        val raceId = "2023-1"
        val existingPrediction = Prediction(
            id = 1,
            user = User(id = userId, facebookId = "fb123", name = "Test User", email = "test@example.com", profilePictureUrl = null),
            race = createSampleRace(raceId, 2023, 1),
            firstPlaceDriverId = "hamilton",
            secondPlaceDriverId = "verstappen",
            thirdPlaceDriverId = "leclerc",
            fastestLapDriverId = "hamilton",
            driverOfTheDayId = "leclerc"
        )
        
        val updatedPredictionDto = PredictionDto(
            firstPlaceDriverId = "verstappen",
            secondPlaceDriverId = "hamilton",
            thirdPlaceDriverId = "perez",
            fastestLapDriverId = "norris",
            driverOfTheDayId = "alonso"
        )
        
        every { userRepository.findById(userId) } returns Optional.of(existingPrediction.user)
        every { raceRepository.findById(raceId) } returns Optional.of(existingPrediction.race)
        every { predictionRepository.findByUserAndRace(existingPrediction.user, existingPrediction.race) } returns Optional.of(existingPrediction)
        
        val predictionSlot = slot<Prediction>()
        every { predictionRepository.save(capture(predictionSlot)) } answers { predictionSlot.captured }
        
        // Act
        val result = predictionService.savePrediction(userId, raceId, updatedPredictionDto)
        
        // Assert
        assertEquals(existingPrediction.user, result.user)
        assertEquals(existingPrediction.race, result.race)
        assertEquals("verstappen", result.firstPlaceDriverId)
        assertEquals("hamilton", result.secondPlaceDriverId)
        assertEquals("perez", result.thirdPlaceDriverId)
        assertEquals("norris", result.fastestLapDriverId)
        assertEquals("alonso", result.driverOfTheDayId)
        verify { predictionRepository.save(any()) }
    }
    
    @Test
    fun `getUserPredictionForRace returns null when no prediction exists`() {
        // Arrange
        val userId = 1L
        val raceId = "2023-1"
        val user = User(id = userId, facebookId = "fb123", name = "Test User", email = "test@example.com", profilePictureUrl = null)
        val race = createSampleRace(raceId, 2023, 1)
        
        every { userRepository.findById(userId) } returns Optional.of(user)
        every { raceRepository.findById(raceId) } returns Optional.of(race)
        every { predictionRepository.findByUserAndRace(user, race) } returns Optional.empty()
        
        // Act
        val result = predictionService.getUserPredictionForRace(userId, raceId)
        
        // Assert
        assertNull(result)
    }
    
    @Test
    fun `calculateScores throws exception if race not completed`() {
        // Arrange
        val raceId = "2023-1"
        val race = createSampleRace(raceId, 2023, 1).copy(raceCompleted = false)
        
        every { raceRepository.findById(raceId) } returns Optional.of(race)
        
        // Act & Assert
        assertThrows<IllegalStateException> {
            predictionService.calculateScores(raceId)
        }
    }
    
    @Test
    fun `calculateScores correctly calculates prediction points`() {
        // Arrange
        val raceId = "2023-1"
        val race = createSampleRace(raceId, 2023, 1).copy(
            raceCompleted = true,
            firstPlaceDriverId = "verstappen",
            secondPlaceDriverId = "hamilton",
            thirdPlaceDriverId = "leclerc",
            fastestLapDriverId = "verstappen",
            driverOfTheDayId = "alonso"
        )
        
        val prediction1 = Prediction(
            id = 1,
            user = User(id = 1L, facebookId = "fb123", name = "User 1", email = "user1@example.com", profilePictureUrl = null),
            race = race,
            firstPlaceDriverId = "verstappen", // +5 points
            secondPlaceDriverId = "hamilton",  // +3 points
            thirdPlaceDriverId = "leclerc",    // +1 point
            fastestLapDriverId = "verstappen", // +1 point
            driverOfTheDayId = "hamilton"      // +0 points (incorrect)
        )
        
        val prediction2 = Prediction(
            id = 2,
            user = User(id = 2L, facebookId = "fb456", name = "User 2", email = "user2@example.com", profilePictureUrl = null),
            race = race,
            firstPlaceDriverId = "hamilton",    // +0 points (incorrect)
            secondPlaceDriverId = "verstappen", // +0 points (incorrect)
            thirdPlaceDriverId = "sainz",       // +0 points (incorrect)
            fastestLapDriverId = "verstappen",  // +1 point
            driverOfTheDayId = "alonso"         // +1 point
        )
        
        every { raceRepository.findById(raceId) } returns Optional.of(race)
        every { predictionRepository.findByRaceIdOrderByScoreDesc(raceId) } returns listOf(prediction1, prediction2)
        every { predictionRepository.save(any()) } answers { firstArg() }
        
        // Act
        predictionService.calculateScores(raceId)
        
        // Assert
        verify { predictionRepository.save(match { it.id == 1L && it.score == 10 }) }
        verify { predictionRepository.save(match { it.id == 2L && it.score == 2 }) }
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