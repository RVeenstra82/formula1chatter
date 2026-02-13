package com.f1chatter.backend.service

import com.f1chatter.backend.model.Race
import com.f1chatter.backend.repository.ConstructorRepository
import com.f1chatter.backend.repository.DriverRepository
import com.f1chatter.backend.repository.RaceRepository
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import io.mockk.verifyOrder
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import java.time.LocalDate
import java.time.LocalTime

class DataSyncServiceTest {

    private lateinit var jolpica: JolpicaApiService
    private lateinit var openf1: OpenF1ApiService
    private lateinit var raceRepo: RaceRepository
    private lateinit var driverRepo: DriverRepository
    private lateinit var constructorRepo: ConstructorRepository
    private lateinit var predictionService: PredictionService
    private lateinit var service: DataSyncService

    private val yesterday = LocalDate.now().minusDays(1)
    private val twoDaysAgo = LocalDate.now().minusDays(2)
    private val weekAgo = LocalDate.now().minusDays(7)

    private fun pastRace(id: String, round: Int, date: LocalDate = yesterday, completed: Boolean = false) = Race(
        id = id, season = date.year, round = round, raceName = "Race $round",
        circuitId = "c$round", circuitName = "Circuit $round",
        country = "", locality = "",
        date = date, time = LocalTime.NOON,
        firstPlaceDriverId = null, secondPlaceDriverId = null,
        thirdPlaceDriverId = null, fastestLapDriverId = null,
        driverOfTheDayId = null, raceCompleted = completed
    )

    @BeforeEach
    fun setup() {
        jolpica = mockk(relaxed = true)
        openf1 = mockk(relaxed = true)
        raceRepo = mockk()
        driverRepo = mockk(relaxed = true)
        constructorRepo = mockk(relaxed = true)
        predictionService = mockk(relaxed = true)
        service = DataSyncService(jolpica, openf1, raceRepo, driverRepo, constructorRepo, predictionService)
    }

    @Test
    fun `syncCurrentSeasonData calls Jolpica when no races`() {
        every { raceRepo.findBySeason(any()) } returns emptyList()

        service.syncCurrentSeasonData()

        verify { jolpica.fetchCurrentSeasonRaces() }
    }

    @Nested
    inner class CheckForCompletedRaces {

        @Test
        fun `triggers updateRaceResults and calculateScores for a single past race`() {
            val race = pastRace("r1", 1)
            every { raceRepo.findUpcomingRaces(weekAgo) } returns listOf(race)

            service.checkForCompletedRaces()

            verify { jolpica.updateRaceResults("r1") }
            verify { predictionService.calculateScores("r1") }
        }

        @Test
        fun `processes multiple past races and calculates scores for each`() {
            val race1 = pastRace("r1", 1, date = twoDaysAgo)
            val race2 = pastRace("r2", 2, date = yesterday)
            every { raceRepo.findUpcomingRaces(weekAgo) } returns listOf(race1, race2)

            service.checkForCompletedRaces()

            verifyOrder {
                jolpica.updateRaceResults("r1")
                predictionService.calculateScores("r1")
                jolpica.updateRaceResults("r2")
                predictionService.calculateScores("r2")
            }
        }

        @Test
        fun `skips already completed races - only processes incomplete ones`() {
            val completedRace = pastRace("r1", 1, date = twoDaysAgo, completed = true)
            val incompleteRace = pastRace("r2", 2, date = yesterday, completed = false)
            every { raceRepo.findUpcomingRaces(weekAgo) } returns listOf(completedRace, incompleteRace)

            service.checkForCompletedRaces()

            verify(exactly = 0) { jolpica.updateRaceResults("r1") }
            verify(exactly = 0) { predictionService.calculateScores("r1") }
            verify { jolpica.updateRaceResults("r2") }
            verify { predictionService.calculateScores("r2") }
        }

        @Test
        fun `does nothing when no recent races need updating`() {
            every { raceRepo.findUpcomingRaces(weekAgo) } returns emptyList()

            service.checkForCompletedRaces()

            verify(exactly = 0) { jolpica.updateRaceResults(any()) }
            verify(exactly = 0) { predictionService.calculateScores(any()) }
        }

        @Test
        fun `does nothing when all recent races are already completed`() {
            val completedRace1 = pastRace("r1", 1, completed = true)
            val completedRace2 = pastRace("r2", 2, completed = true)
            every { raceRepo.findUpcomingRaces(weekAgo) } returns listOf(completedRace1, completedRace2)

            service.checkForCompletedRaces()

            verify(exactly = 0) { jolpica.updateRaceResults(any()) }
            verify(exactly = 0) { predictionService.calculateScores(any()) }
        }

        @Test
        fun `error in one race does not block processing of subsequent races`() {
            val race1 = pastRace("r1", 1, date = twoDaysAgo)
            val race2 = pastRace("r2", 2, date = yesterday)
            every { raceRepo.findUpcomingRaces(weekAgo) } returns listOf(race1, race2)

            // First race fails during result update
            every { jolpica.updateRaceResults("r1") } throws RuntimeException("API error")

            service.checkForCompletedRaces()

            // Second race should still be processed
            verify { jolpica.updateRaceResults("r2") }
            verify { predictionService.calculateScores("r2") }
        }

        @Test
        fun `error in score calculation does not block processing of subsequent races`() {
            val race1 = pastRace("r1", 1, date = twoDaysAgo)
            val race2 = pastRace("r2", 2, date = yesterday)
            every { raceRepo.findUpcomingRaces(weekAgo) } returns listOf(race1, race2)

            // First race: API succeeds but score calculation fails
            every { predictionService.calculateScores("r1") } throws IllegalStateException("Race not completed")

            service.checkForCompletedRaces()

            // Second race should still be processed
            verify { jolpica.updateRaceResults("r2") }
            verify { predictionService.calculateScores("r2") }
        }

        @Test
        fun `future races are filtered out - only past races processed`() {
            val futureRace = pastRace("r-future", 10).copy(date = LocalDate.now().plusDays(1))
            val pastRace = pastRace("r-past", 1, date = yesterday)
            every { raceRepo.findUpcomingRaces(weekAgo) } returns listOf(futureRace, pastRace)

            service.checkForCompletedRaces()

            verify(exactly = 0) { jolpica.updateRaceResults("r-future") }
            verify { jolpica.updateRaceResults("r-past") }
            verify { predictionService.calculateScores("r-past") }
        }

        @Test
        fun `calculateScores is called for each race so leaderboard reflects all results`() {
            // Simulate 3 races from a weekend (e.g., double-header or backlog)
            val race1 = pastRace("r1", 1, date = LocalDate.now().minusDays(3))
            val race2 = pastRace("r2", 2, date = twoDaysAgo)
            val race3 = pastRace("r3", 3, date = yesterday)
            every { raceRepo.findUpcomingRaces(weekAgo) } returns listOf(race1, race2, race3)

            service.checkForCompletedRaces()

            // All three must have scores calculated for leaderboard to be correct
            verify { predictionService.calculateScores("r1") }
            verify { predictionService.calculateScores("r2") }
            verify { predictionService.calculateScores("r3") }
        }
    }
}
