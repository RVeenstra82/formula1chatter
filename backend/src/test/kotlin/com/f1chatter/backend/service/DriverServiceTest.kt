package com.f1chatter.backend.service

import com.f1chatter.backend.model.Constructor
import com.f1chatter.backend.model.Driver
import com.f1chatter.backend.model.Race
import com.f1chatter.backend.repository.ConstructorRepository
import com.f1chatter.backend.repository.DriverRepository
import com.f1chatter.backend.repository.RaceRepository
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import java.time.LocalDate
import java.time.LocalTime
import org.springframework.data.repository.findByIdOrNull
import io.mockk.mockkStatic

class DriverServiceTest {

    private lateinit var driverRepository: DriverRepository
    private lateinit var raceRepository: RaceRepository
    private lateinit var constructorRepository: ConstructorRepository
    private lateinit var openF1ApiService: OpenF1ApiService
    private lateinit var driverService: DriverService

    @BeforeEach
    fun setUp() {
        driverRepository = mockk()
        raceRepository = mockk()
        constructorRepository = mockk(relaxed = true)
        openF1ApiService = mockk()
        driverService = DriverService(driverRepository, raceRepository, constructorRepository, openF1ApiService)
        mockkStatic("org.springframework.data.repository.CrudRepositoryExtensionsKt")
    }

    @Test
    fun `getActiveDriversForRace uses DB fallback for future race and limits to 2 per team`() {
        val raceId = "2025-01"
        val futureRace = sampleRace(raceId, LocalDate.now().plusDays(10))

        every { raceRepository.findByIdOrNull(raceId) } returns futureRace
        every { openF1ApiService.fetchActiveDriversForDate(any(), any()) } returns emptyList()

        val team = Constructor(id = "rb", name = "Red Bull Racing", nationality = "NL", url = "")
        val d1 = Driver(id = "mverstappen", code = "VER", permanentNumber = "1", givenName = "Max", familyName = "Verstappen", dateOfBirth = "", nationality = "NL", url = "", constructor = team, profilePictureUrl = null)
        val d2 = Driver(id = "sperez", code = "PER", permanentNumber = "11", givenName = "Sergio", familyName = "Perez", dateOfBirth = "", nationality = "MX", url = "", constructor = team, profilePictureUrl = null)
        val d3 = Driver(id = "reserve", code = "RES", permanentNumber = "99", givenName = "Reserve", familyName = "Driver", dateOfBirth = "", nationality = "", url = "", constructor = team, profilePictureUrl = null)
        every { driverRepository.findAll() } returns listOf(d1, d2, d3)

        val result = driverService.getActiveDriversForRace(raceId)

        // Only 2 per team should be returned
        assertEquals(2, result.size)
        // Ensure stable ordering by constructor then number then name
        assertEquals(listOf("mverstappen", "sperez"), result.map { it.id })
        verify(exactly = 0) { openF1ApiService.fetchActiveDriversForDate(any(), any()) }
    }

    @Test
    fun `getActiveDriversForRace uses OpenF1 list on race day`() {
        val raceId = "2025-02"
        val todayRace = sampleRace(raceId, LocalDate.now())
        every { raceRepository.findByIdOrNull(raceId) } returns todayRace

        val team = Constructor(id = "mer", name = "Mercedes", nationality = "DE", url = "")
        val d1 = Driver(id = "lhamilton", code = "HAM", permanentNumber = "44", givenName = "Lewis", familyName = "Hamilton", dateOfBirth = "", nationality = "GB", url = "", constructor = team, profilePictureUrl = null)
        val d2 = Driver(id = "grussell", code = "RUS", permanentNumber = "63", givenName = "George", familyName = "Russell", dateOfBirth = "", nationality = "GB", url = "", constructor = team, profilePictureUrl = null)
        every { openF1ApiService.fetchActiveDriversForDate(todayRace.date, constructorRepository) } returns listOf(d1, d2)

        val result = driverService.getActiveDriversForRace(raceId)

        assertEquals(2, result.size)
        assertEquals(setOf("lhamilton", "grussell"), result.map { it.id }.toSet())
        verify { openF1ApiService.fetchActiveDriversForDate(todayRace.date, constructorRepository) }
    }

    private fun sampleRace(id: String, date: LocalDate): Race {
        return Race(
            id = id,
            season = date.year,
            round = 1,
            raceName = "Sample GP",
            circuitId = "c1",
            circuitName = "C",
            country = "",
            locality = "",
            date = date,
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


