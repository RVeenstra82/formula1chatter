package com.f1chatter.backend.service

import com.f1chatter.backend.model.Constructor
import com.f1chatter.backend.model.Driver
import com.f1chatter.backend.model.Race
import com.f1chatter.backend.repository.ConstructorRepository
import com.f1chatter.backend.repository.DriverRepository
import com.f1chatter.backend.repository.RaceRepository
import com.fasterxml.jackson.databind.ObjectMapper
import mu.KotlinLogging
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpEntity
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpMethod
import org.springframework.stereotype.Service
import org.springframework.web.client.RestTemplate
import java.time.Instant
import java.time.LocalDate
import java.time.LocalTime
import java.time.ZoneId
import java.time.format.DateTimeFormatter

@Service
class SportmonksApiService(
    private val restTemplate: RestTemplate,
    private val objectMapper: ObjectMapper,
    private val raceRepository: RaceRepository,
    private val driverRepository: DriverRepository,
    private val constructorRepository: ConstructorRepository,
    @Value("\${sportmonks.api.key:YOUR_API_KEY}")
    private val apiKey: String,
    @Value("\${sportmonks.api.base-url:https://api.sportmonks.com/v3/formula-one}")
    private val baseUrl: String
) {
    private val logger = KotlinLogging.logger {}
    
    fun fetchCurrentSeasonRaces() {
        logger.info { "Fetching races from Sportmonks API" }
        
        // 1. Haal het huidige seizoen op
        val currentSeason = fetchCurrentSeason()
        
        // 2. Haal tracks op voor het huidige seizoen
        val tracks = fetchTracksBySeasonId(currentSeason.id)
        
        // Verwijder bestaande races voor het huidige seizoen
        val existingRaces = raceRepository.findBySeason(currentSeason.year)
        if (existingRaces.isNotEmpty()) {
            logger.info { "Removing ${existingRaces.size} existing races for season ${currentSeason.year}" }
            raceRepository.deleteAll(existingRaces)
        }
        
        // Elke track representeert een race in het F1-seizoen
        tracks.forEachIndexed { index, track ->
            val stage = fetchStageByTrackId(track.id)
            val round = index + 1
            
            // Converteer datum en tijd naar juiste format
            val dateTime = Instant.parse(stage.startingAt)
            val date = LocalDate.ofInstant(dateTime, ZoneId.of("UTC"))
            val time = LocalTime.ofInstant(dateTime, ZoneId.of("UTC"))
            
            val race = Race(
                id = "${currentSeason.year}-$round",
                season = currentSeason.year,
                round = round,
                raceName = track.name,
                circuitId = track.id.toString(),
                circuitName = track.name,
                country = track.country,
                locality = track.city ?: "Unknown",
                date = date,
                time = time
            )
            
            raceRepository.save(race)
        }
        
        logger.info { "Successfully imported ${tracks.size} races for season ${currentSeason.year}" }
    }
    
    fun fetchDriversForSeason() {
        logger.info { "Fetching drivers from Sportmonks API" }
        
        // 1. Haal het huidige seizoen op
        val currentSeason = fetchCurrentSeason()
        
        // 2. Haal coureurs op voor het huidige seizoen
        val drivers = fetchDriversBySeasonId(currentSeason.id)
        
        // Verwijder bestaande coureurs
        val existingDrivers = driverRepository.findAll()
        if (existingDrivers.isNotEmpty()) {
            logger.info { "Removing ${existingDrivers.size} existing drivers" }
            driverRepository.deleteAll(existingDrivers)
        }
        
        // 3. Opslaan van coureurs
        drivers.forEach { sportmonksDriver ->
            val driver = Driver(
                id = sportmonksDriver.id.toString(),
                code = sportmonksDriver.shortName ?: "UNK",
                permanentNumber = sportmonksDriver.number?.toString(),
                givenName = sportmonksDriver.name.split(" ").firstOrNull() ?: sportmonksDriver.name,
                familyName = sportmonksDriver.name.split(" ").drop(1).joinToString(" "),
                dateOfBirth = sportmonksDriver.dateOfBirth ?: "Unknown",
                nationality = sportmonksDriver.country?.name ?: "Unknown",
                url = sportmonksDriver.imageUrl ?: ""
            )
            
            driverRepository.save(driver)
        }
        
        logger.info { "Successfully imported ${drivers.size} drivers" }
        
        // 4. Haal teams op en koppel coureurs aan teams
        fetchTeamsAndAssignDrivers(currentSeason.id)
    }
    
    private fun fetchTeamsAndAssignDrivers(seasonId: Long) {
        val teams = fetchTeamsBySeasonId(seasonId)
        
        // Verwijder bestaande teams
        constructorRepository.deleteAll()
        
        teams.forEach { sportmonksTeam ->
            val constructor = Constructor(
                id = sportmonksTeam.id.toString(),
                name = sportmonksTeam.name,
                nationality = sportmonksTeam.country?.name ?: "Unknown",
                url = sportmonksTeam.imageUrl ?: ""
            )
            
            constructorRepository.save(constructor)
            
            // Koppel coureurs aan teams
            sportmonksTeam.drivers?.forEach { sportmonksDriver ->
                val driver = driverRepository.findById(sportmonksDriver.id.toString())
                if (driver.isPresent) {
                    val driverEntity = driver.get()
                    driverEntity.constructor = constructor
                    driverRepository.save(driverEntity)
                }
            }
        }
        
        logger.info { "Successfully imported ${teams.size} teams and assigned drivers" }
    }
    
    fun updateRaceResults(raceId: String) {
        val race = raceRepository.findById(raceId).orElse(null) ?: return
        
        // Ophalen van resultaten voor de specifieke race
        val seasonRaceResults = fetchSeasonRaceResults(race.season.toString(), race.round)
        
        if (seasonRaceResults.isNotEmpty()) {
            // Top 3 coureurs
            val podiumResults = seasonRaceResults.sortedBy { it.position }.take(3)
            
            if (podiumResults.size >= 3) {
                race.firstPlaceDriverId = podiumResults[0].driverId.toString()
                race.secondPlaceDriverId = podiumResults[1].driverId.toString()
                race.thirdPlaceDriverId = podiumResults[2].driverId.toString()
                
                // Zoek snelste ronde
                val fastestLapDriver = seasonRaceResults.minByOrNull { it.fastestLapTime ?: Double.MAX_VALUE }?.driverId
                if (fastestLapDriver != null) {
                    race.fastestLapDriverId = fastestLapDriver.toString()
                }
                
                race.raceCompleted = true
                raceRepository.save(race)
            }
        }
    }
    
    // Helper methodes voor API calls
    
    private fun fetchCurrentSeason(): Season {
        val url = "$baseUrl/seasons/current"
        logger.info { "Fetching current season from $url" }
        
        val response = makeApiRequest(url, object {}.javaClass)
        
        return Season(
            id = (response["data"] as Map<*, *>)["id"].toString().toLong(),
            name = (response["data"] as Map<*, *>)["name"].toString(),
            year = (response["data"] as Map<*, *>)["year"].toString().toInt()
        )
    }
    
    private fun fetchTracksBySeasonId(seasonId: Long): List<Track> {
        val url = "$baseUrl/tracks/season/$seasonId"
        logger.info { "Fetching tracks for season $seasonId from $url" }
        
        val response = makeApiRequest(url, object {}.javaClass)
        
        val tracksData = response["data"] as List<*>
        return tracksData.map { trackData ->
            trackData as Map<*, *>
            
            val country = if (trackData["country"] != null) {
                (trackData["country"] as Map<*, *>)["name"].toString()
            } else {
                "Unknown"
            }
            
            Track(
                id = trackData["id"].toString().toLong(),
                name = trackData["name"].toString(),
                city = trackData["city"]?.toString(),
                country = country
            )
        }
    }
    
    private fun fetchStageByTrackId(trackId: Long): Stage {
        val url = "$baseUrl/stages/track/$trackId"
        logger.info { "Fetching stage info for track $trackId from $url" }
        
        val response = makeApiRequest(url, object {}.javaClass)
        
        val stageData = (response["data"] as List<*>).firstOrNull() as? Map<*, *>
            ?: throw IllegalStateException("No stage data found for track $trackId")
        
        return Stage(
            id = stageData["id"].toString().toLong(),
            name = stageData["name"].toString(),
            trackId = stageData["track_id"].toString().toLong(),
            startingAt = stageData["starting_at"].toString()
        )
    }
    
    private fun fetchDriversBySeasonId(seasonId: Long): List<SportmonksDriver> {
        val url = "$baseUrl/drivers/season/$seasonId"
        logger.info { "Fetching drivers for season $seasonId from $url" }
        
        val response = makeApiRequest(url, object {}.javaClass)
        
        val driversData = response["data"] as List<*>
        return driversData.map { driverData ->
            driverData as Map<*, *>
            
            val country = if (driverData["country"] != null) {
                val countryData = driverData["country"] as Map<*, *>
                Country(
                    id = countryData["id"].toString().toLong(),
                    name = countryData["name"].toString()
                )
            } else null
            
            SportmonksDriver(
                id = driverData["id"].toString().toLong(),
                name = driverData["name"].toString(),
                shortName = driverData["short_name"]?.toString(),
                number = driverData["number"]?.toString()?.toIntOrNull(),
                dateOfBirth = driverData["date_of_birth"]?.toString(),
                country = country,
                imageUrl = driverData["image_url"]?.toString()
            )
        }
    }
    
    private fun fetchTeamsBySeasonId(seasonId: Long): List<SportmonksTeam> {
        val url = "$baseUrl/teams/season/$seasonId"
        logger.info { "Fetching teams for season $seasonId from $url" }
        
        val response = makeApiRequest(url, object {}.javaClass)
        
        val teamsData = response["data"] as List<*>
        return teamsData.map { teamData ->
            teamData as Map<*, *>
            
            val country = if (teamData["country"] != null) {
                val countryData = teamData["country"] as Map<*, *>
                Country(
                    id = countryData["id"].toString().toLong(),
                    name = countryData["name"].toString()
                )
            } else null
            
            val driversData = if (teamData["drivers"] != null) {
                (teamData["drivers"] as List<*>).map { driverData ->
                    driverData as Map<*, *>
                    SimpleDriver(
                        id = driverData["id"].toString().toLong(),
                        name = driverData["name"].toString()
                    )
                }
            } else null
            
            SportmonksTeam(
                id = teamData["id"].toString().toLong(),
                name = teamData["name"].toString(),
                country = country,
                imageUrl = teamData["image_url"]?.toString(),
                drivers = driversData
            )
        }
    }
    
    private fun fetchSeasonRaceResults(season: String, round: Int): List<RaceResult> {
        // In een echte implementatie zou je de race ID ophalen op basis van het seizoen en ronde
        // en dan de resultaten voor die specifieke race opvragen
        
        val url = "$baseUrl/race-results/season/$season"
        logger.info { "Fetching race results for season $season from $url" }
        
        val response = makeApiRequest(url, object {}.javaClass)
        
        val resultsData = response["data"] as List<*>
        return resultsData.map { resultData ->
            resultData as Map<*, *>
            
            RaceResult(
                id = resultData["id"].toString().toLong(),
                raceId = resultData["race_id"].toString().toLong(),
                driverId = resultData["driver_id"].toString().toLong(),
                position = resultData["position"].toString().toIntOrNull() ?: Int.MAX_VALUE,
                fastestLapTime = resultData["fastest_lap_time"]?.toString()?.toDoubleOrNull()
            )
        }
    }
    
    private fun <T> makeApiRequest(url: String, responseType: Class<T>): Map<*, *> {
        val headers = HttpHeaders()
        headers.set("Authorization", apiKey)
        
        val entity = HttpEntity<String>(headers)
        
        val responseEntity = restTemplate.exchange(
            url,
            HttpMethod.GET,
            entity,
            Map::class.java
        )
        
        return responseEntity.body ?: emptyMap<String, Any>()
    }
    
    // Data klassen voor Sportmonks response types
    
    data class Season(
        val id: Long,
        val name: String,
        val year: Int
    )
    
    data class Track(
        val id: Long,
        val name: String,
        val city: String?,
        val country: String
    )
    
    data class Stage(
        val id: Long,
        val name: String,
        val trackId: Long,
        val startingAt: String
    )
    
    data class Country(
        val id: Long,
        val name: String
    )
    
    data class SportmonksDriver(
        val id: Long,
        val name: String,
        val shortName: String?,
        val number: Int?,
        val dateOfBirth: String?,
        val country: Country?,
        val imageUrl: String?
    )
    
    data class SimpleDriver(
        val id: Long,
        val name: String
    )
    
    data class SportmonksTeam(
        val id: Long,
        val name: String,
        val country: Country?,
        val imageUrl: String?,
        val drivers: List<SimpleDriver>?
    )
    
    data class RaceResult(
        val id: Long,
        val raceId: Long,
        val driverId: Long,
        val position: Int,
        val fastestLapTime: Double?
    )
} 