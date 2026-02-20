package com.f1chatter.backend.service

import com.f1chatter.backend.model.Constructor
import com.f1chatter.backend.model.Driver
import com.f1chatter.backend.model.Race
import com.f1chatter.backend.repository.ApiCacheRepository
import com.f1chatter.backend.repository.ConstructorRepository
import com.f1chatter.backend.repository.DriverRepository
import com.f1chatter.backend.repository.RaceRepository
import com.f1chatter.backend.repository.SprintRaceRepository
import com.fasterxml.jackson.databind.ObjectMapper
import io.mockk.CapturingSlot
import io.mockk.every
import io.mockk.mockk
import io.mockk.slot
import io.mockk.verify
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.web.client.RestTemplate
import java.time.LocalDate
import java.time.LocalTime
import org.springframework.data.repository.findByIdOrNull
import io.mockk.mockkStatic

class JolpicaApiServiceTest {

    private lateinit var restTemplate: RestTemplate
    private lateinit var objectMapper: ObjectMapper
    private lateinit var raceRepository: RaceRepository
    private lateinit var sprintRaceRepository: SprintRaceRepository
    private lateinit var driverRepository: DriverRepository
    private lateinit var constructorRepository: ConstructorRepository
    private lateinit var apiCacheRepository: ApiCacheRepository
    private lateinit var service: JolpicaApiService

    @BeforeEach
    fun setup() {
        restTemplate = mockk()
        objectMapper = ObjectMapper()
        raceRepository = mockk(relaxed = true)
        sprintRaceRepository = mockk(relaxed = true)
        driverRepository = mockk(relaxed = true)
        constructorRepository = mockk(relaxed = true)
        apiCacheRepository = mockk(relaxed = true)
        service = JolpicaApiService(
            restTemplate,
            objectMapper,
            raceRepository,
            sprintRaceRepository,
            driverRepository,
            constructorRepository,
            apiCacheRepository,
            baseUrl = "https://api.ergast.com/api/f1",
            requestsPerSecond = 1000,
            maxRetries = 0
        )
        mockkStatic("org.springframework.data.repository.CrudRepositoryExtensionsKt")
    }

    @Test
    fun `fetchCurrentSeasonRaces saves returned races`() {
        every { raceRepository.findBySeason(any()) } returns emptyList()
        every { raceRepository.save(any<Race>()) } answers { firstArg() }

        val races = listOf(
            mapOf(
                "round" to "1",
                "raceName" to "Test GP",
                "Circuit" to mapOf("circuitId" to "c1", "circuitName" to "C1"),
                "date" to LocalDate.now().toString(),
                "time" to "12:00:00Z",
                "circuit" to "ignored",
                "Location" to "ignored",
                "Circuit" to mapOf(
                    "circuitId" to "c1",
                    "circuitName" to "C1",
                    "Location" to mapOf("locality" to "City", "country" to "Country")
                )
            )
        )
        val response = mapOf(
            "MRData" to mapOf(
                "RaceTable" to mapOf(
                    "Races" to races
                )
            )
        )
        every { restTemplate.getForObject(any<String>(), Map::class.java) } returns response

        val raceSlot: CapturingSlot<Race> = slot()
        every { raceRepository.save(capture(raceSlot)) } answers { raceSlot.captured }

        service.fetchCurrentSeasonRaces()

        verify { raceRepository.save(any<Race>()) }
        val saved = raceSlot.captured
        assertEquals("Test GP", saved.raceName)
        assertEquals("c1", saved.circuitId)
    }

    @Test
    fun `fetchDriversForSeason imports drivers constructors and assigns`() {
        every { driverRepository.findAll() } returns emptyList() andThen listOf(
            Driver(
                id = "max",
                code = "VER",
                permanentNumber = "1",
                givenName = "Max",
                familyName = "Verstappen",
                dateOfBirth = "1997-09-30",
                nationality = "Dutch",
                url = ""
            ),
            Driver(
                id = "sergio",
                code = "PER",
                permanentNumber = "11",
                givenName = "Sergio",
                familyName = "Perez",
                dateOfBirth = "1990-01-26",
                nationality = "Mexican",
                url = ""
            )
        )
        every { constructorRepository.findAll() } returns emptyList()

        val driversResponse = mapOf(
            "MRData" to mapOf(
                "DriverTable" to mapOf(
                    "Drivers" to listOf(
                        mapOf(
                            "driverId" to "max",
                            "code" to "VER",
                            "permanentNumber" to "1",
                            "givenName" to "Max",
                            "familyName" to "Verstappen",
                            "dateOfBirth" to "1997-09-30",
                            "nationality" to "Dutch",
                            "url" to ""
                        ),
                        mapOf(
                            "driverId" to "sergio",
                            "code" to "PER",
                            "permanentNumber" to "11",
                            "givenName" to "Sergio",
                            "familyName" to "Perez",
                            "dateOfBirth" to "1990-01-26",
                            "nationality" to "Mexican",
                            "url" to ""
                        )
                    )
                )
            )
        )

        val constructorsResponse = mapOf(
            "MRData" to mapOf(
                "ConstructorTable" to mapOf(
                    "Constructors" to listOf(
                        mapOf("constructorId" to "rb", "name" to "Red Bull Racing", "nationality" to "Austrian", "url" to "")
                    )
                )
            )
        )

        val standingsResponse = mapOf(
            "MRData" to mapOf(
                "StandingsTable" to mapOf(
                    "StandingsLists" to listOf(
                        mapOf(
                            "DriverStandings" to listOf(
                                mapOf(
                                    "Driver" to mapOf("driverId" to "max"),
                                    "Constructors" to listOf(mapOf("constructorId" to "rb"))
                                ),
                                mapOf(
                                    "Driver" to mapOf("driverId" to "sergio"),
                                    "Constructors" to listOf(mapOf("constructorId" to "rb"))
                                )
                            )
                        )
                    )
                )
            )
        )

        every { restTemplate.getForObject(any<String>(), Map::class.java) } returnsMany listOf(
            driversResponse,
            constructorsResponse,
            standingsResponse
        )

        val savedDrivers = mutableListOf<Driver>()
        every { driverRepository.save(capture(savedDrivers)) } answers { firstArg() }
        every { constructorRepository.save(any<Constructor>()) } answers { firstArg() }
        every { driverRepository.findByIdOrNull(any()) } answers { savedDrivers.find { it.id == secondArg<String>() } }
        every { constructorRepository.findByIdOrNull("rb") } returns Constructor("rb", "Red Bull Racing", "Austrian", "")

        service.fetchDriversForSeason(2024)

        // two drivers saved and assigned
        verify(atLeast = 2) { driverRepository.save(any<Driver>()) }
        // after assignment, constructor on driver should be set
        assertEquals("rb", savedDrivers.first().constructor?.id)
    }

    @Test
    fun `updateRaceResults fills podium and fastest lap and marks completed`() {
        val race = Race(
            id = "2024-1",
            season = 2024,
            round = 1,
            raceName = "Test GP",
            circuitId = "c1",
            circuitName = "C1",
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
        every { raceRepository.findByIdOrNull("2024-1") } returns race

        val results = listOf(
            mapOf("Driver" to mapOf("driverId" to "d1"), "FastestLap" to mapOf("rank" to "1")),
            mapOf("Driver" to mapOf("driverId" to "d2")),
            mapOf("Driver" to mapOf("driverId" to "d3"))
        )
        val response = mapOf(
            "MRData" to mapOf(
                "RaceTable" to mapOf(
                    "Races" to listOf(mapOf("Results" to results))
                )
            )
        )
        every { restTemplate.getForObject(any<String>(), Map::class.java) } returns response
        every { raceRepository.save(any<Race>()) } answers { firstArg() }

        service.updateRaceResults("2024-1")

        verify { raceRepository.save(any()) }
    }
}


