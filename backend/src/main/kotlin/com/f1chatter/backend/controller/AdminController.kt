package com.f1chatter.backend.controller

import com.f1chatter.backend.service.OpenF1ApiService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/admin")
class AdminController(
    private val openF1ApiService: OpenF1ApiService
) {
    
    @PostMapping("/update-driver-photos")
    fun updateDriverPhotos(): ResponseEntity<Map<String, String>> {
        return try {
            openF1ApiService.updateDriverProfilePictures()
            ResponseEntity.ok(mapOf("message" to "Driver photos updated successfully"))
        } catch (e: Exception) {
            ResponseEntity.status(500).body(mapOf("error" to "Failed to update driver photos: ${e.message}"))
        }
    }
}
