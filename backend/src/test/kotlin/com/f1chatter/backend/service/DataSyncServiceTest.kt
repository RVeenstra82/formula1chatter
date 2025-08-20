package com.f1chatter.backend.service

import com.f1chatter.backend.model.Race
import com.f1chatter.backend.repository.ConstructorRepository
import com.f1chatter.backend.repository.DriverRepository
import com.f1chatter.backend.repository.RaceRepository
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import org.junit.jupiter.api.Test
import java.time.LocalDate
import java.time.LocalTime

class DataSyncServiceTest {

    @Test
    fun `syncCurrentSeasonData calls Jolpica when no races`() {
        val jolpica = mockk<JolpicaApiService>(relaxed = true)
        val openf1 = mockk<OpenF1ApiService>(relaxed = true)
        val raceRepo = mockk<RaceRepository>()
        val driverRepo = mockk<DriverRepository>()
        val constructorRepo = mockk<ConstructorRepository>()
        val predictionService = mockk<PredictionService>(relaxed = true)

        every { raceRepo.findBySeason(any()) } returns emptyList()
        val service = DataSyncService(jolpica, openf1, raceRepo, driverRepo, constructorRepo, predictionService)

        service.syncCurrentSeasonData()

        verify { jolpica.fetchCurrentSeasonRaces() }
    }

    @Test
    fun `checkForCompletedRaces triggers updateRaceResults for past races`() {
        val jolpica = mockk<JolpicaApiService>(relaxed = true)
        val openf1 = mockk<OpenF1ApiService>(relaxed = true)
        val raceRepo = mockk<RaceRepository>()
        val driverRepo = mockk<DriverRepository>()
        val constructorRepo = mockk<ConstructorRepository>()
        val predictionService = mockk<PredictionService>(relaxed = true)

        val yesterday = LocalDate.now().minusDays(1)
        val pastRace = Race(
            id = "r1",
            season = yesterday.year,
            round = 1,
            raceName = "Past",
            circuitId = "c",
            circuitName = "C",
            country = "",
            locality = "",
            date = yesterday,
            time = LocalTime.NOON,
            firstPlaceDriverId = null,
            secondPlaceDriverId = null,
            thirdPlaceDriverId = null,
            fastestLapDriverId = null,
            driverOfTheDayId = null,
            raceCompleted = false
        )

        every { raceRepo.findUpcomingRaces(yesterday) } returns listOf(pastRace)

        val service = DataSyncService(jolpica, openf1, raceRepo, driverRepo, constructorRepo, predictionService)
        service.checkForCompletedRaces()

        verify { jolpica.updateRaceResults("r1") }
        verify { predictionService.calculateScores("r1") }
    }
}


