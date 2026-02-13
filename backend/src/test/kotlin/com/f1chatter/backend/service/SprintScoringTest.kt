package com.f1chatter.backend.service

import com.f1chatter.backend.model.SprintPrediction
import com.f1chatter.backend.model.SprintRace
import com.f1chatter.backend.model.User
import com.f1chatter.backend.repository.SprintPredictionRepository
import com.f1chatter.backend.repository.SprintRaceRepository
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
 * Comprehensive scoring tests for sprint race predictions.
 *
 * Sprint scoring rules (no fastest lap or DOTD):
 *  - 1st place correct = 5 pts
 *  - 2nd place correct = 3 pts
 *  - 3rd place correct = 1 pt
 *  - Maximum per sprint = 9 pts
 */
class SprintScoringTest {

    private lateinit var sprintPredictionRepository: SprintPredictionRepository
    private lateinit var sprintRaceRepository: SprintRaceRepository
    private lateinit var userRepository: UserRepository
    private lateinit var service: SprintPredictionService

    private val sprintId = "2026-1-sprint"

    private fun completedSprint(
        firstPlace: String = "verstappen",
        secondPlace: String = "norris",
        thirdPlace: String = "leclerc"
    ) = SprintRace(
        id = sprintId, season = 2026, round = 1, raceName = "Bahrain GP Sprint",
        circuitId = "bahrain", circuitName = "Bahrain International Circuit",
        country = "Bahrain", locality = "Sakhir",
        date = LocalDate.of(2026, 3, 1), time = LocalTime.of(14, 30),
        firstPlaceDriverId = firstPlace, secondPlaceDriverId = secondPlace,
        thirdPlaceDriverId = thirdPlace, sprintCompleted = true
    )

    private fun user(id: Long, name: String) = User(
        id = id, facebookId = "fb$id", name = name, email = "$name@test.com", profilePictureUrl = null
    )

    private fun sprintPrediction(
        id: Long, user: User, sprint: SprintRace,
        first: String, second: String, third: String
    ) = SprintPrediction(
        id = id, user = user, sprintRace = sprint,
        firstPlaceDriverId = first, secondPlaceDriverId = second,
        thirdPlaceDriverId = third, score = null
    )

    @BeforeEach
    fun setup() {
        sprintPredictionRepository = mockk(relaxed = true)
        sprintRaceRepository = mockk()
        userRepository = mockk(relaxed = true)
        service = SprintPredictionService(sprintPredictionRepository, sprintRaceRepository, userRepository)
        mockkStatic("org.springframework.data.repository.CrudRepositoryExtensionsKt")
    }

    @Nested
    inner class HappyPaths {

        @Test
        fun `perfect sprint prediction scores maximum 9 points`() {
            val sprint = completedSprint()
            val u = user(1, "Alice")
            val p = sprintPrediction(1, u, sprint, "verstappen", "norris", "leclerc")

            every { sprintRaceRepository.findByIdOrNull(sprintId) } returns sprint
            every { sprintPredictionRepository.findBySprintRaceIdOrderByScoreDesc(sprintId) } returns listOf(p)
            every { sprintPredictionRepository.save(any()) } answers { firstArg() }

            service.calculateSprintScores(sprintId)

            verify { sprintPredictionRepository.save(match { it.score == 9 }) }
        }

        @Test
        fun `only first place correct scores 5 points`() {
            val sprint = completedSprint()
            val u = user(1, "Bob")
            val p = sprintPrediction(1, u, sprint, "verstappen", "wrong", "wrong")

            every { sprintRaceRepository.findByIdOrNull(sprintId) } returns sprint
            every { sprintPredictionRepository.findBySprintRaceIdOrderByScoreDesc(sprintId) } returns listOf(p)
            every { sprintPredictionRepository.save(any()) } answers { firstArg() }

            service.calculateSprintScores(sprintId)

            verify { sprintPredictionRepository.save(match { it.score == 5 }) }
        }

        @Test
        fun `only second place correct scores 3 points`() {
            val sprint = completedSprint()
            val u = user(1, "Charlie")
            val p = sprintPrediction(1, u, sprint, "wrong", "norris", "wrong")

            every { sprintRaceRepository.findByIdOrNull(sprintId) } returns sprint
            every { sprintPredictionRepository.findBySprintRaceIdOrderByScoreDesc(sprintId) } returns listOf(p)
            every { sprintPredictionRepository.save(any()) } answers { firstArg() }

            service.calculateSprintScores(sprintId)

            verify { sprintPredictionRepository.save(match { it.score == 3 }) }
        }

        @Test
        fun `only third place correct scores 1 point`() {
            val sprint = completedSprint()
            val u = user(1, "Dave")
            val p = sprintPrediction(1, u, sprint, "wrong", "wrong", "leclerc")

            every { sprintRaceRepository.findByIdOrNull(sprintId) } returns sprint
            every { sprintPredictionRepository.findBySprintRaceIdOrderByScoreDesc(sprintId) } returns listOf(p)
            every { sprintPredictionRepository.save(any()) } answers { firstArg() }

            service.calculateSprintScores(sprintId)

            verify { sprintPredictionRepository.save(match { it.score == 1 }) }
        }

        @Test
        fun `second and third correct scores 4 points`() {
            val sprint = completedSprint()
            val u = user(1, "Eve")
            val p = sprintPrediction(1, u, sprint, "wrong", "norris", "leclerc")

            every { sprintRaceRepository.findByIdOrNull(sprintId) } returns sprint
            every { sprintPredictionRepository.findBySprintRaceIdOrderByScoreDesc(sprintId) } returns listOf(p)
            every { sprintPredictionRepository.save(any()) } answers { firstArg() }

            service.calculateSprintScores(sprintId)

            verify { sprintPredictionRepository.save(match { it.score == 4 }) }
        }

        @Test
        fun `multiple users scored correctly in single sprint`() {
            val sprint = completedSprint()
            val u1 = user(1, "Alice")
            val u2 = user(2, "Bob")

            val p1 = sprintPrediction(1, u1, sprint, "verstappen", "norris", "leclerc") // 9
            val p2 = sprintPrediction(2, u2, sprint, "verstappen", "wrong", "wrong")    // 5

            every { sprintRaceRepository.findByIdOrNull(sprintId) } returns sprint
            every { sprintPredictionRepository.findBySprintRaceIdOrderByScoreDesc(sprintId) } returns listOf(p1, p2)
            every { sprintPredictionRepository.save(any()) } answers { firstArg() }

            service.calculateSprintScores(sprintId)

            verify { sprintPredictionRepository.save(match { it.id == 1L && it.score == 9 }) }
            verify { sprintPredictionRepository.save(match { it.id == 2L && it.score == 5 }) }
        }
    }

    @Nested
    inner class UnhappyPaths {

        @Test
        fun `all predictions wrong scores 0 points`() {
            val sprint = completedSprint()
            val u = user(1, "Loser")
            val p = sprintPrediction(1, u, sprint, "x", "y", "z")

            every { sprintRaceRepository.findByIdOrNull(sprintId) } returns sprint
            every { sprintPredictionRepository.findBySprintRaceIdOrderByScoreDesc(sprintId) } returns listOf(p)
            every { sprintPredictionRepository.save(any()) } answers { firstArg() }

            service.calculateSprintScores(sprintId)

            verify { sprintPredictionRepository.save(match { it.score == 0 }) }
        }

        @Test
        fun `empty string predictions score 0 points`() {
            val sprint = completedSprint()
            val u = user(1, "Empty")
            val p = sprintPrediction(1, u, sprint, "", "", "")

            every { sprintRaceRepository.findByIdOrNull(sprintId) } returns sprint
            every { sprintPredictionRepository.findBySprintRaceIdOrderByScoreDesc(sprintId) } returns listOf(p)
            every { sprintPredictionRepository.save(any()) } answers { firstArg() }

            service.calculateSprintScores(sprintId)

            verify { sprintPredictionRepository.save(match { it.score == 0 }) }
        }

        @Test
        fun `sprint not found throws NoSuchElementException`() {
            every { sprintRaceRepository.findByIdOrNull("nonexistent") } returns null

            assertThrows<NoSuchElementException> {
                service.calculateSprintScores("nonexistent")
            }
        }

        @Test
        fun `sprint not completed throws IllegalStateException`() {
            val sprint = completedSprint().copy(sprintCompleted = false)
            every { sprintRaceRepository.findByIdOrNull(sprintId) } returns sprint

            val exception = assertThrows<IllegalStateException> {
                service.calculateSprintScores(sprintId)
            }
            assertEquals("Sprint race results not available yet", exception.message)
        }

        @Test
        fun `sprint completed but first place null throws IllegalStateException`() {
            val sprint = completedSprint().copy(firstPlaceDriverId = null, sprintCompleted = true)
            every { sprintRaceRepository.findByIdOrNull(sprintId) } returns sprint

            assertThrows<IllegalStateException> {
                service.calculateSprintScores(sprintId)
            }
        }

        @Test
        fun `swapped positions score 0 for those positions`() {
            val sprint = completedSprint(firstPlace = "verstappen", secondPlace = "norris", thirdPlace = "leclerc")
            val u = user(1, "Swapped")
            val p = sprintPrediction(1, u, sprint, "norris", "verstappen", "leclerc")

            every { sprintRaceRepository.findByIdOrNull(sprintId) } returns sprint
            every { sprintPredictionRepository.findBySprintRaceIdOrderByScoreDesc(sprintId) } returns listOf(p)
            every { sprintPredictionRepository.save(any()) } answers { firstArg() }

            service.calculateSprintScores(sprintId)

            // Only 3rd correct = 1 point
            verify { sprintPredictionRepository.save(match { it.score == 1 }) }
        }
    }
}
