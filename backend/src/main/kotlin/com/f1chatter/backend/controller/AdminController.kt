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
                    "processedRaces" to "0"
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
                        "processedRaces" to processedRaces.toString(),
                        "processedRaceNames" to processedRaceNames
                    ))
                }
            }
            
            ResponseEntity.ok(mapOf(
                "message" to "Successfully processed $processedRaces races",
                "processedRaces" to processedRaces.toString(),
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
    
    @PostMapping("/force-sync-race-data")
    fun forceSyncRaceData(): ResponseEntity<Map<String, Any>> {
        return try {
            // Delete all existing race data for current season
            val currentSeason = dataSyncService.getCurrentSeason()
            val existingRaces = raceRepository.findBySeason(currentSeason)
            raceRepository.deleteAll(existingRaces)
            
            // Force sync new data
            jolpicaApiService.fetchCurrentSeasonRaces()
            
            ResponseEntity.ok(mapOf(
                "message" to "Race data force synced successfully",
                "deletedRaces" to existingRaces.size.toString(),
                // "season" to currentSeason.toString()
            ))
        } catch (e: Exception) {
            ResponseEntity.status(500).body(mapOf("error" to "Failed to force sync race data: ${e.message}"))
        }
    }
    
    @PostMapping("/force-sync-weekend-schedules")
    fun forceSyncWeekendSchedules(): ResponseEntity<Map<String, Any>> {
        return try {
            val currentSeason = dataSyncService.getCurrentSeason()
            val existingRaces = raceRepository.findBySeason(currentSeason)
            
            if (existingRaces.isEmpty()) {
                return ResponseEntity.badRequest().body(mapOf(
                    "error" to "No races found for season $currentSeason. Please sync race data first."
                ))
            }
            
            // Force sync weekend schedules for all races
            jolpicaApiService.fetchWeekendSchedules(currentSeason)
            
            ResponseEntity.ok(mapOf(
                "message" to "Weekend schedules force synced successfully",
                "updatedRaces" to existingRaces.size.toString(),
                "season" to currentSeason.toString()
            ))
        } catch (e: Exception) {
            ResponseEntity.status(500).body(mapOf("error" to "Failed to force sync weekend schedules: ${e.message}"))
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
