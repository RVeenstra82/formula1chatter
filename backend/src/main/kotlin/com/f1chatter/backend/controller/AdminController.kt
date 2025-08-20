package com.f1chatter.backend.controller

import com.f1chatter.backend.service.OpenF1ApiService
import com.f1chatter.backend.service.DataSyncService
import com.f1chatter.backend.service.JolpicaApiService
import com.f1chatter.backend.service.PredictionService
import com.f1chatter.backend.repository.RaceRepository
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.time.LocalDate

@RestController
@RequestMapping("/admin")
class AdminController(
    private val openF1ApiService: OpenF1ApiService,
    private val dataSyncService: DataSyncService,
    private val jolpicaApiService: JolpicaApiService,
    private val predictionService: PredictionService,
    private val raceRepository: RaceRepository
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
    
    @PostMapping("/process-completed-races")
    fun processCompletedRaces(): ResponseEntity<Map<String, Any>> {
        return try {
            val weekAgo = LocalDate.now().minusDays(7)
            val recentRaces = raceRepository.findUpcomingRaces(weekAgo)
                .filter { !it.raceCompleted && it.date.isBefore(LocalDate.now()) }
            
            if (recentRaces.isEmpty()) {
                return ResponseEntity.ok(mapOf(
                    "message" to "No races need processing",
                    "processedRaces" to 0
                ))
            }
            
            var processedRaces = 0
            val processedRaceNames = mutableListOf<String>()
            
            for (race in recentRaces) {
                try {
                    jolpicaApiService.updateRaceResults(race.id)
                    predictionService.calculateScores(race.id)
                    processedRaces++
                    processedRaceNames.add(race.raceName)
                    
                    // Add delay between races
                    Thread.sleep(2000)
                } catch (e: Exception) {
                    return ResponseEntity.status(500).body(mapOf(
                        "error" to "Failed to process race ${race.raceName}: ${e.message}",
                        "processedRaces" to processedRaces,
                        "processedRaceNames" to processedRaceNames
                    ))
                }
            }
            
            ResponseEntity.ok(mapOf(
                "message" to "Successfully processed $processedRaces races",
                "processedRaces" to processedRaces,
                "processedRaceNames" to processedRaceNames
            ))
        } catch (e: Exception) {
            ResponseEntity.status(500).body(mapOf("error" to "Failed to process completed races: ${e.message}"))
        }
    }
    
    @PostMapping("/sync-race-data")
    fun syncRaceData(): ResponseEntity<Map<String, String>> {
        return try {
            dataSyncService.syncCurrentSeasonData()
            ResponseEntity.ok(mapOf("message" to "Race data synced successfully"))
        } catch (e: Exception) {
            ResponseEntity.status(500).body(mapOf("error" to "Failed to sync race data: ${e.message}"))
        }
    }
    
    @PostMapping("/sync-driver-data")
    fun syncDriverData(): ResponseEntity<Map<String, String>> {
        return try {
            dataSyncService.syncDriverData()
            ResponseEntity.ok(mapOf("message" to "Driver data synced successfully"))
        } catch (e: Exception) {
            ResponseEntity.status(500).body(mapOf("error" to "Failed to sync driver data: ${e.message}"))
        }
    }
    
    @GetMapping("/system-status")
    fun getSystemStatus(): ResponseEntity<Map<String, Any>> {
        return try {
            val totalRaces = raceRepository.count()
            val completedRaces = raceRepository.findByRaceCompletedTrue().size
            val pendingRaces = raceRepository.findUpcomingRaces(LocalDate.now()).size
            
            ResponseEntity.ok(mapOf(
                "totalRaces" to totalRaces,
                "completedRaces" to completedRaces,
                "pendingRaces" to pendingRaces,
                "lastSync" to LocalDate.now().toString()
            ))
        } catch (e: Exception) {
            ResponseEntity.status(500).body(mapOf("error" to "Failed to get system status: ${e.message}"))
        }
    }
}
