package com.f1chatter.backend.service

import com.f1chatter.backend.model.Prediction
import com.f1chatter.backend.model.Race
import com.f1chatter.backend.model.User
import com.f1chatter.backend.repository.PredictionRepository
import com.f1chatter.backend.repository.RaceRepository
import com.f1chatter.backend.repository.UserRepository
import io.mockk.*
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.springframework.data.repository.findByIdOrNull
import java.time.LocalDate
import java.time.LocalTime
import java.util.NoSuchElementException

/**
 * Comprehensive scoring tests for main race predictions.
 *
 * Scoring rules:
 *  - 1st place correct = 5 pts
 *  - 2nd place correct = 3 pts
 *  - 3rd place correct = 1 pt
 *  - Fastest lap correct = 1 pt
 *  - Driver of the day correct = 1 pt
 *  - Maximum per race = 11 pts
 */
class RaceResultScoringTest {

    private lateinit var predictionRepository: PredictionRepository
    private lateinit var raceRepository: RaceRepository
    private lateinit var userRepository: UserRepository
    private lateinit var driverService: DriverService
    private lateinit var service: PredictionService

    private val raceId = "2026-1"

    private fun completedRace(
        firstPlace: String = "verstappen",
        secondPlace: String = "norris",
        thirdPlace: String = "leclerc",
        fastestLap: String = "verstappen",
        driverOfDay: String? = "norris"
    ) = Race(
        id = raceId, season = 2026, round = 1, raceName = "Bahrain GP",
        circuitId = "bahrain", circuitName = "Bahrain International Circuit",
        country = "Bahrain", locality = "Sakhir",
        date = LocalDate.of(2026, 3, 2), time = LocalTime.of(15, 0),
        firstPlaceDriverId = firstPlace, secondPlaceDriverId = secondPlace,
        thirdPlaceDriverId = thirdPlace, fastestLapDriverId = fastestLap,
        driverOfTheDayId = driverOfDay, raceCompleted = true
    )

    private fun user(id: Long, name: String) = User(
        id = id, facebookId = "fb$id", name = name, email = "$name@test.com", profilePictureUrl = null
    )

    private fun prediction(
        id: Long, user: User, race: Race,
        first: String, second: String, third: String,
        fastestLap: String = "", driverOfDay: String = ""
    ) = Prediction(
        id = id, user = user, race = race,
        firstPlaceDriverId = first, secondPlaceDriverId = second,
        thirdPlaceDriverId = third, fastestLapDriverId = fastestLap,
        driverOfTheDayId = driverOfDay, score = null
    )

    @BeforeEach
    fun setup() {
        predictionRepository = mockk(relaxed = true)
        raceRepository = mockk()
        userRepository = mockk(relaxed = true)
        driverService = mockk(relaxed = true)
        service = PredictionService(predictionRepository, raceRepository, userRepository, driverService)
        mockkStatic("org.springframework.data.repository.CrudRepositoryExtensionsKt")
    }

    private fun setupSinglePredictionTest(race: Race, p: Prediction, expectedScore: Int) {
        every { raceRepository.findByIdOrNull(raceId) } returns race
        every { predictionRepository.findByRaceIdOrderByScoreDesc(raceId) } returns listOf(p)
        every { predictionRepository.saveAll(any<List<Prediction>>()) } answers { firstArg() }

        service.calculateScores(raceId)

        verify { predictionRepository.saveAll(match<List<Prediction>> { list ->
            list.size == 1 && list[0].score == expectedScore
        }) }
    }

    @Nested
    inner class HappyPaths {

        @Test
        fun `perfect prediction scores maximum 11 points`() {
            val race = completedRace()
            val u = user(1, "Alice")
            val p = prediction(1, u, race, "verstappen", "norris", "leclerc", "verstappen", "norris")
            setupSinglePredictionTest(race, p, 11)
        }

        @Test
        fun `only podium correct scores 9 points`() {
            val race = completedRace()
            val u = user(1, "Bob")
            val p = prediction(1, u, race, "verstappen", "norris", "leclerc", "wrong", "wrong")
            setupSinglePredictionTest(race, p, 9)
        }

        @Test
        fun `only first place correct scores 5 points`() {
            val race = completedRace()
            val u = user(1, "Charlie")
            val p = prediction(1, u, race, "verstappen", "wrong", "wrong", "wrong", "wrong")
            setupSinglePredictionTest(race, p, 5)
        }

        @Test
        fun `only second place correct scores 3 points`() {
            val race = completedRace()
            val u = user(1, "Dave")
            val p = prediction(1, u, race, "wrong", "norris", "wrong", "wrong", "wrong")
            setupSinglePredictionTest(race, p, 3)
        }

        @Test
        fun `only third place correct scores 1 point`() {
            val race = completedRace()
            val u = user(1, "Eve")
            val p = prediction(1, u, race, "wrong", "wrong", "leclerc", "wrong", "wrong")
            setupSinglePredictionTest(race, p, 1)
        }

        @Test
        fun `only fastest lap correct scores 1 point`() {
            val race = completedRace()
            val u = user(1, "Frank")
            val p = prediction(1, u, race, "wrong", "wrong", "wrong", "verstappen", "wrong")
            setupSinglePredictionTest(race, p, 1)
        }

        @Test
        fun `only driver of the day correct scores 1 point`() {
            val race = completedRace()
            val u = user(1, "Grace")
            val p = prediction(1, u, race, "wrong", "wrong", "wrong", "wrong", "norris")
            setupSinglePredictionTest(race, p, 1)
        }

        @Test
        fun `first place plus fastest lap correct scores 6 points`() {
            val race = completedRace()
            val u = user(1, "Hank")
            val p = prediction(1, u, race, "verstappen", "wrong", "wrong", "verstappen", "wrong")
            setupSinglePredictionTest(race, p, 6)
        }

        @Test
        fun `multiple users scored correctly in single race`() {
            val race = completedRace()
            val u1 = user(1, "Alice")
            val u2 = user(2, "Bob")
            val u3 = user(3, "Charlie")

            // Alice: perfect = 11 pts
            val p1 = prediction(1, u1, race, "verstappen", "norris", "leclerc", "verstappen", "norris")
            // Bob: all wrong = 0 pts
            val p2 = prediction(2, u2, race, "x", "y", "z", "a", "b")
            // Charlie: 1st + FL correct = 6 pts
            val p3 = prediction(3, u3, race, "verstappen", "x", "x", "verstappen", "x")

            every { raceRepository.findByIdOrNull(raceId) } returns race
            every { predictionRepository.findByRaceIdOrderByScoreDesc(raceId) } returns listOf(p1, p2, p3)
            every { predictionRepository.saveAll(any<List<Prediction>>()) } answers { firstArg() }

            service.calculateScores(raceId)

            verify { predictionRepository.saveAll(match<List<Prediction>> { list ->
                list.any { it.id == 1L && it.score == 11 } &&
                list.any { it.id == 2L && it.score == 0 } &&
                list.any { it.id == 3L && it.score == 6 }
            }) }
        }

        @Test
        fun `no predictions for race completes without errors`() {
            val race = completedRace()
            every { raceRepository.findByIdOrNull(raceId) } returns race
            every { predictionRepository.findByRaceIdOrderByScoreDesc(raceId) } returns emptyList()

            service.calculateScores(raceId)

            verify { predictionRepository.saveAll(match<List<Prediction>> { it.isEmpty() }) }
        }

        @Test
        fun `scoring is idempotent - recalculating overwrites previous scores`() {
            val race = completedRace()
            val u = user(1, "Alice")
            // Prediction already has a score from a previous calculation
            val p = Prediction(
                id = 1, user = u, race = race,
                firstPlaceDriverId = "verstappen", secondPlaceDriverId = "wrong",
                thirdPlaceDriverId = "wrong", fastestLapDriverId = "wrong",
                driverOfTheDayId = "wrong", score = 99 // old wrong score
            )
            setupSinglePredictionTest(race, p, 5)
        }
    }

    @Nested
    inner class UnhappyPaths {

        @Test
        fun `all predictions wrong scores 0 points`() {
            val race = completedRace()
            val u = user(1, "Loser")
            val p = prediction(1, u, race, "wrong1", "wrong2", "wrong3", "wrong4", "wrong5")
            setupSinglePredictionTest(race, p, 0)
        }

        @Test
        fun `empty string predictions score 0 points`() {
            val race = completedRace()
            val u = user(1, "Empty")
            val p = prediction(1, u, race, "", "", "", "", "")
            setupSinglePredictionTest(race, p, 0)
        }

        @Test
        fun `race not found throws NoSuchElementException`() {
            every { raceRepository.findByIdOrNull("nonexistent") } returns null

            assertThrows<NoSuchElementException> {
                service.calculateScores("nonexistent")
            }
        }

        @Test
        fun `race not completed throws IllegalStateException`() {
            val race = completedRace().copy(raceCompleted = false)
            every { raceRepository.findByIdOrNull(raceId) } returns race

            val exception = assertThrows<IllegalStateException> {
                service.calculateScores(raceId)
            }
            assertEquals("Race results not available yet", exception.message)
        }

        @Test
        fun `race completed but first place null throws IllegalStateException`() {
            val race = completedRace().copy(firstPlaceDriverId = null, raceCompleted = true)
            every { raceRepository.findByIdOrNull(raceId) } returns race

            val exception = assertThrows<IllegalStateException> {
                service.calculateScores(raceId)
            }
            assertEquals("Race results not available yet", exception.message)
        }

        @Test
        fun `driver IDs are case-sensitive - different case scores 0`() {
            val race = completedRace(firstPlace = "verstappen")
            val u = user(1, "CaseMismatch")
            val p = prediction(1, u, race, "Verstappen", "wrong", "wrong", "wrong", "wrong")
            setupSinglePredictionTest(race, p, 0)
        }

        @Test
        fun `race with null DOTD does not award DOTD point even if prediction matches null`() {
            val race = completedRace(driverOfDay = null)
            val u = user(1, "NullDotd")
            // Prediction has empty DOTD
            val p = prediction(1, u, race, "verstappen", "norris", "leclerc", "verstappen", "")

            // 5+3+1+1 = 10 (no DOTD point because race DOTD is null, comparison fails)
            setupSinglePredictionTest(race, p, 10)
        }

        @Test
        fun `swapped positions score 0 for those positions`() {
            // User predicts correct drivers but in wrong positions
            val race = completedRace(firstPlace = "verstappen", secondPlace = "norris", thirdPlace = "leclerc")
            val u = user(1, "Swapped")
            val p = prediction(1, u, race, "norris", "verstappen", "leclerc", "", "")

            // Only 3rd place correct = 1 point
            setupSinglePredictionTest(race, p, 1)
        }
    }
}
