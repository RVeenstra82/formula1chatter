package com.f1chatter.backend.service

import com.f1chatter.backend.model.Prediction
import com.f1chatter.backend.model.Race
import com.f1chatter.backend.model.User
import com.f1chatter.backend.repository.ApiCacheRepository
import com.f1chatter.backend.repository.PredictionRepository
import com.f1chatter.backend.repository.RaceRepository
import com.f1chatter.backend.repository.UserRepository
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import java.time.LocalDate
import java.time.LocalTime
import org.springframework.data.repository.findByIdOrNull
import io.mockk.mockkStatic

class PredictionServiceScoringTest {
    private lateinit var predictionRepository: PredictionRepository
    private lateinit var raceRepository: RaceRepository
    private lateinit var userRepository: UserRepository
    private lateinit var driverService: DriverService
    private lateinit var apiCacheRepository: ApiCacheRepository
    private lateinit var service: PredictionService

    @BeforeEach
    fun setup() {
        predictionRepository = mockk(relaxed = true)
        raceRepository = mockk()
        userRepository = mockk(relaxed = true)
        driverService = mockk(relaxed = true)
        apiCacheRepository = mockk(relaxed = true)
        service = PredictionService(predictionRepository, raceRepository, userRepository, driverService, apiCacheRepository)
        mockkStatic("org.springframework.data.repository.CrudRepositoryExtensionsKt")
    }

    @Test
    fun `calculateScores awards points correctly for all fields`() {
        val raceId = "2025-1"
        val race = Race(
            id = raceId,
            season = 2025,
            round = 1,
            raceName = "Test GP",
            circuitId = "c",
            circuitName = "C",
            country = "",
            locality = "",
            date = LocalDate.now(),
            time = LocalTime.NOON,
            firstPlaceDriverId = "a",
            secondPlaceDriverId = "b",
            thirdPlaceDriverId = "c",
            fastestLapDriverId = "d",
            driverOfTheDayId = "e",
            raceCompleted = true
        )
        every { raceRepository.findByIdOrNull(raceId) } returns race

        val u1 = User(id = 1L, facebookId = "fb1", name = "U1", email = "u1@e.com", profilePictureUrl = null)
        val u2 = User(id = 2L, facebookId = "fb2", name = "U2", email = "u2@e.com", profilePictureUrl = null)

        val p1 = Prediction(
            id = 1,
            user = u1,
            race = race,
            firstPlaceDriverId = "a",
            secondPlaceDriverId = "b",
            thirdPlaceDriverId = "c",
            fastestLapDriverId = "d",
            driverOfTheDayId = "e",
            score = null
        )
        val p2 = Prediction(
            id = 2,
            user = u2,
            race = race,
            firstPlaceDriverId = "x",
            secondPlaceDriverId = "y",
            thirdPlaceDriverId = "z",
            fastestLapDriverId = "d",
            driverOfTheDayId = "e",
            score = null
        )

        every { predictionRepository.findByRaceIdOrderByScoreDesc(raceId) } returns listOf(p1, p2)
        every { predictionRepository.saveAll(any<List<Prediction>>()) } answers { firstArg() }

        service.calculateScores(raceId)

        // p1 should be 5+3+1+1+1 = 11 ; p2 should be 0+0+0+1+1 = 2
        verify { predictionRepository.saveAll(match<List<Prediction>> { list ->
            list.any { it.id == 1L && it.score == 11 } &&
            list.any { it.id == 2L && it.score == 2 }
        }) }
    }
}


