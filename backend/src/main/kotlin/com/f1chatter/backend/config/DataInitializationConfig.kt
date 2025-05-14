package com.f1chatter.backend.config

import com.f1chatter.backend.service.DataSyncService
import org.springframework.boot.context.event.ApplicationReadyEvent
import org.springframework.context.ApplicationListener
import org.springframework.context.annotation.Configuration

@Configuration
class DataInitializationConfig(
    private val dataSyncService: DataSyncService
) : ApplicationListener<ApplicationReadyEvent> {
    
    override fun onApplicationEvent(event: ApplicationReadyEvent) {
        dataSyncService.initializeData()
    }
} 