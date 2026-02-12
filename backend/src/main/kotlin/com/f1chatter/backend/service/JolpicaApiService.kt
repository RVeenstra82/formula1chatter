package com.f1chatter.backend.service

import com.f1chatter.backend.model.Constructor
import com.f1chatter.backend.model.Driver
import com.f1chatter.backend.model.Race
import com.f1chatter.backend.model.SprintRace
import com.f1chatter.backend.model.ApiCache
import com.f1chatter.backend.repository.ConstructorRepository
import com.f1chatter.backend.repository.DriverRepository
import com.f1chatter.backend.repository.RaceRepository
import com.f1chatter.backend.repository.SprintRaceRepository
import com.f1chatter.backend.repository.ApiCacheRepository
import com.fasterxml.jackson.databind.ObjectMapper
import mu.KotlinLogging
import org.springframework.beans.factory.annotation.Value
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import org.springframework.web.client.HttpClientErrorException
import org.springframework.web.client.RestTemplate
import com.f1chatter.backend.util.F1SeasonUtils
import java.time.LocalDate
import java.time.LocalTime
import java.time.format.DateTimeFormatter
import java.util.concurrent.ConcurrentHashMap

@Service
class JolpicaApiService(
    private val restTemplate: RestTemplate,
    private val objectMapper: ObjectMapper,
    private val raceRepository: RaceRepository,
    private val sprintRaceRepository: SprintRaceRepository,
    private val driverRepository: DriverRepository,
    private val constructorRepository: ConstructorRepository,
    @Value("\${jolpica.api.base-url}")
    private val baseUrl: String,
    @Value("\${jolpica.api.rate-limit.requests-per-second:3}")
    private val requestsPerSecond: Int,
    @Value("\${jolpica.api.rate-limit.max-retries:3}")
    private val maxRetries: Int
) {
    private val logger = KotlinLogging.logger {}
    private val requestDelayMs = (1000 / requestsPerSecond).toLong() // Calculate delay based on requests per second
    private var lastRequestTime = 0L
    
    private fun getCurrentSeason(): Int = F1SeasonUtils.getCurrentSeason()
    
    // Cache to store API responses
    private val apiCache = ConcurrentHashMap<String, Map<*, *>>()
    private val cacheExpiryHours = 24L // Cache expires after 24 hours

    private fun clearExpiredCache() {
        val currentTime = System.currentTimeMillis()
        val expiredUrls = apiCache.entries
            .filter { entry -> 
                val timestamp = entry.value["_cacheTimestamp"] as? Long ?: 0L
                (currentTime - timestamp) > (cacheExpiryHours * 60 * 60 * 1000)
            }
            .map { it.key }
        
        expiredUrls.forEach { apiCache.remove(it) }
    }
    
    private fun <T> makeApiRequest(url: String, responseType: Class<T>): T? {
        // Check if we have a cached response for this URL
        if (apiCache.containsKey(url) && responseType == Map::class.java) {
            logger.debug { "Using cached response for $url" }
            @Suppress("UNCHECKED_CAST")
            return apiCache[url] as T
        }
        
        val currentTime = System.currentTimeMillis()
        val elapsedSinceLastRequest = currentTime - lastRequestTime
        
        // If we've made a request recently, wait to avoid hitting rate limits
        if (elapsedSinceLastRequest < requestDelayMs && lastRequestTime > 0) {
            val sleepTime = requestDelayMs - elapsedSinceLastRequest
            logger.debug { "Rate limiting: Sleeping for $sleepTime ms before next API request" }
            try {
                Thread.sleep(sleepTime)
            } catch (e: InterruptedException) {
                Thread.currentThread().interrupt()
            }
        }
        
        // Try the request with exponential backoff for retries
        var retries = 0
        
        while (retries <= maxRetries) {
            try {
                lastRequestTime = System.currentTimeMillis()
                val response = restTemplate.getForObject(url, responseType)
                
                // Cache the response if it's a Map
                if (response is Map<*, *> && responseType == Map::class.java) {
                    val responseCopy = HashMap(response)
                    responseCopy["_cacheTimestamp"] = System.currentTimeMillis()
                    apiCache[url] = responseCopy
                }
                
                return response
            } catch (e: HttpClientErrorException) {
                if (e.statusCode.value() == 429) { // Too Many Requests
                    retries++
                    if (retries <= maxRetries) {
                        val waitTime = Math.pow(2.0, retries.toDouble()).toLong() * 1000
                        logger.warn { "Rate limit exceeded. Retrying in $waitTime ms (retry $retries/$maxRetries)" }
                        try {
                            Thread.sleep(waitTime)
                        } catch (ie: InterruptedException) {
                            Thread.currentThread().interrupt()
                            throw e
                        }
                    } else {
                        logger.error { "Max retries reached for API request to $url" }
                        throw e
                    }
                } else {
                    // For other HTTP errors, just rethrow
                    throw e
                }
            }
        }
        
        return null
    }
    
    fun fetchCurrentSeasonRaces() {
        // First check if we already have races for the current season in the database
        val currentSeason = getCurrentSeason()
        val existingRaces = raceRepository.findBySeason(currentSeason)
        
        if (existingRaces.isNotEmpty()) {
            logger.info { "Using ${existingRaces.size} existing races for season $currentSeason from database" }
            // Still fetch weekend schedules for existing races
            fetchWeekendSchedules(currentSeason)
            return
        }
        
        val url = "$baseUrl/$currentSeason.json"
        logger.info { "Fetching races from $url for season $currentSeason" }
        
        val response = makeApiRequest(url, Map::class.java) ?: return
        val raceData = response["MRData"] as? Map<*, *>
        val raceTable = raceData?.get("RaceTable") as? Map<*, *>
        val races = raceTable?.get("Races") as? List<Map<*, *>> ?: emptyList()
        
        races.forEach { raceMap ->
            val round = raceMap["round"].toString().toInt()
            val raceName = raceMap["raceName"].toString()
            
            val circuit = raceMap["Circuit"] as Map<*, *>
            val circuitId = circuit["circuitId"].toString()
            val circuitName = circuit["circuitName"].toString()
            
            val location = circuit["Location"] as Map<*, *>
            val locality = location["locality"].toString()
            val country = location["country"].toString()
            
            val date = LocalDate.parse(raceMap["date"].toString())
            
            val time = if (raceMap["time"] != null) {
                LocalTime.parse(raceMap["time"].toString().replace("Z", ""))
            } else {
                LocalTime.NOON
            }
            
            val raceId = "$currentSeason-$round"
            
            val race = Race(
                id = raceId,
                season = currentSeason,
                round = round,
                raceName = raceName,
                circuitId = circuitId,
                circuitName = circuitName,
                country = country,
                locality = locality,
                date = date,
                time = time
            )
            
            raceRepository.save(race)
        }
        
        logger.info { "Successfully imported ${races.size} races for season $currentSeason" }
    }
    
    fun fetchDriversForSeason(season: Int? = null, forceRefresh: Boolean = false) {
        // Use provided season or determine current season
        val dataYear = season ?: getCurrentSeason()

        if (!forceRefresh) {
            // Check if we already have drivers stored
            val existingDrivers = driverRepository.findAll().toList()
            val existingConstructors = constructorRepository.findAll().toList()

            // If we have drivers and constructors and they have relationships, we can skip fetching
            if (existingDrivers.isNotEmpty() && existingConstructors.isNotEmpty() &&
                existingDrivers.any { it.constructor != null }) {
                logger.info { "Using ${existingDrivers.size} existing drivers and ${existingConstructors.size} constructors from database" }
                return
            }
        }

        logger.info { "Fetching drivers and constructors for season $dataYear (forceRefresh=$forceRefresh)" }
        fetchDrivers(dataYear)
        fetchConstructorsForSeason(dataYear)
        assignDriversToConstructors(dataYear)
    }
    
    private fun fetchDrivers(dataYear: Int) {
        val url = "$baseUrl/$dataYear/drivers.json"
        logger.info { "Fetching drivers from $url" }
        
        val response = makeApiRequest(url, Map::class.java) ?: return
        val data = response["MRData"] as? Map<*, *>
        val driverTable = data?.get("DriverTable") as? Map<*, *>
        val drivers = driverTable?.get("Drivers") as? List<Map<*, *>> ?: emptyList()
        
        // Verwijder bestaande drivers voor het opnieuw toevoegen
        val existingDrivers = driverRepository.findAll()
        if (existingDrivers.isNotEmpty()) {
            logger.info { "Removing ${existingDrivers.size} existing drivers" }
            driverRepository.deleteAll(existingDrivers)
        }
        
        drivers.forEach { driverMap ->
            val driverId = driverMap["driverId"].toString()
            val code = driverMap["code"]?.toString() ?: ""
            val permanentNumber = driverMap["permanentNumber"]?.toString()
            val givenName = driverMap["givenName"].toString()
            val familyName = driverMap["familyName"].toString()
            val dateOfBirth = driverMap["dateOfBirth"].toString()
            val nationality = driverMap["nationality"].toString()
            val url = driverMap["url"].toString()
            
            val driver = Driver(
                id = driverId,
                code = code,
                permanentNumber = permanentNumber,
                givenName = givenName,
                familyName = familyName,
                dateOfBirth = dateOfBirth,
                nationality = nationality,
                url = url
            )
            
            driverRepository.save(driver)
        }
        
        logger.info { "Successfully imported ${drivers.size} drivers" }
    }
    
    private fun fetchConstructorsForSeason(season: Int) {
        val url = "$baseUrl/$season/constructors.json"
        logger.info { "Fetching constructors from $url" }
        
        val response = makeApiRequest(url, Map::class.java) ?: return
        val data = response["MRData"] as? Map<*, *>
        val constructorTable = data?.get("ConstructorTable") as? Map<*, *>
        val constructors = constructorTable?.get("Constructors") as? List<Map<*, *>> ?: emptyList()
        
        constructors.forEach { constructorMap ->
            val constructorId = constructorMap["constructorId"].toString()
            val name = constructorMap["name"].toString()
            val nationality = constructorMap["nationality"].toString()
            val url = constructorMap["url"].toString()
            
            val constructor = Constructor(
                id = constructorId,
                name = name,
                nationality = nationality,
                url = url
            )
            
            constructorRepository.save(constructor)
        }
        
        logger.info { "Successfully imported ${constructors.size} constructors" }
    }
    
    private fun assignDriversToConstructors(season: Int) {
        // First try driver standings (available once the season has started)
        val url = "$baseUrl/$season/driverStandings.json"
        logger.info { "Fetching driver standings to assign constructors from $url" }

        val response = makeApiRequest(url, Map::class.java)
        val data = response?.get("MRData") as? Map<*, *>
        val standingsTable = data?.get("StandingsTable") as? Map<*, *>
        val standingsLists = standingsTable?.get("StandingsLists") as? List<Map<*, *>> ?: emptyList()

        if (standingsLists.isNotEmpty()) {
            val driverStandings = standingsLists[0]["DriverStandings"] as? List<Map<*, *>> ?: emptyList()
            driverStandings.forEach { standingMap ->
                val driverId = (standingMap["Driver"] as Map<*, *>)["driverId"].toString()
                val constructorsList = standingMap["Constructors"] as? List<Map<*, *>> ?: emptyList()
                if (constructorsList.isNotEmpty()) {
                    val constructorId = constructorsList[0]["constructorId"].toString()
                    linkDriverToConstructor(driverId, constructorId)
                }
            }
            logger.info { "Assigned constructors via driver standings" }
            return
        }

        // Fallback: query each constructor's drivers (works before season starts)
        logger.info { "No standings available for season $season, fetching drivers per constructor" }
        val constructors = constructorRepository.findAll()
        constructors.forEach { constructor ->
            try {
                val driversUrl = "$baseUrl/$season/constructors/${constructor.id}/drivers.json"
                val driversResponse = makeApiRequest(driversUrl, Map::class.java) ?: return@forEach
                val driversData = driversResponse["MRData"] as? Map<*, *>
                val driverTable = driversData?.get("DriverTable") as? Map<*, *>
                val drivers = driverTable?.get("Drivers") as? List<Map<*, *>> ?: emptyList()

                drivers.forEach { driverMap ->
                    val driverId = driverMap["driverId"].toString()
                    linkDriverToConstructor(driverId, constructor.id)
                }
            } catch (e: Exception) {
                logger.error(e) { "Failed to fetch drivers for constructor ${constructor.name}" }
            }
        }
        logger.info { "Assigned constructors via per-constructor driver lists" }
    }

    private fun linkDriverToConstructor(driverId: String, constructorId: String) {
        val driver = driverRepository.findByIdOrNull(driverId)
        val constructor = constructorRepository.findByIdOrNull(constructorId)
        if (driver != null && constructor != null) {
            driver.constructor = constructor
            driverRepository.save(driver)
        }
    }
    
    fun updateRaceResults(raceId: String) {
        val race = raceRepository.findByIdOrNull(raceId) ?: return
        
        // If the race is already completed, no need to fetch results again
        if (race.raceCompleted) {
            logger.info { "Race ${race.raceName} is already completed, skipping result update" }
            return
        }
        
        val url = "$baseUrl/${race.season}/${race.round}/results.json"
        logger.info { "Fetching race results from $url" }
        
        val response = makeApiRequest(url, Map::class.java) ?: return
        val data = response["MRData"] as? Map<*, *>
        val raceTable = data?.get("RaceTable") as? Map<*, *>
        val races = raceTable?.get("Races") as? List<Map<*, *>> ?: emptyList()
        
        if (races.isNotEmpty()) {
            val results = races[0]["Results"] as? List<Map<*, *>> ?: emptyList()
            
            if (results.size >= 3) {
                val first = results[0]
                val second = results[1]
                val third = results[2]
                
                race.firstPlaceDriverId = (first["Driver"] as Map<*, *>)["driverId"].toString()
                race.secondPlaceDriverId = (second["Driver"] as Map<*, *>)["driverId"].toString()
                race.thirdPlaceDriverId = (third["Driver"] as Map<*, *>)["driverId"].toString()
                
                results.forEach { result ->
                    if (result["FastestLap"] != null) {
                        val rank = (result["FastestLap"] as Map<*, *>)["rank"].toString()
                        if (rank == "1") {
                            race.fastestLapDriverId = (result["Driver"] as Map<*, *>)["driverId"].toString()
                        }
                    }
                }
                
                race.raceCompleted = true
                raceRepository.save(race)
                logger.info { "Successfully updated results for race ${race.raceName}" }
            }
        }
    }
    
    fun fetchWeekendSchedules(season: Int) {
        logger.info { "Fetching weekend schedules for season $season" }
        
        val races = raceRepository.findBySeason(season)
        if (races.isEmpty()) {
            logger.warn { "No races found for season $season, cannot fetch weekend schedules" }
            return
        }
        
        races.forEach { race ->
            try {
                fetchWeekendScheduleForRace(race)
                // Rate limiting between requests
                Thread.sleep(1000L / requestsPerSecond)
            } catch (e: Exception) {
                logger.error(e) { "Failed to fetch weekend schedule for race ${race.raceName}" }
            }
        }
        
        logger.info { "Completed fetching weekend schedules for ${races.size} races" }
    }
    
    fun fetchSprintRaces(season: Int) {
        logger.info { "Fetching sprint races for season $season" }
        
        val races = raceRepository.findBySeason(season)
        if (races.isEmpty()) {
            logger.warn { "No races found for season $season, cannot fetch sprint races" }
            return
        }
        
        races.forEach { race ->
            try {
                fetchSprintRaceForRace(race)
                // Rate limiting between requests
                Thread.sleep(1000L / requestsPerSecond)
            } catch (e: Exception) {
                logger.error(e) { "Failed to fetch sprint race for race ${race.raceName}" }
            }
        }
        
        logger.info { "Completed fetching sprint races for ${races.size} races" }
    }
    
    private fun fetchWeekendScheduleForRace(race: Race) {
        val url = "$baseUrl/${race.season}/${race.round}.json"
        logger.debug { "Fetching weekend schedule from $url for race ${race.raceName}" }
        
        val response = makeApiRequest(url, Map::class.java) ?: return
        val raceData = response["MRData"] as? Map<*, *>
        val raceTable = raceData?.get("RaceTable") as? Map<*, *>
        val races = raceTable?.get("Races") as? List<Map<*, *>> ?: emptyList()
        
        if (races.isNotEmpty()) {
            val raceData = races[0]
            
            // Extract practice and qualifying times
            val practice1 = raceData["FirstPractice"] as? Map<*, *>
            val practice2 = raceData["SecondPractice"] as? Map<*, *>
            val practice3 = raceData["ThirdPractice"] as? Map<*, *>
            val qualifying = raceData["Qualifying"] as? Map<*, *>
            
            // Extract sprint weekend information
            val sprint = raceData["Sprint"] as? Map<*, *>
            val sprintQualifying = raceData["SprintQualifying"] as? Map<*, *>
            
            // Update race with weekend schedule
            if (practice1 != null) {
                race.practice1Date = LocalDate.parse(practice1["date"].toString())
                race.practice1Time = LocalTime.parse(practice1["time"].toString().replace("Z", ""))
            }
            
            if (practice2 != null) {
                race.practice2Date = LocalDate.parse(practice2["date"].toString())
                race.practice2Time = LocalTime.parse(practice2["time"].toString().replace("Z", ""))
            }
            
            if (practice3 != null) {
                race.practice3Date = LocalDate.parse(practice3["date"].toString())
                race.practice3Time = LocalTime.parse(practice3["time"].toString().replace("Z", ""))
            }
            
            if (qualifying != null) {
                race.qualifyingDate = LocalDate.parse(qualifying["date"].toString())
                race.qualifyingTime = LocalTime.parse(qualifying["time"].toString().replace("Z", ""))
            }
            
            // Update sprint weekend information
            if (sprint != null) {
                race.isSprintWeekend = true
                race.sprintDate = LocalDate.parse(sprint["date"].toString())
                race.sprintTime = LocalTime.parse(sprint["time"].toString().replace("Z", ""))
            }
            
            if (sprintQualifying != null) {
                race.sprintQualifyingDate = LocalDate.parse(sprintQualifying["date"].toString())
                race.sprintQualifyingTime = LocalTime.parse(sprintQualifying["time"].toString().replace("Z", ""))
            }
            
            raceRepository.save(race)
            logger.debug { "Updated weekend schedule for race ${race.raceName}" }
        }
    }
    
    private fun fetchSprintRaceForRace(race: Race) {
        // Only fetch sprint race data if this is a sprint weekend
        if (race.isSprintWeekend != true) {
            return
        }
        
        val url = "$baseUrl/${race.season}/${race.round}/sprint.json"
        logger.debug { "Fetching sprint race data from $url for race ${race.raceName}" }
        
        val response = makeApiRequest(url, Map::class.java) ?: return
        val sprintData = response["MRData"] as? Map<*, *>
        val sprintTable = sprintData?.get("SprintTable") as? Map<*, *>
        val sprints = sprintTable?.get("Sprints") as? List<Map<*, *>> ?: emptyList()
        
        if (sprints.isNotEmpty()) {
            val sprintData = sprints[0]
            
            // Check if sprint race already exists
            val existingSprintRace = sprintRaceRepository.findBySeasonAndRound(race.season, race.round)
            
            if (existingSprintRace == null) {
                // Create new sprint race
                val sprintRace = SprintRace(
                    id = "${race.season}-${race.round}-sprint",
                    season = race.season,
                    round = race.round,
                    raceName = "${race.raceName} Sprint",
                    circuitId = race.circuitId,
                    circuitName = race.circuitName,
                    country = race.country,
                    locality = race.locality,
                    date = race.sprintDate ?: race.date,
                    time = race.sprintTime ?: race.time,
                    sprintQualifyingDate = race.sprintQualifyingDate,
                    sprintQualifyingTime = race.sprintQualifyingTime
                )
                
                sprintRaceRepository.save(sprintRace)
                logger.debug { "Created sprint race for ${race.raceName}" }
            }
        }
    }
    
    // Periodically clear expired cache entries
    @org.springframework.scheduling.annotation.Scheduled(fixedRate = 3600000) // Once per hour
    fun cleanupCache() {
        logger.debug { "Cleaning up expired cache entries" }
        clearExpiredCache()
        logger.debug { "Cache size after cleanup: ${apiCache.size}" }
    }
} 