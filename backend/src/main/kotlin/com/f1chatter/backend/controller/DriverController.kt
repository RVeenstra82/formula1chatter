package com.f1chatter.backend.controller

import com.f1chatter.backend.dto.DriverDto
import com.f1chatter.backend.service.DriverService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/drivers")
class DriverController(
    private val driverService: DriverService
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
} 