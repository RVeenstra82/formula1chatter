package com.f1chatter.backend.service

import com.f1chatter.backend.model.Race
import com.f1chatter.backend.model.User
import com.f1chatter.backend.repository.PredictionRepository
import com.f1chatter.backend.repository.RaceRepository
import com.f1chatter.backend.repository.UserRepository
import com.f1chatter.backend.util.F1SeasonUtils
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import org.junit.jupiter.api.Test
import java.time.LocalDate
import java.time.LocalTime

class SeasonManagementServiceTest {

    private val currentSeason = F1SeasonUtils.getCurrentSeason()

    @Test
    fun `checkForNewSeasonAndResetScores triggers reset when races exist and no predictions`() {
        val predictionRepo = mockk<PredictionRepository>(relaxed = true)
        val raceRepo = mockk<RaceRepository>()
        val userRepo = mockk<UserRepository>()
        val service = SeasonManagementService(predictionRepo, raceRepo, userRepo)

        every { predictionRepo.findBySeason(currentSeason) } returns emptyList()
        every { raceRepo.findBySeason(currentSeason) } returns listOf(sampleRace("$currentSeason-1", currentSeason))
        every { userRepo.findAll() } returns emptyList()

        service.checkForNewSeasonAndResetScores()

        verify { raceRepo.findBySeason(currentSeason) }
    }

    @Test
    fun `resetScoresForNewSeason creates zero-score predictions when absent`() {
        val predictionRepo = mockk<PredictionRepository>(relaxed = true)
        val raceRepo = mockk<RaceRepository>()
        val userRepo = mockk<UserRepository>()
        val service = SeasonManagementService(predictionRepo, raceRepo, userRepo)

        val season = 2024
        val users = listOf(User(id = 1L, facebookId = "fb", name = "U", email = "e", profilePictureUrl = null))
        val races = listOf(sampleRace("2024-1", season))
        every { userRepo.findAll() } returns users
        every { raceRepo.findBySeason(season) } returns races
        every { predictionRepo.findByUserAndRace(any(), any()) } returns null
        every { predictionRepo.save(any()) } answers { firstArg() }

        service.resetScoresForNewSeason(season)

        verify { predictionRepo.save(any()) }
    }

    private fun sampleRace(id: String, season: Int): Race {
        return Race(
            id = id,
            season = season,
            round = 1,
            raceName = "GP",
            circuitId = "c",
            circuitName = "C",
            country = "",
            locality = "",
            date = LocalDate.now(),
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
