package com.f1chatter.backend.controller

import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RestController

@RestController
class HealthController {
    @GetMapping("/api/health")
    fun healthCheck(): Map<String, String> {
        return mapOf("status" to "UP")
    }
} 