package com.f1chatter.backend.integration

import com.f1chatter.backend.model.*
import com.f1chatter.backend.repository.*
import com.f1chatter.backend.service.PredictionService
import com.f1chatter.backend.service.SprintPredictionService
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
import java.time.LocalTime

/**
 * Full integration tests using Spring Boot + H2 database.
 * Tests the complete flow: entities persisted → score calculation → leaderboard queries.
 * This validates that JPA mappings, repository queries, and service logic work together correctly.
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class RaceResultScoringIntegrationTest {

    @Autowired private lateinit var userRepository: UserRepository
    @Autowired private lateinit var raceRepository: RaceRepository
    @Autowired private lateinit var predictionRepository: PredictionRepository
    @Autowired private lateinit var predictionService: PredictionService
    @Autowired private lateinit var sprintRaceRepository: SprintRaceRepository
    @Autowired private lateinit var sprintPredictionRepository: SprintPredictionRepository
    @Autowired private lateinit var sprintPredictionService: SprintPredictionService

    private lateinit var alice: User
    private lateinit var bob: User
    private lateinit var charlie: User

    @BeforeEach
    fun setup() {
        alice = userRepository.save(User(facebookId = "fb-alice", name = "Alice", email = "alice@test.com", profilePictureUrl = null))
        bob = userRepository.save(User(facebookId = "fb-bob", name = "Bob", email = "bob@test.com", profilePictureUrl = null))
        charlie = userRepository.save(User(facebookId = "fb-charlie", name = "Charlie", email = "charlie@test.com", profilePictureUrl = null))
    }

    private fun createRace(
        id: String, round: Int, completed: Boolean = false,
        first: String? = null, second: String? = null, third: String? = null,
        fastestLap: String? = null, dotd: String? = null
    ): Race {
        return raceRepository.save(
            Race(
                id = id, season = 2026, round = round, raceName = "Race $round",
                circuitId = "circuit-$round", circuitName = "Circuit $round",
                country = "Country", locality = "City",
                date = LocalDate.of(2026, 3, round), time = LocalTime.of(15, 0),
                firstPlaceDriverId = first, secondPlaceDriverId = second,
                thirdPlaceDriverId = third, fastestLapDriverId = fastestLap,
                driverOfTheDayId = dotd, raceCompleted = completed
            )
        )
    }

    private fun createPrediction(user: User, race: Race, first: String, second: String, third: String, fl: String = "", dotd: String = ""): Prediction {
        return predictionRepository.save(
            Prediction(user = user, race = race, firstPlaceDriverId = first, secondPlaceDriverId = second, thirdPlaceDriverId = third, fastestLapDriverId = fl, driverOfTheDayId = dotd)
        )
    }

    @Nested
    inner class MainRaceScoring {

        @Test
        fun `full flow - race completion triggers correct score calculation and persistence`() {
            val race = createRace("2026-1", 1, completed = true, first = "verstappen", second = "norris", third = "leclerc", fastestLap = "verstappen", dotd = "norris")

            // Alice: perfect prediction
            createPrediction(alice, race, "verstappen", "norris", "leclerc", "verstappen", "norris")
            // Bob: only 1st correct
            createPrediction(bob, race, "verstappen", "wrong", "wrong", "wrong", "wrong")
            // Charlie: all wrong
            createPrediction(charlie, race, "x", "y", "z", "a", "b")

            predictionService.calculateScores("2026-1")

            val results = predictionRepository.findByRaceIdOrderByScoreDesc("2026-1")
            val scores = results.associate { it.user.name to it.score }

            assertThat(scores["Alice"]).isEqualTo(11)
            assertThat(scores["Bob"]).isEqualTo(5)
            assertThat(scores["Charlie"]).isEqualTo(0)
        }

        @Test
        fun `scores persist correctly and leaderboard query returns ranked data`() {
            val race1 = createRace("2026-1", 1, completed = true, first = "verstappen", second = "norris", third = "leclerc", fastestLap = "verstappen")
            val race2 = createRace("2026-2", 2, completed = true, first = "norris", second = "leclerc", third = "hamilton", fastestLap = "norris")

            // Race 1: Alice 5pts, Bob 0pts
            createPrediction(alice, race1, "verstappen", "wrong", "wrong", "wrong", "")
            createPrediction(bob, race1, "wrong", "wrong", "wrong", "wrong", "")

            // Race 2: Alice 0pts, Bob 5pts
            createPrediction(alice, race2, "wrong", "wrong", "wrong", "wrong", "")
            createPrediction(bob, race2, "norris", "wrong", "wrong", "wrong", "")

            predictionService.calculateScores("2026-1")
            predictionService.calculateScores("2026-2")

            val leaderboard = predictionService.getSeasonLeaderboard(2026)

            // Both should have 5 total points
            assertThat(leaderboard).hasSize(2)
            assertThat(leaderboard.map { it.totalScore }).allMatch { it == 5 }
        }

        @Test
        fun `leaderboard reflects cumulative scoring across multiple races`() {
            val race1 = createRace("2026-1", 1, completed = true, first = "verstappen", second = "norris", third = "leclerc")
            val race2 = createRace("2026-2", 2, completed = true, first = "verstappen", second = "hamilton", third = "sainz")

            // Alice: always predicts VER, gets 5pts per race = 10 total
            createPrediction(alice, race1, "verstappen", "wrong", "wrong")
            createPrediction(alice, race2, "verstappen", "wrong", "wrong")

            // Bob: only correct in race 2 = 5 total
            createPrediction(bob, race1, "wrong", "wrong", "wrong")
            createPrediction(bob, race2, "verstappen", "wrong", "wrong")

            predictionService.calculateScores("2026-1")
            predictionService.calculateScores("2026-2")

            val leaderboard = predictionService.getSeasonLeaderboard(2026)

            assertThat(leaderboard).hasSize(2)
            assertThat(leaderboard[0].userName).isEqualTo("Alice")
            assertThat(leaderboard[0].totalScore).isEqualTo(10)
            assertThat(leaderboard[1].userName).isEqualTo("Bob")
            assertThat(leaderboard[1].totalScore).isEqualTo(5)
        }

        @Test
        fun `scoring incomplete race throws exception`() {
            createRace("2026-1", 1, completed = false)

            assertThrows<IllegalStateException> {
                predictionService.calculateScores("2026-1")
            }
        }

        @Test
        fun `scoring race without results throws exception`() {
            createRace("2026-1", 1, completed = true, first = null)

            assertThrows<IllegalStateException> {
                predictionService.calculateScores("2026-1")
            }
        }

        @Test
        fun `user with no predictions is not on leaderboard`() {
            val race = createRace("2026-1", 1, completed = true, first = "verstappen", second = "norris", third = "leclerc")

            // Only Alice predicts
            createPrediction(alice, race, "verstappen", "norris", "leclerc")

            predictionService.calculateScores("2026-1")

            val leaderboard = predictionService.getSeasonLeaderboard(2026)
            assertThat(leaderboard).hasSize(1)
            assertThat(leaderboard[0].userName).isEqualTo("Alice")
        }

        @Test
        fun `recalculating scores overwrites previous values`() {
            val race = createRace("2026-1", 1, completed = true, first = "verstappen", second = "norris", third = "leclerc")
            createPrediction(alice, race, "verstappen", "norris", "leclerc")

            predictionService.calculateScores("2026-1")
            val firstCalc = predictionRepository.findByRaceIdOrderByScoreDesc("2026-1")
            assertThat(firstCalc[0].score).isEqualTo(9)

            // Recalculate — should produce the same result
            predictionService.calculateScores("2026-1")
            val secondCalc = predictionRepository.findByRaceIdOrderByScoreDesc("2026-1")
            assertThat(secondCalc[0].score).isEqualTo(9)
        }

        @Test
        fun `empty string driver ID does not match race result`() {
            val race = createRace("2026-1", 1, completed = true, first = "verstappen", second = "norris", third = "leclerc")
            createPrediction(alice, race, "", "", "", "", "")

            predictionService.calculateScores("2026-1")

            val results = predictionRepository.findByRaceIdOrderByScoreDesc("2026-1")
            assertThat(results[0].score).isEqualTo(0)
        }

        @Test
        fun `partial correct predictions are scored correctly`() {
            val race = createRace("2026-1", 1, completed = true,
                first = "verstappen", second = "norris", third = "leclerc",
                fastestLap = "hamilton", dotd = "norris"
            )
            // Alice: 2nd, FL, DOTD correct = 3 + 1 + 1 = 5
            createPrediction(alice, race, "wrong", "norris", "wrong", "hamilton", "norris")

            predictionService.calculateScores("2026-1")

            val results = predictionRepository.findByRaceIdOrderByScoreDesc("2026-1")
            assertThat(results[0].score).isEqualTo(5)
        }
    }

    @Nested
    inner class SprintRaceScoring {

        private fun createSprint(
            id: String, round: Int, completed: Boolean = false,
            first: String? = null, second: String? = null, third: String? = null
        ): SprintRace {
            return sprintRaceRepository.save(
                SprintRace(
                    id = id, season = 2026, round = round, raceName = "Sprint $round",
                    circuitId = "circuit-$round", circuitName = "Circuit $round",
                    country = "Country", locality = "City",
                    date = LocalDate.of(2026, 3, round), time = LocalTime.of(14, 30),
                    firstPlaceDriverId = first, secondPlaceDriverId = second,
                    thirdPlaceDriverId = third, sprintCompleted = completed
                )
            )
        }

        private fun createSprintPrediction(user: User, sprint: SprintRace, first: String, second: String, third: String): SprintPrediction {
            return sprintPredictionRepository.save(
                SprintPrediction(user = user, sprintRace = sprint, firstPlaceDriverId = first, secondPlaceDriverId = second, thirdPlaceDriverId = third)
            )
        }

        @Test
        fun `sprint scoring - perfect prediction scores 9 points`() {
            val sprint = createSprint("2026-1-sprint", 1, completed = true, first = "verstappen", second = "norris", third = "leclerc")
            createSprintPrediction(alice, sprint, "verstappen", "norris", "leclerc")

            sprintPredictionService.calculateSprintScores("2026-1-sprint")

            val results = sprintPredictionRepository.findBySprintRaceIdOrderByScoreDesc("2026-1-sprint")
            assertThat(results[0].score).isEqualTo(9)
        }

        @Test
        fun `sprint scoring - all wrong scores 0`() {
            val sprint = createSprint("2026-1-sprint", 1, completed = true, first = "verstappen", second = "norris", third = "leclerc")
            createSprintPrediction(alice, sprint, "x", "y", "z")

            sprintPredictionService.calculateSprintScores("2026-1-sprint")

            val results = sprintPredictionRepository.findBySprintRaceIdOrderByScoreDesc("2026-1-sprint")
            assertThat(results[0].score).isEqualTo(0)
        }

        @Test
        fun `sprint scoring - incomplete sprint throws exception`() {
            createSprint("2026-1-sprint", 1, completed = false)

            assertThrows<IllegalStateException> {
                sprintPredictionService.calculateSprintScores("2026-1-sprint")
            }
        }

        @Test
        fun `sprint scoring - multiple users scored correctly`() {
            val sprint = createSprint("2026-1-sprint", 1, completed = true, first = "verstappen", second = "norris", third = "leclerc")
            createSprintPrediction(alice, sprint, "verstappen", "norris", "leclerc")  // 9
            createSprintPrediction(bob, sprint, "verstappen", "wrong", "wrong")       // 5
            createSprintPrediction(charlie, sprint, "wrong", "wrong", "leclerc")      // 1

            sprintPredictionService.calculateSprintScores("2026-1-sprint")

            val results = sprintPredictionRepository.findBySprintRaceIdOrderByScoreDesc("2026-1-sprint")
            val scores = results.associate { it.user.name to it.score }

            assertThat(scores["Alice"]).isEqualTo(9)
            assertThat(scores["Bob"]).isEqualTo(5)
            assertThat(scores["Charlie"]).isEqualTo(1)
        }
    }

    @Nested
    inner class DataSyncOrchestration {

        @Test
        fun `simulated end-to-end flow - race created, predictions made, results arrive, scores calculated`() {
            // 1. Race is created (before race day)
            val race = createRace("2026-5", 5)
            assertThat(race.raceCompleted).isFalse()

            // 2. Users make predictions before race starts
            createPrediction(alice, race, "verstappen", "norris", "leclerc", "verstappen", "norris")
            createPrediction(bob, race, "hamilton", "russell", "sainz", "hamilton", "hamilton")

            // 3. Race results arrive (simulating what JolpicaApiService.updateRaceResults does)
            race.firstPlaceDriverId = "verstappen"
            race.secondPlaceDriverId = "norris"
            race.thirdPlaceDriverId = "leclerc"
            race.fastestLapDriverId = "verstappen"
            race.driverOfTheDayId = "norris"
            race.raceCompleted = true
            raceRepository.save(race)

            // 4. Scores are calculated (what DataSyncService.checkForCompletedRaces triggers)
            predictionService.calculateScores("2026-5")

            // 5. Verify results
            val results = predictionRepository.findByRaceIdOrderByScoreDesc("2026-5")
            val aliceResult = results.find { it.user.name == "Alice" }
            val bobResult = results.find { it.user.name == "Bob" }

            assertThat(aliceResult?.score).isEqualTo(11) // Perfect
            assertThat(bobResult?.score).isEqualTo(0)    // All wrong

            // 6. Verify leaderboard
            val leaderboard = predictionService.getSeasonLeaderboard(2026)
            assertThat(leaderboard).isNotEmpty()
            assertThat(leaderboard[0].userName).isEqualTo("Alice")
            assertThat(leaderboard[0].totalScore).isEqualTo(11)
        }

        @Test
        fun `multi-race season leaderboard accumulates scores correctly`() {
            // Race 1
            val race1 = createRace("2026-1", 1, completed = true, first = "verstappen", second = "norris", third = "leclerc", fastestLap = "verstappen")
            createPrediction(alice, race1, "verstappen", "norris", "leclerc", "verstappen", "")  // 5+3+1+1 = 10
            createPrediction(bob, race1, "norris", "verstappen", "leclerc", "", "")               // 0+0+1 = 1

            // Race 2
            val race2 = createRace("2026-2", 2, completed = true, first = "norris", second = "verstappen", third = "hamilton", fastestLap = "norris")
            createPrediction(alice, race2, "norris", "wrong", "wrong", "", "")                    // 5
            createPrediction(bob, race2, "norris", "verstappen", "hamilton", "norris", "")        // 5+3+1+1 = 10

            predictionService.calculateScores("2026-1")
            predictionService.calculateScores("2026-2")

            val leaderboard = predictionService.getSeasonLeaderboard(2026)

            // Alice: 10 + 5 = 15, Bob: 1 + 10 = 11
            val aliceEntry = leaderboard.find { it.userName == "Alice" }
            val bobEntry = leaderboard.find { it.userName == "Bob" }

            assertThat(aliceEntry?.totalScore).isEqualTo(15)
            assertThat(bobEntry?.totalScore).isEqualTo(11)
            // Alice should be first
            assertThat(leaderboard[0].userName).isEqualTo("Alice")
        }

        @Test
        fun `leaderboard updates after each race - rankings can change between races`() {
            // Setup: 3 races, all predictions made upfront
            val race1 = createRace("2026-1", 1, completed = true, first = "verstappen", second = "norris", third = "leclerc")
            val race2 = createRace("2026-2", 2, completed = true, first = "norris", second = "verstappen", third = "hamilton")
            val race3 = createRace("2026-3", 3, completed = true, first = "hamilton", second = "leclerc", third = "norris")

            // Alice: strong start, weak finish
            createPrediction(alice, race1, "verstappen", "norris", "leclerc")  // 5+3+1 = 9
            createPrediction(alice, race2, "wrong", "wrong", "wrong")           // 0
            createPrediction(alice, race3, "wrong", "wrong", "wrong")           // 0

            // Bob: weak start, strong middle and finish
            createPrediction(bob, race1, "wrong", "wrong", "wrong")            // 0
            createPrediction(bob, race2, "norris", "verstappen", "hamilton")    // 5+3+1 = 9
            createPrediction(bob, race3, "hamilton", "leclerc", "norris")       // 5+3+1 = 9

            // --- After Race 1: Alice leads ---
            predictionService.calculateScores("2026-1")

            val leaderboardAfterR1 = predictionService.getSeasonLeaderboard(2026)
            assertThat(leaderboardAfterR1[0].userName).isEqualTo("Alice")
            assertThat(leaderboardAfterR1[0].totalScore).isEqualTo(9)
            // Bob has 0 points so he may or may not appear depending on SUM behavior
            val bobAfterR1 = leaderboardAfterR1.find { it.userName == "Bob" }
            if (bobAfterR1 != null) {
                assertThat(bobAfterR1.totalScore).isEqualTo(0)
            }

            // --- After Race 2: Tied at 9 each ---
            predictionService.calculateScores("2026-2")

            val leaderboardAfterR2 = predictionService.getSeasonLeaderboard(2026)
            val aliceAfterR2 = leaderboardAfterR2.find { it.userName == "Alice" }
            val bobAfterR2 = leaderboardAfterR2.find { it.userName == "Bob" }
            assertThat(aliceAfterR2?.totalScore).isEqualTo(9)
            assertThat(bobAfterR2?.totalScore).isEqualTo(9)

            // --- After Race 3: Bob overtakes Alice ---
            predictionService.calculateScores("2026-3")

            val leaderboardAfterR3 = predictionService.getSeasonLeaderboard(2026)
            assertThat(leaderboardAfterR3[0].userName).isEqualTo("Bob")
            assertThat(leaderboardAfterR3[0].totalScore).isEqualTo(18)
            val aliceAfterR3 = leaderboardAfterR3.find { it.userName == "Alice" }
            assertThat(aliceAfterR3?.totalScore).isEqualTo(9)
        }

        @Test
        fun `leaderboard before race shows rankings excluding current race`() {
            val race1 = createRace("2026-1", 1, completed = true, first = "verstappen", second = "norris", third = "leclerc")
            val race2 = createRace("2026-2", 2, completed = true, first = "norris", second = "verstappen", third = "hamilton")

            createPrediction(alice, race1, "verstappen", "norris", "leclerc")  // 9
            createPrediction(bob, race1, "wrong", "wrong", "wrong")            // 0

            createPrediction(alice, race2, "wrong", "wrong", "wrong")          // 0
            createPrediction(bob, race2, "norris", "verstappen", "hamilton")    // 9

            predictionService.calculateScores("2026-1")
            predictionService.calculateScores("2026-2")

            // Leaderboard BEFORE race 2 should only reflect race 1 scores
            val beforeR2 = predictionService.getSeasonLeaderboardBeforeRace("2026-2", 2026)
            assertThat(beforeR2[0].userName).isEqualTo("Alice")
            assertThat(beforeR2[0].totalScore).isEqualTo(9)

            // Full season leaderboard should reflect both races
            val fullSeason = predictionService.getSeasonLeaderboard(2026)
            val aliceFull = fullSeason.find { it.userName == "Alice" }
            val bobFull = fullSeason.find { it.userName == "Bob" }
            assertThat(aliceFull?.totalScore).isEqualTo(9)
            assertThat(bobFull?.totalScore).isEqualTo(9)
        }
    }
}
