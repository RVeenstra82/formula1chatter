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
import org.springframework.data.repository.findByIdOrNull
import io.mockk.mockkStatic

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
        mockkStatic("org.springframework.data.repository.CrudRepositoryExtensionsKt")
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
        
        every { userRepository.findByIdOrNull(userId) } returns user
        every { raceRepository.findByIdOrNull(raceId) } returns race
        every { predictionRepository.findByUserAndRace(user, race) } returns null
        
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
        
        every { userRepository.findByIdOrNull(userId) } returns existingPrediction.user
        every { raceRepository.findByIdOrNull(raceId) } returns existingPrediction.race
        every { predictionRepository.findByUserAndRace(existingPrediction.user, existingPrediction.race) } returns existingPrediction
        
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
        
        every { userRepository.findByIdOrNull(userId) } returns user
        every { raceRepository.findByIdOrNull(raceId) } returns race
        every { predictionRepository.findByUserAndRace(user, race) } returns null
        
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
        
        every { raceRepository.findByIdOrNull(raceId) } returns race
        
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
        
        every { raceRepository.findByIdOrNull(raceId) } returns race
        every { predictionRepository.findByRaceIdOrderByScoreDesc(raceId) } returns listOf(prediction1, prediction2)
        every { predictionRepository.save(any()) } answers { firstArg() }
        
        // Act
        predictionService.calculateScores(raceId)
        
        // Assert
        verify { predictionRepository.save(match { it.id == 1L && it.score == 10 }) }
        verify { predictionRepository.save(match { it.id == 2L && it.score == 2 }) }
    }
    
    @Test
    fun `savePrediction allows prediction for race far in the future`() {
        val userId = 1L
        val raceId = "2026-1"
        val predictionDto = PredictionDto(
            firstPlaceDriverId = "verstappen",
            secondPlaceDriverId = "norris",
            thirdPlaceDriverId = "leclerc",
            fastestLapDriverId = "hamilton",
            driverOfTheDayId = "russell"
        )

        val user = User(id = userId, facebookId = "fb123", name = "Test User", email = "test@example.com", profilePictureUrl = null)
        val race = Race(
            id = raceId, season = 2026, round = 1,
            raceName = "Australian Grand Prix", circuitId = "albert_park",
            circuitName = "Albert Park", country = "Australia", locality = "Melbourne",
            date = LocalDate.now().plusDays(23), time = LocalTime.of(4, 0),
            raceCompleted = false
        )

        every { userRepository.findByIdOrNull(userId) } returns user
        every { raceRepository.findByIdOrNull(raceId) } returns race
        every { predictionRepository.findByUserAndRace(user, race) } returns null
        every { predictionRepository.save(any()) } answers { firstArg() }

        // Should NOT throw - race is 23 days away
        val result = predictionService.savePrediction(userId, raceId, predictionDto)
        assertNotNull(result)
        assertEquals("verstappen", result.firstPlaceDriverId)
    }

    @Test
    fun `savePrediction blocks prediction for completed race`() {
        val userId = 1L
        val raceId = "2025-1"
        val predictionDto = PredictionDto(
            firstPlaceDriverId = "verstappen",
            secondPlaceDriverId = "norris",
            thirdPlaceDriverId = "leclerc",
            fastestLapDriverId = "hamilton",
            driverOfTheDayId = "russell"
        )

        val user = User(id = userId, facebookId = "fb123", name = "Test User", email = "test@example.com", profilePictureUrl = null)
        val race = Race(
            id = raceId, season = 2025, round = 1,
            raceName = "Completed Grand Prix", circuitId = "test",
            circuitName = "Test Circuit", country = "Test", locality = "Test",
            date = LocalDate.now().minusDays(7), time = LocalTime.of(14, 0),
            raceCompleted = true,
            firstPlaceDriverId = "verstappen"
        )

        every { userRepository.findByIdOrNull(userId) } returns user
        every { raceRepository.findByIdOrNull(raceId) } returns race

        val exception = assertThrows<IllegalStateException> {
            predictionService.savePrediction(userId, raceId, predictionDto)
        }
        assertEquals("Predictions are no longer accepted. Race has been completed.", exception.message)
    }

    @Test
    fun `savePrediction blocks prediction for race that has already started`() {
        val userId = 1L
        val raceId = "2025-2"
        val predictionDto = PredictionDto(
            firstPlaceDriverId = "verstappen",
            secondPlaceDriverId = "norris",
            thirdPlaceDriverId = "leclerc",
            fastestLapDriverId = "hamilton",
            driverOfTheDayId = "russell"
        )

        val user = User(id = userId, facebookId = "fb123", name = "Test User", email = "test@example.com", profilePictureUrl = null)
        val race = Race(
            id = raceId, season = 2025, round = 2,
            raceName = "Started Grand Prix", circuitId = "test",
            circuitName = "Test Circuit", country = "Test", locality = "Test",
            date = LocalDate.now().minusDays(1), time = LocalTime.of(14, 0),
            raceCompleted = false
        )

        every { userRepository.findByIdOrNull(userId) } returns user
        every { raceRepository.findByIdOrNull(raceId) } returns race

        val exception = assertThrows<IllegalStateException> {
            predictionService.savePrediction(userId, raceId, predictionDto)
        }
        assertEquals("Predictions are no longer accepted. Race starts within 5 minutes or has already started.", exception.message)
    }

    @Test
    fun `savePrediction blocks prediction within 5 minutes of race start`() {
        val userId = 1L
        val raceId = "2025-3"
        val predictionDto = PredictionDto(
            firstPlaceDriverId = "verstappen",
            secondPlaceDriverId = "norris",
            thirdPlaceDriverId = "leclerc",
            fastestLapDriverId = "hamilton",
            driverOfTheDayId = "russell"
        )

        val user = User(id = userId, facebookId = "fb123", name = "Test User", email = "test@example.com", profilePictureUrl = null)
        // Race starts 3 minutes from now (within 5-minute window)
        val raceDateTime = java.time.LocalDateTime.now(java.time.ZoneOffset.UTC).plusMinutes(3)
        val race = Race(
            id = raceId, season = 2025, round = 3,
            raceName = "Soon Grand Prix", circuitId = "test",
            circuitName = "Test Circuit", country = "Test", locality = "Test",
            date = raceDateTime.toLocalDate(), time = raceDateTime.toLocalTime(),
            raceCompleted = false
        )

        every { userRepository.findByIdOrNull(userId) } returns user
        every { raceRepository.findByIdOrNull(raceId) } returns race

        val exception = assertThrows<IllegalStateException> {
            predictionService.savePrediction(userId, raceId, predictionDto)
        }
        assertEquals("Predictions are no longer accepted. Race starts within 5 minutes or has already started.", exception.message)
    }

    @Test
    fun `savePrediction allows prediction 10 minutes before race start`() {
        val userId = 1L
        val raceId = "2025-4"
        val predictionDto = PredictionDto(
            firstPlaceDriverId = "verstappen",
            secondPlaceDriverId = "norris",
            thirdPlaceDriverId = "leclerc",
            fastestLapDriverId = "hamilton",
            driverOfTheDayId = "russell"
        )

        val user = User(id = userId, facebookId = "fb123", name = "Test User", email = "test@example.com", profilePictureUrl = null)
        // Race starts 10 minutes from now (outside 5-minute window)
        val raceDateTime = java.time.LocalDateTime.now(java.time.ZoneOffset.UTC).plusMinutes(10)
        val race = Race(
            id = raceId, season = 2025, round = 4,
            raceName = "Upcoming Grand Prix", circuitId = "test",
            circuitName = "Test Circuit", country = "Test", locality = "Test",
            date = raceDateTime.toLocalDate(), time = raceDateTime.toLocalTime(),
            raceCompleted = false
        )

        every { userRepository.findByIdOrNull(userId) } returns user
        every { raceRepository.findByIdOrNull(raceId) } returns race
        every { predictionRepository.findByUserAndRace(user, race) } returns null
        every { predictionRepository.save(any()) } answers { firstArg() }

        // Should NOT throw - race is 10 minutes away
        val result = predictionService.savePrediction(userId, raceId, predictionDto)
        assertNotNull(result)
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