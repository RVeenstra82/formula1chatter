package com.f1chatter.backend.service

import com.f1chatter.backend.model.Driver
import com.f1chatter.backend.repository.DriverRepository
import mu.KotlinLogging
import org.springframework.http.ResponseEntity
import org.springframework.stereotype.Service
import org.springframework.web.client.RestTemplate
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpMethod
import org.springframework.http.HttpEntity
import java.net.URLEncoder
import java.nio.charset.StandardCharsets

@Service
class OpenF1ApiService(
    private val driverRepository: DriverRepository,
    private val restTemplate: RestTemplate
) {
    private val logger = KotlinLogging.logger {}
    private val baseUrl = "https://api.openf1.org/v1"
    
    /**
     * Updates profile pictures for all drivers using OpenF1 API
     */
    fun updateDriverProfilePictures() {
        logger.info { "Starting to update driver profile pictures from OpenF1 API" }
        
        // Test API connection first
        if (!testApiConnection()) {
            logger.error { "OpenF1 API connection test failed. Skipping profile picture updates." }
            return
        }
        
        val drivers = driverRepository.findAll()
        var updatedCount = 0
        var skippedCount = 0
        
        drivers.forEach { driver ->
            try {
                val headshotUrl = fetchDriverHeadshotUrl(driver)
                if (headshotUrl != null && headshotUrl != driver.profilePictureUrl) {
                    driver.profilePictureUrl = headshotUrl
                    driverRepository.save(driver)
                    updatedCount++
                    logger.info { "Updated profile picture for driver: ${driver.givenName} ${driver.familyName}" }
                } else if (headshotUrl == null) {
                    skippedCount++
                    logger.debug { "No headshot URL found for driver: ${driver.givenName} ${driver.familyName}" }
                }
                
                // Add a small delay to avoid rate limiting
                Thread.sleep(100)
            } catch (e: Exception) {
                logger.error(e) { "Failed to update profile picture for driver: ${driver.givenName} ${driver.familyName}" }
            }
        }
        
        logger.info { "Completed updating driver profile pictures. Updated $updatedCount drivers, skipped $skippedCount drivers." }
    }
    
    /**
     * Tests the connection to OpenF1 API
     */
    private fun testApiConnection(): Boolean {
        return try {
            val testUrl = "$baseUrl/drivers?limit=1"
            val response = makeApiRequest(testUrl, List::class.java)
            response != null
        } catch (e: Exception) {
            logger.error(e) { "Failed to connect to OpenF1 API" }
            false
        }
    }
    
    /**
     * Fetches the headshot URL for a specific driver from OpenF1 API
     */
    private fun fetchDriverHeadshotUrl(driver: Driver): String? {
        try {
            // Try to find the driver by their permanent number first
            val driverNumber = driver.permanentNumber?.toIntOrNull()
            if (driverNumber != null) {
                val url = "$baseUrl/drivers?driver_number=$driverNumber"
                logger.debug { "Searching for driver by number: $driverNumber" }
                val response = makeApiRequest(url, List::class.java)
                
                if (response != null && response.isNotEmpty()) {
                    val driverData = response[0] as? Map<*, *>
                    val headshotUrl = driverData?.get("headshot_url")?.toString()
                    if (!headshotUrl.isNullOrBlank()) {
                        logger.debug { "Found headshot URL for driver ${driver.givenName} ${driver.familyName} by number: $headshotUrl" }
                        return headshotUrl
                    }
                }
            }
            
            // If not found by number, try to find by name
            val encodedFirstName = URLEncoder.encode(driver.givenName, StandardCharsets.UTF_8.toString())
            val encodedLastName = URLEncoder.encode(driver.familyName, StandardCharsets.UTF_8.toString())
            val url = "$baseUrl/drivers?first_name=$encodedFirstName&last_name=$encodedLastName"
            logger.debug { "Searching for driver by name: ${driver.givenName} ${driver.familyName}" }
            val response = makeApiRequest(url, List::class.java)
            
            if (response != null && response.isNotEmpty()) {
                val driverData = response[0] as? Map<*, *>
                val headshotUrl = driverData?.get("headshot_url")?.toString()
                if (!headshotUrl.isNullOrBlank()) {
                    logger.debug { "Found headshot URL for driver ${driver.givenName} ${driver.familyName} by name: $headshotUrl" }
                    return headshotUrl
                }
            }
            
            // Try a broader search with just the last name
            val lastNameUrl = "$baseUrl/drivers?last_name=$encodedLastName"
            logger.debug { "Searching for driver by last name only: ${driver.familyName}" }
            val lastNameResponse = makeApiRequest(lastNameUrl, List::class.java)
            
            if (lastNameResponse != null && lastNameResponse.isNotEmpty()) {
                // Find the best match by comparing first names
                val bestMatch = lastNameResponse.find { driverData ->
                    val responseFirstName = (driverData as? Map<*, *>)?.get("first_name")?.toString()
                    responseFirstName?.equals(driver.givenName, ignoreCase = true) == true
                }
                
                if (bestMatch != null) {
                    val driverData = bestMatch as? Map<*, *>
                    val headshotUrl = driverData?.get("headshot_url")?.toString()
                    if (!headshotUrl.isNullOrBlank()) {
                        logger.debug { "Found headshot URL for driver ${driver.givenName} ${driver.familyName} by last name match: $headshotUrl" }
                        return headshotUrl
                    }
                }
            }
            
            logger.warn { "No headshot URL found for driver: ${driver.givenName} ${driver.familyName}" }
            return null
            
        } catch (e: Exception) {
            logger.error(e) { "Error fetching headshot URL for driver: ${driver.givenName} ${driver.familyName}" }
            return null
        }
    }
    
    /**
     * Makes an API request to OpenF1
     */
    private fun <T> makeApiRequest(url: String, responseType: Class<T>): T? {
        try {
            logger.debug { "Making API request to: $url" }
            
            val headers = HttpHeaders()
            headers.set("User-Agent", "F1Chatter/1.0")
            
            val entity = HttpEntity<Any>(headers)
            val response: ResponseEntity<T> = restTemplate.exchange(url, HttpMethod.GET, entity, responseType)
            
            if (response.statusCode.is2xxSuccessful) {
                return response.body
            } else {
                logger.warn { "API request failed with status: ${response.statusCode}" }
                return null
            }
        } catch (e: Exception) {
            logger.error(e) { "Error making API request to: $url" }
            return null
        }
    }
}
https://fonts.google.com/specimen/Barlow+Condensed