package com.f1chatter.backend.service

import com.f1chatter.backend.repository.PredictionRepository
import com.f1chatter.backend.repository.RaceRepository
import com.f1chatter.backend.repository.UserRepository
import mu.KotlinLogging
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate

@Service
class SeasonManagementService(
    private val predictionRepository: PredictionRepository,
    private val raceRepository: RaceRepository,
    private val userRepository: UserRepository
) {
    private val logger = KotlinLogging.logger {}
    
    /**
     * Determines the current F1 season based on the current date.
     * F1 seasons typically start in March, so if we're in January or February,
     * we use the previous year's season data.
     */
    private fun getCurrentSeason(): Int {
        val currentDate = LocalDate.now()
        val currentYear = currentDate.year
        val currentMonth = currentDate.monthValue
        
        // If we're in January or February, we're still in the previous year's season
        // F1 seasons typically start in March
        return if (currentMonth <= 2) {
            currentYear - 1
        } else {
            currentYear
        }
    }
    
    /**
     * Check for new season and reset scores if needed.
     * This runs daily at 7 AM to check if we've entered a new season.
     */
    @Scheduled(cron = "0 0 7 * * *") // At 7 AM daily
    @Transactional
    fun checkForNewSeasonAndResetScores() {
        val currentSeason = getCurrentSeason()
        logger.info { "Checking for new season. Current season: $currentSeason" }
        
        // Check if we have any predictions for the current season
        val currentSeasonPredictions = predictionRepository.findBySeason(currentSeason)
        
        if (currentSeasonPredictions.isNotEmpty()) {
            logger.info { "Found ${currentSeasonPredictions.size} predictions for season $currentSeason, scores already reset" }
            return
        }
        
        // Check if we have races for the current season (indicating a new season has started)
        val currentSeasonRaces = raceRepository.findBySeason(currentSeason)
        
        if (currentSeasonRaces.isNotEmpty()) {
            logger.info { "New season $currentSeason detected with ${currentSeasonRaces.size} races. Resetting scores for all users." }
            resetScoresForNewSeason(currentSeason)
        } else {
            logger.info { "No races found for season $currentSeason yet, skipping score reset" }
        }
    }
    
    /**
     * Reset scores for all users for a new season.
     * This creates zero-score predictions for all users for all races in the new season.
     */
    @Transactional
    fun resetScoresForNewSeason(season: Int) {
        val users = userRepository.findAll()
        val races = raceRepository.findBySeason(season)
        
        logger.info { "Resetting scores for ${users.size} users across ${races.size} races for season $season" }
        
        users.forEach { user ->
            races.forEach { race ->
                // Check if prediction already exists
                val existingPrediction = predictionRepository.findByUserAndRace(user, race)
                
                if (existingPrediction.isEmpty) {
                    // Create a zero-score prediction to initialize the user for this race
                    // We'll use empty strings for unset predictions
                    val prediction = com.f1chatter.backend.model.Prediction(
                        user = user,
                        race = race,
                        firstPlaceDriverId = "",
                        secondPlaceDriverId = "",
                        thirdPlaceDriverId = "",
                        fastestLapDriverId = "",
                        driverOfTheDayId = "",
                        score = 0
                    )
                    predictionRepository.save(prediction)
                }
            }
        }
        
        logger.info { "Successfully reset scores for season $season" }
    }
    
    /**
     * Clean up old data (older than 5 years).
     * This runs weekly on Sunday at 3 AM.
     */
    @Scheduled(cron = "0 0 3 * * SUN") // At 3 AM on Sunday
    @Transactional
    fun cleanupOldData() {
        val currentSeason = getCurrentSeason()
        val cutoffSeason = currentSeason - 5
        
        logger.info { "Cleaning up data older than season $cutoffSeason" }
        
        // Find old races
        val oldRaces = raceRepository.findBySeasonLessThan(cutoffSeason)
        
        if (oldRaces.isNotEmpty()) {
            logger.info { "Found ${oldRaces.size} old races to clean up" }
            
            oldRaces.forEach { race ->
                // Delete predictions for this race
                val predictionsToDelete = predictionRepository.findByRace(race)
                predictionRepository.deleteAll(predictionsToDelete)
                logger.debug { "Deleted ${predictionsToDelete.size} predictions for race ${race.raceName} (${race.season})" }
                
                // Delete the race
                raceRepository.delete(race)
                logger.debug { "Deleted race ${race.raceName} (${race.season})" }
            }
            
            logger.info { "Successfully cleaned up ${oldRaces.size} old races and their predictions" }
        } else {
            logger.info { "No old data to clean up" }
        }
    }
    
    /**
     * Get statistics about data retention.
     */
    fun getDataRetentionStats(): Map<String, Any> {
        val currentSeason = getCurrentSeason()
        val oldestSeason = raceRepository.findOldestSeason() ?: currentSeason
        val totalRaces = raceRepository.count()
        val totalPredictions = predictionRepository.count()
        
        return mapOf(
            "currentSeason" to currentSeason,
            "oldestSeason" to oldestSeason,
            "seasonsRetained" to (currentSeason - oldestSeason + 1),
            "totalRaces" to totalRaces,
            "totalPredictions" to totalPredictions
        )
    }
}
