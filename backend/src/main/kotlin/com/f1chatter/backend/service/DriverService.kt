package com.f1chatter.backend.service

import com.f1chatter.backend.dto.DriverDto
import com.f1chatter.backend.model.Driver
import com.f1chatter.backend.repository.DriverRepository
import org.springframework.stereotype.Service
import java.util.NoSuchElementException

@Service
class DriverService(
    private val driverRepository: DriverRepository
) {
    fun getAllDrivers(): List<DriverDto> {
        return driverRepository.findAll().map { mapToDto(it) }
    }
    
    fun getDriverById(id: String): DriverDto {
        val driver = driverRepository.findById(id)
            .orElseThrow { NoSuchElementException("Driver not found with id: $id") }
        
        return mapToDto(driver)
    }
    
    private fun mapToDto(driver: Driver): DriverDto {
        return DriverDto(
            id = driver.id,
            code = driver.code,
            number = driver.permanentNumber,
            firstName = driver.givenName,
            lastName = driver.familyName,
            nationality = driver.nationality,
            constructorId = driver.constructor?.id,
            constructorName = driver.constructor?.name,
            profilePictureUrl = driver.profilePictureUrl
        )
    }
} 