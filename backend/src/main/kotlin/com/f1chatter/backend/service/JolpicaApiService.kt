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
import org.springframework.stereotype.Service
import org.springframework.web.client.HttpClientErrorException
import org.springframework.web.client.RestTemplate
import java.time.LocalDate
import java.time.LocalTime
import java.time.format.DateTimeFormatter
import java.util.concurrent.ConcurrentHashMap

@Service
class JolpicaApiService(
    private val restTemplate: RestTemplate,
    private val objectMapper: ObjectMapper,
    private val raceRepository: RaceRepository,
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
        val currentSeason = 2025
        val existingRaces = raceRepository.findBySeason(currentSeason)
        
        if (existingRaces.isNotEmpty()) {
            logger.info { "Using ${existingRaces.size} existing races for season $currentSeason from database" }
            return
        }
        
        val url = "$baseUrl/2024.json"
        logger.info { "Fetching races from $url (We gebruiken 2024 data omdat 2025 nog niet beschikbaar is)" }
        
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
            
            val originalDate = LocalDate.parse(raceMap["date"].toString())
            val date = originalDate.plusYears(1)
            
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
    
    fun fetchDriversForSeason(season: Int = 2025) {
        // Check if we already have drivers stored
        val existingDrivers = driverRepository.findAll().toList()
        val existingConstructors = constructorRepository.findAll().toList()
        
        // If we have drivers and constructors and they have relationships, we can skip fetching
        if (existingDrivers.isNotEmpty() && existingConstructors.isNotEmpty() && 
            existingDrivers.any { it.constructor != null }) {
            logger.info { "Using ${existingDrivers.size} existing drivers and ${existingConstructors.size} constructors from database" }
            return
        }
        
        // Gebruik 2024 data voor drivers
        val dataYear = 2024
        
        // If we have no drivers or need to update, fetch them
        if (existingDrivers.isEmpty()) {
            fetchDrivers(dataYear)
        }
        
        // If we have no constructors or need to update, fetch them
        if (existingConstructors.isEmpty()) {
            fetchConstructorsForSeason(dataYear)
        }
        
        // Always assign drivers to constructors
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
        // Check if drivers already have constructors assigned
        val drivers = driverRepository.findAll().toList()
        if (drivers.all { it.constructor != null }) {
            logger.info { "All drivers already have constructors assigned, skipping constructor assignment" }
            return
        }
        
        val url = "$baseUrl/$season/driverStandings.json"
        logger.info { "Fetching driver standings to assign constructors from $url" }
        
        val response = makeApiRequest(url, Map::class.java) ?: return
        val data = response["MRData"] as? Map<*, *>
        val standingsTable = data?.get("StandingsTable") as? Map<*, *>
        val standingsLists = standingsTable?.get("StandingsLists") as? List<Map<*, *>> ?: emptyList()
        
        if (standingsLists.isNotEmpty()) {
            val driverStandings = standingsLists[0]["DriverStandings"] as? List<Map<*, *>> ?: emptyList()
            
            driverStandings.forEach { standingMap ->
                val driverId = (standingMap["Driver"] as Map<*, *>)["driverId"].toString()
                val constructorsList = standingMap["Constructors"] as? List<Map<*, *>> ?: emptyList()
                
                if (constructorsList.isNotEmpty()) {
                    val constructorId = constructorsList[0]["constructorId"].toString()
                    
                    val driver = driverRepository.findById(driverId)
                    val constructor = constructorRepository.findById(constructorId)
                    
                    if (driver.isPresent && constructor.isPresent) {
                        val driverEntity = driver.get()
                        driverEntity.constructor = constructor.get()
                        driverRepository.save(driverEntity)
                    }
                }
            }
        }
    }
    
    fun updateRaceResults(raceId: String) {
        val race = raceRepository.findById(raceId).orElse(null) ?: return
        
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
    
    // Periodically clear expired cache entries
    @org.springframework.scheduling.annotation.Scheduled(fixedRate = 3600000) // Once per hour
    fun cleanupCache() {
        logger.debug { "Cleaning up expired cache entries" }
        clearExpiredCache()
        logger.debug { "Cache size after cleanup: ${apiCache.size}" }
    }
} 