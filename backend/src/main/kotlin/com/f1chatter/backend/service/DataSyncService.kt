package com.f1chatter.backend.service

import com.f1chatter.backend.repository.ConstructorRepository
import com.f1chatter.backend.repository.DriverRepository
import com.f1chatter.backend.repository.RaceRepository
import com.f1chatter.backend.util.F1SeasonUtils
import mu.KotlinLogging
import org.springframework.beans.factory.annotation.Value
import org.springframework.scheduling.annotation.EnableScheduling
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Service
import java.time.LocalDate

@Service
@EnableScheduling
class DataSyncService(
    private val jolpicaApiService: JolpicaApiService,
    private val openF1ApiService: OpenF1ApiService,
    private val raceRepository: RaceRepository,
    private val driverRepository: DriverRepository,
    private val constructorRepository: ConstructorRepository,
    private val predictionService: PredictionService
) {
    private val logger = KotlinLogging.logger {}
    
    @Value("\${openf1.api.startup.update-profile-pictures:false}")
    private lateinit var updateProfilePicturesOnStartup: String
    
    fun getCurrentSeason(): Int = F1SeasonUtils.getCurrentSeason()
    
    // Reduced frequency to once per week to minimize API calls
    @Scheduled(cron = "0 0 0 * * SUN") // At midnight on Sunday
    fun syncCurrentSeasonData() {
        // First check if we need to sync race data
        val currentSeason = getCurrentSeason()
        val existingRaces = raceRepository.findBySeason(currentSeason)
        
        if (existingRaces.isEmpty()) {
            logger.info { "Syncing current season race data" }
            jolpicaApiService.fetchCurrentSeasonRaces()
        } else {
            logger.info { "Races for season $currentSeason already exist, skipping race sync" }
        }
    }
    
    // Re-sync drivers weekly to pick up mid-season changes
    @Scheduled(cron = "0 0 1 * * SUN") // At 1 AM on Sunday
    fun syncDriverData() {
        logger.info { "Weekly driver sync for season ${getCurrentSeason()}" }
        jolpicaApiService.fetchDriversForSeason(getCurrentSeason(), forceRefresh = true)
    }
    
    // Check for new season data daily
    @Scheduled(cron = "0 0 6 * * *") // At 6 AM daily
    fun checkForNewSeason() {
        logger.info { "Checking for new season data" }
        
        // Get current season
        val currentSeason = getCurrentSeason()
        
        // Check if we have races for the current season
        val existingRaces = raceRepository.findBySeason(currentSeason)
        
        if (existingRaces.isEmpty()) {
            logger.info { "No races found for season $currentSeason, syncing new season data" }
            syncCurrentSeasonData()
        } else {
            logger.info { "Races already exist for season $currentSeason, skipping season sync" }
        }
    }
    
    // Update driver profile pictures weekly
    @Scheduled(cron = "0 0 2 * * SUN") // At 2 AM on Sunday
    fun updateDriverProfilePictures() {
        logger.info { "Starting scheduled update of driver profile pictures" }
        openF1ApiService.updateDriverProfilePictures()
    }
    
    // Sync weekend schedules and sprint data weekly
    @Scheduled(cron = "0 0 3 * * SUN") // At 3 AM on Sunday
    fun syncWeekendSchedulesAndSprintData() {
        logger.info { "Starting scheduled sync of weekend schedules and sprint data" }
        val currentSeason = getCurrentSeason()
        
        try {
            // First sync weekend schedules (this will also update sprint weekend flags)
            jolpicaApiService.fetchWeekendSchedules(currentSeason)
            
            // Then sync sprint race data
            jolpicaApiService.fetchSprintRaces(currentSeason)
            
            logger.info { "Successfully synced weekend schedules and sprint data for season $currentSeason" }
        } catch (e: Exception) {
            logger.error(e) { "Failed to sync weekend schedules and sprint data for season $currentSeason" }
        }
    }
    
    // Check for completed races every hour on Sundays (when most races happen)
    @Scheduled(cron = "0 0 * * * SUN") // Every hour on Sunday
    fun checkForCompletedRaces() {
        logger.info { "Checking for completed races to update results" }
        
        // Look for races from the last 7 days that haven't been processed yet
        val weekAgo = LocalDate.now().minusDays(7)
        val recentRaces = raceRepository.findUpcomingRaces(weekAgo)
            .filter { !it.raceCompleted && it.date.isBefore(LocalDate.now()) }
        
        if (recentRaces.isEmpty()) {
            logger.info { "No recent races need to be updated" }
            return
        }
        
        // Process races and stop if all are completed to avoid unnecessary API calls
        var processedRaces = 0
        for (race in recentRaces) {
            try {
                logger.info { "Updating results for race: ${race.raceName}" }
                jolpicaApiService.updateRaceResults(race.id)
                
                predictionService.calculateScores(race.id)
                logger.info { "Calculated prediction scores for race: ${race.raceName}" }
                processedRaces++
                
                // Add delay between races to avoid rate limiting
                Thread.sleep(2000)
            } catch (e: Exception) {
                logger.error(e) { "Failed to process race: ${race.raceName}" }
            }
        }
        
        logger.info { "Processed $processedRaces races. If all races are completed, no more API calls needed until next race." }
    }
    
    // Run at startup to initialize data if needed
    fun initializeData() {
        logger.info { "Initializing F1 data if needed" }
        
        // Check if we have race data for the current season
        val currentSeason = getCurrentSeason()
        val hadCurrentSeasonRaces = raceRepository.findBySeason(currentSeason).isNotEmpty()
        if (!hadCurrentSeasonRaces) {
            logger.info { "No races found for season $currentSeason, syncing race data" }
            syncCurrentSeasonData()
        } else {
            logger.info { "Races for season $currentSeason already exist, skipping race sync" }
        }

        // Re-sync drivers for the current season if we just synced new races,
        // or if driver/constructor data is missing entirely
        val hasDrivers = driverRepository.count() > 0
        val hasConstructors = constructorRepository.count() > 0
        val needsDriverRefresh = !hadCurrentSeasonRaces || !hasDrivers || !hasConstructors

        if (needsDriverRefresh) {
            logger.info { "Syncing drivers and constructors for season $currentSeason" }
            try {
                Thread.sleep(5000) // Wait to avoid rate limiting
            } catch (e: InterruptedException) {
                Thread.currentThread().interrupt()
            }
            jolpicaApiService.fetchDriversForSeason(currentSeason, forceRefresh = true)
        } else {
            logger.info { "Drivers and constructors already exist for current season, skipping driver sync" }
        }
        
        // Only update driver profile pictures during startup if explicitly enabled
        // This can be controlled via environment variable to avoid startup delays
        val shouldUpdateProfilePictures = updateProfilePicturesOnStartup.toBoolean()
        
        if (hasDrivers && shouldUpdateProfilePictures) {
            logger.info { "Updating driver profile pictures from OpenF1 API during startup" }
            try {
                Thread.sleep(2000) // Wait 2 seconds before updating profile pictures
                openF1ApiService.updateDriverProfilePictures()
            } catch (e: Exception) {
                logger.error(e) { "Failed to update driver profile pictures during initialization" }
            }
        } else if (hasDrivers) {
            logger.info { "Skipping profile picture updates during startup (set UPDATE_PROFILE_PICTURES_ON_STARTUP=true to enable)" }
        }
    }
} 