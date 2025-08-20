package com.f1chatter.backend.controller

import com.f1chatter.backend.dto.DriverDto
import com.f1chatter.backend.service.DriverService
import com.f1chatter.backend.service.OpenF1ApiService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/drivers")
class DriverController(
    private val driverService: DriverService,
    private val openF1ApiService: OpenF1ApiService,
    private val restTemplate: org.springframework.web.client.RestTemplate
) {
    @GetMapping
    fun getAllDrivers(): ResponseEntity<List<DriverDto>> {
        val drivers = driverService.getAllDrivers()
        return ResponseEntity.ok(drivers)
    }
    
    @GetMapping("/{id}")
    fun getDriverById(@PathVariable id: String): ResponseEntity<DriverDto> {
        return try {
            val driver = driverService.getDriverById(id)
            ResponseEntity.ok(driver)
        } catch (e: Exception) {
            ResponseEntity.notFound().build()
        }
    }
    
    @PostMapping("/update-profile-pictures")
    fun updateDriverProfilePictures(): ResponseEntity<Map<String, String>> {
        return try {
            openF1ApiService.updateDriverProfilePictures()
            ResponseEntity.ok(mapOf("message" to "Driver profile pictures updated successfully"))
        } catch (e: Exception) {
            ResponseEntity.internalServerError().body(mapOf("error" to "Failed to update driver profile pictures"))
        }
    }
    
    @GetMapping("/test-openf1-connection")
    fun testOpenF1Connection(): ResponseEntity<Map<String, Any>> {
        return try {
            // This is a simple test to check if we can connect to OpenF1 API
            val testUrl = "https://api.openf1.org/v1/drivers?limit=1"
            val response = restTemplate.getForObject(testUrl, List::class.java)
            
            if (response != null) {
                ResponseEntity.ok(mapOf(
                    "status" to "success",
                    "message" to "OpenF1 API connection successful",
                    "sampleData" to response.take(1)
                ))
            } else {
                ResponseEntity.ok(mapOf(
                    "status" to "error",
                    "message" to "OpenF1 API returned no data"
                ))
            }
        } catch (e: Exception) {
            ResponseEntity.ok(mapOf(
                "status" to "error",
                "message" to "Failed to connect to OpenF1 API",
                "error" to (e.message ?: "Unknown error")
            ))
        }
    }

    @GetMapping("/active/{raceId}")
    fun getActiveDriversForRace(@PathVariable raceId: String): ResponseEntity<List<DriverDto>> {
        return try {
            val drivers = driverService.getActiveDriversForRace(raceId)
            ResponseEntity.ok(drivers)
        } catch (e: Exception) {
            ResponseEntity.notFound().build()
        }
    }
} 