package com.f1chatter.backend.service

import com.f1chatter.backend.model.Race
import com.f1chatter.backend.repository.ConstructorRepository
import com.f1chatter.backend.repository.DriverRepository
import com.f1chatter.backend.repository.RaceRepository
import com.f1chatter.backend.repository.SprintRaceRepository
import com.fasterxml.jackson.databind.ObjectMapper
import io.mockk.*
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.springframework.data.repository.findByIdOrNull
import org.springframework.web.client.RestTemplate
import java.time.LocalDate
import java.time.LocalTime

/**
 * Tests for JolpicaApiService.updateRaceResults():
 * - Fetching race results from the Jolpica API
 * - Parsing podium positions and fastest lap
 * - Storing results in the database
 * - Idempotency (already completed races are skipped)
 * - Error handling for malformed API responses
 */
class RaceResultFetchingTest {

    private lateinit var restTemplate: RestTemplate
    private lateinit var raceRepository: RaceRepository
    private lateinit var service: JolpicaApiService

    private val raceId = "2026-1"

    private fun incompleteRace() = Race(
        id = raceId, season = 2026, round = 1, raceName = "Bahrain GP",
        circuitId = "bahrain", circuitName = "Bahrain International Circuit",
        country = "Bahrain", locality = "Sakhir",
        date = LocalDate.of(2026, 3, 2), time = LocalTime.of(15, 0),
        firstPlaceDriverId = null, secondPlaceDriverId = null,
        thirdPlaceDriverId = null, fastestLapDriverId = null,
        driverOfTheDayId = null, raceCompleted = false
    )

    private fun apiResponse(results: List<Map<String, Any?>>) = mapOf(
        "MRData" to mapOf(
            "RaceTable" to mapOf(
                "Races" to listOf(mapOf("Results" to results))
            )
        )
    )

    private fun driverResult(driverId: String, fastestLapRank: String? = null): Map<String, Any?> {
        val result = mutableMapOf<String, Any?>(
            "Driver" to mapOf("driverId" to driverId)
        )
        if (fastestLapRank != null) {
            result["FastestLap"] = mapOf("rank" to fastestLapRank)
        }
        return result
    }

    @BeforeEach
    fun setup() {
        restTemplate = mockk()
        raceRepository = mockk(relaxed = true)
        val objectMapper = ObjectMapper()
        val sprintRaceRepository = mockk<SprintRaceRepository>(relaxed = true)
        val driverRepository = mockk<DriverRepository>(relaxed = true)
        val constructorRepository = mockk<ConstructorRepository>(relaxed = true)
        service = JolpicaApiService(
            restTemplate, objectMapper, raceRepository, sprintRaceRepository,
            driverRepository, constructorRepository,
            baseUrl = "https://api.jolpi.ca/ergast/f1",
            requestsPerSecond = 1000, maxRetries = 0
        )
        mockkStatic("org.springframework.data.repository.CrudRepositoryExtensionsKt")
    }

    @Nested
    inner class HappyPaths {

        @Test
        fun `fetches podium and fastest lap from API and marks race completed`() {
            val race = incompleteRace()
            every { raceRepository.findByIdOrNull(raceId) } returns race

            val results = listOf(
                driverResult("verstappen", fastestLapRank = "1"),
                driverResult("norris"),
                driverResult("leclerc")
            )
            every { restTemplate.getForObject(any<String>(), Map::class.java) } returns apiResponse(results)

            val savedRace = slot<Race>()
            every { raceRepository.save(capture(savedRace)) } answers { firstArg() }

            service.updateRaceResults(raceId)

            assertTrue(savedRace.captured.raceCompleted)
            assertEquals("verstappen", savedRace.captured.firstPlaceDriverId)
            assertEquals("norris", savedRace.captured.secondPlaceDriverId)
            assertEquals("leclerc", savedRace.captured.thirdPlaceDriverId)
            assertEquals("verstappen", savedRace.captured.fastestLapDriverId)
        }

        @Test
        fun `fastest lap by non-podium driver is correctly identified`() {
            val race = incompleteRace()
            every { raceRepository.findByIdOrNull(raceId) } returns race

            val results = listOf(
                driverResult("verstappen"),
                driverResult("norris"),
                driverResult("leclerc"),
                driverResult("hamilton", fastestLapRank = "1"),
                driverResult("russell", fastestLapRank = "2")
            )
            every { restTemplate.getForObject(any<String>(), Map::class.java) } returns apiResponse(results)

            val savedRace = slot<Race>()
            every { raceRepository.save(capture(savedRace)) } answers { firstArg() }

            service.updateRaceResults(raceId)

            assertEquals("hamilton", savedRace.captured.fastestLapDriverId)
        }

        @Test
        fun `already completed race is skipped - idempotent`() {
            val race = incompleteRace().copy(raceCompleted = true)
            every { raceRepository.findByIdOrNull(raceId) } returns race

            service.updateRaceResults(raceId)

            verify(exactly = 0) { restTemplate.getForObject(any<String>(), Map::class.java) }
            verify(exactly = 0) { raceRepository.save(any()) }
        }

        @Test
        fun `race results without any fastest lap data still saves podium`() {
            val race = incompleteRace()
            every { raceRepository.findByIdOrNull(raceId) } returns race

            val results = listOf(
                driverResult("verstappen"),
                driverResult("norris"),
                driverResult("leclerc")
            )
            every { restTemplate.getForObject(any<String>(), Map::class.java) } returns apiResponse(results)

            val savedRace = slot<Race>()
            every { raceRepository.save(capture(savedRace)) } answers { firstArg() }

            service.updateRaceResults(raceId)

            assertTrue(savedRace.captured.raceCompleted)
            assertEquals("verstappen", savedRace.captured.firstPlaceDriverId)
            assertNull(savedRace.captured.fastestLapDriverId)
        }

        @Test
        fun `DOTD is not populated from API - stays null`() {
            val race = incompleteRace()
            every { raceRepository.findByIdOrNull(raceId) } returns race

            val results = listOf(
                driverResult("verstappen", "1"),
                driverResult("norris"),
                driverResult("leclerc")
            )
            every { restTemplate.getForObject(any<String>(), Map::class.java) } returns apiResponse(results)
            every { raceRepository.save(any()) } answers { firstArg() }

            service.updateRaceResults(raceId)

            val savedRace = slot<Race>()
            every { raceRepository.save(capture(savedRace)) } answers { firstArg() }
            // Re-run to capture
            val race2 = incompleteRace()
            every { raceRepository.findByIdOrNull(raceId) } returns race2
            service.updateRaceResults(raceId)

            assertNull(savedRace.captured.driverOfTheDayId)
        }
    }

    @Nested
    inner class UnhappyPaths {

        @Test
        fun `race not found in database returns silently`() {
            every { raceRepository.findByIdOrNull("nonexistent") } returns null

            // Should not throw
            service.updateRaceResults("nonexistent")

            verify(exactly = 0) { restTemplate.getForObject(any<String>(), Map::class.java) }
        }

        @Test
        fun `API returns empty races array - does not update`() {
            val race = incompleteRace()
            every { raceRepository.findByIdOrNull(raceId) } returns race

            val response = mapOf(
                "MRData" to mapOf(
                    "RaceTable" to mapOf(
                        "Races" to emptyList<Map<String, Any?>>()
                    )
                )
            )
            every { restTemplate.getForObject(any<String>(), Map::class.java) } returns response

            service.updateRaceResults(raceId)

            assertFalse(race.raceCompleted)
            verify(exactly = 0) { raceRepository.save(any()) }
        }

        @Test
        fun `API returns fewer than 3 results - does not update`() {
            val race = incompleteRace()
            every { raceRepository.findByIdOrNull(raceId) } returns race

            val results = listOf(
                driverResult("verstappen"),
                driverResult("norris")
                // Only 2 results, need at least 3
            )
            every { restTemplate.getForObject(any<String>(), Map::class.java) } returns apiResponse(results)

            service.updateRaceResults(raceId)

            assertFalse(race.raceCompleted)
            verify(exactly = 0) { raceRepository.save(any()) }
        }

        @Test
        fun `API returns null response - does not update`() {
            val race = incompleteRace()
            every { raceRepository.findByIdOrNull(raceId) } returns race
            every { restTemplate.getForObject(any<String>(), Map::class.java) } returns null

            service.updateRaceResults(raceId)

            assertFalse(race.raceCompleted)
            verify(exactly = 0) { raceRepository.save(any()) }
        }

        @Test
        fun `API returns race with null Results key - does not update`() {
            val race = incompleteRace()
            every { raceRepository.findByIdOrNull(raceId) } returns race

            val response = mapOf(
                "MRData" to mapOf(
                    "RaceTable" to mapOf(
                        "Races" to listOf(mapOf("Results" to null))
                    )
                )
            )
            every { restTemplate.getForObject(any<String>(), Map::class.java) } returns response

            service.updateRaceResults(raceId)

            assertFalse(race.raceCompleted)
            verify(exactly = 0) { raceRepository.save(any()) }
        }
    }
}
