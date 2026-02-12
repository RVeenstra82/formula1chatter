
package com.f1chatter.backend.service

import com.f1chatter.backend.dto.LeaderboardEntryDto
import com.f1chatter.backend.dto.PredictionDto
import com.f1chatter.backend.dto.PredictionResultDto
import com.f1chatter.backend.model.Prediction
import com.f1chatter.backend.model.Race
import com.f1chatter.backend.model.User
import com.f1chatter.backend.repository.PredictionRepository
import com.f1chatter.backend.repository.RaceRepository
import com.f1chatter.backend.repository.UserRepository
import com.f1chatter.backend.util.F1SeasonUtils
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime
import java.time.LocalTime
import java.time.ZoneOffset
import java.util.NoSuchElementException

@Service
class PredictionService(
    private val predictionRepository: PredictionRepository,
    private val raceRepository: RaceRepository,
    private val userRepository: UserRepository,
    private val driverService: DriverService
) {
    @Transactional
    fun savePrediction(userId: Long, raceId: String, predictionDto: PredictionDto): Prediction {
        val user = if (userId == 0L) User.TEST_USER else
            userRepository.findByIdOrNull(userId)
                ?: throw NoSuchElementException("User not found")
        
        val race = raceRepository.findByIdOrNull(raceId)
            ?: throw NoSuchElementException("Race not found")
        
        // Check if predictions are still allowed
        if (race.raceCompleted) {
            throw IllegalStateException("Predictions are no longer accepted. Race has been completed.")
        }
        if (isPredictionsClosed(race)) {
            throw IllegalStateException("Predictions are no longer accepted. Race starts within 5 minutes or has already started.")
        }
        
        val existingPrediction = predictionRepository.findByUserAndRace(user, race)
        
        return if (existingPrediction != null) {
            val prediction = existingPrediction
            updatePrediction(prediction, predictionDto)
        } else {
            createPrediction(user, race, predictionDto)
        }
    }
    
    private fun isPredictionsClosed(race: Race): Boolean {
        val now = LocalDateTime.now(ZoneOffset.UTC)
        // Treat race time as UTC time to match frontend behavior
        val raceDateTime = LocalDateTime.of(race.date, race.time)
        // toMinutes() truncates toward zero, so the effective cutoff is at the 5:00 mark
        val minutesUntilRace = java.time.Duration.between(now, raceDateTime).toMinutes()

        // Block predictions if race starts within 5 minutes or has already started
        return minutesUntilRace < 5
    }
    
    private fun createPrediction(user: User, race: Race, predictionDto: PredictionDto): Prediction {
        val prediction = Prediction(
            user = user,
            race = race,
            firstPlaceDriverId = predictionDto.firstPlaceDriverId.ifEmpty { "" },
            secondPlaceDriverId = predictionDto.secondPlaceDriverId.ifEmpty { "" },
            thirdPlaceDriverId = predictionDto.thirdPlaceDriverId.ifEmpty { "" },
            fastestLapDriverId = predictionDto.fastestLapDriverId.ifEmpty { "" },
            driverOfTheDayId = predictionDto.driverOfTheDayId.ifEmpty { "" }
        )
        
        return predictionRepository.save(prediction)
    }
    
    private fun updatePrediction(prediction: Prediction, predictionDto: PredictionDto): Prediction {
        val updatedPrediction = prediction.copy(
            firstPlaceDriverId = predictionDto.firstPlaceDriverId.ifEmpty { "" },
            secondPlaceDriverId = predictionDto.secondPlaceDriverId.ifEmpty { "" },
            thirdPlaceDriverId = predictionDto.thirdPlaceDriverId.ifEmpty { "" },
            fastestLapDriverId = predictionDto.fastestLapDriverId.ifEmpty { "" },
            driverOfTheDayId = predictionDto.driverOfTheDayId.ifEmpty { "" }
        )
        
        return predictionRepository.save(updatedPrediction)
    }
    
    fun getUserPredictionForRace(userId: Long, raceId: String): PredictionDto? {
        val user = if (userId == 0L) User.TEST_USER else
            userRepository.findByIdOrNull(userId)
                ?: throw NoSuchElementException("User not found")
        
        val race = raceRepository.findByIdOrNull(raceId)
            ?: throw NoSuchElementException("Race not found")
        
        val prediction = predictionRepository.findByUserAndRace(user, race)
        
        return if (prediction != null) {
            val p = prediction
            PredictionDto(
                firstPlaceDriverId = p.firstPlaceDriverId.takeIf { it.isNotEmpty() } ?: "",
                secondPlaceDriverId = p.secondPlaceDriverId.takeIf { it.isNotEmpty() } ?: "",
                thirdPlaceDriverId = p.thirdPlaceDriverId.takeIf { it.isNotEmpty() } ?: "",
                fastestLapDriverId = p.fastestLapDriverId.takeIf { it.isNotEmpty() } ?: "",
                driverOfTheDayId = p.driverOfTheDayId.takeIf { it.isNotEmpty() } ?: ""
            )
        } else {
            null
        }
    }
    
    @Transactional
    fun calculateScores(raceId: String) {
        val race = raceRepository.findByIdOrNull(raceId)
            ?: throw NoSuchElementException("Race not found")
        
        if (!race.raceCompleted || race.firstPlaceDriverId == null) {
            throw IllegalStateException("Race results not available yet")
        }
        
        val predictions = predictionRepository.findByRaceIdOrderByScoreDesc(raceId)
        
        predictions.forEach { prediction ->
            var score = 0
            
            // First place prediction (5 points)
            if (prediction.firstPlaceDriverId.isNotEmpty() && prediction.firstPlaceDriverId == race.firstPlaceDriverId) {
                score += 5
            }
            
            // Second place prediction (3 points)
            if (prediction.secondPlaceDriverId.isNotEmpty() && prediction.secondPlaceDriverId == race.secondPlaceDriverId) {
                score += 3
            }
            
            // Third place prediction (1 point)
            if (prediction.thirdPlaceDriverId.isNotEmpty() && prediction.thirdPlaceDriverId == race.thirdPlaceDriverId) {
                score += 1
            }
            
            // Fastest lap prediction (1 point)
            if (prediction.fastestLapDriverId.isNotEmpty() && prediction.fastestLapDriverId == race.fastestLapDriverId) {
                score += 1
            }
            
            // Driver of the day prediction (1 point)
            if (prediction.driverOfTheDayId.isNotEmpty() && prediction.driverOfTheDayId == race.driverOfTheDayId) {
                score += 1
            }
            
            val updatedPrediction = prediction.copy(score = score)
            predictionRepository.save(updatedPrediction)
        }
    }
    
    fun getRaceResults(raceId: String): List<PredictionResultDto> {
        val predictions = predictionRepository.findByRaceIdOrderByScoreDesc(raceId)
        val race = raceRepository.findByIdOrNull(raceId) ?: throw NoSuchElementException("Race not found")
        
        // Get current season leaderboard to calculate position changes
        val currentSeasonLeaderboard = getSeasonLeaderboard(race.season)
        val currentPositions = currentSeasonLeaderboard.mapIndexed { index, entry -> 
            entry.userId to (index + 1) 
        }.toMap()
        
        // Get previous season leaderboard (before this race)
        val previousSeasonLeaderboard = getSeasonLeaderboardBeforeRace(raceId, race.season)
        val previousPositions = previousSeasonLeaderboard.mapIndexed { index, entry -> 
            entry.userId to (index + 1) 
        }.toMap()
        
        return predictions.map { prediction ->
            val currentPosition = currentPositions[prediction.user.id]
            val previousPosition = previousPositions[prediction.user.id]
            
            PredictionResultDto(
                userId = prediction.user.id!!,
                userName = prediction.user.name,
                profilePictureUrl = prediction.user.profilePictureUrl,
                score = prediction.score ?: 0,
                prediction = PredictionDto(
                    firstPlaceDriverId = prediction.firstPlaceDriverId.takeIf { it.isNotEmpty() } ?: "",
                    secondPlaceDriverId = prediction.secondPlaceDriverId.takeIf { it.isNotEmpty() } ?: "",
                    thirdPlaceDriverId = prediction.thirdPlaceDriverId.takeIf { it.isNotEmpty() } ?: "",
                    fastestLapDriverId = prediction.fastestLapDriverId.takeIf { it.isNotEmpty() } ?: "",
                    driverOfTheDayId = prediction.driverOfTheDayId.takeIf { it.isNotEmpty() } ?: ""
                ),
                seasonPosition = currentPosition,
                previousSeasonPosition = previousPosition
            )
        }
    }
    
    fun getSeasonLeaderboard(season: Int = F1SeasonUtils.getCurrentSeason()): List<LeaderboardEntryDto> {
        val leaderboard = predictionRepository.getSeasonLeaderboard(season)
        val userIds = leaderboard.map { it.userId }
        val usersById = userRepository.findAllById(userIds).associateBy { it.id }

        return leaderboard.map { entry ->
            val user = usersById[entry.userId] ?: throw NoSuchElementException("User not found")
            LeaderboardEntryDto(
                userId = user.id!!,
                userName = user.name,
                profilePictureUrl = user.profilePictureUrl,
                totalScore = entry.totalScore
            )
        }
    }
    
    fun getUserSeasonScore(userId: Long, season: Int = F1SeasonUtils.getCurrentSeason()): Int {
        return predictionRepository.getTotalScoreByUserIdAndSeason(userId, season)
    }
    
    fun getSeasonLeaderboardBeforeRace(raceId: String, season: Int): List<LeaderboardEntryDto> {
        val race = raceRepository.findByIdOrNull(raceId) ?: throw NoSuchElementException("Race not found")

        // Calculate leaderboard based on races before this race
        val leaderboard = predictionRepository.getSeasonLeaderboardBeforeRace(season, race.round)
        val userIds = leaderboard.map { it.userId }
        val usersById = userRepository.findAllById(userIds).associateBy { it.id }

        return leaderboard.map { entry ->
            val user = usersById[entry.userId] ?: throw NoSuchElementException("User not found")
            LeaderboardEntryDto(
                userId = user.id!!,
                userName = user.name,
                profilePictureUrl = user.profilePictureUrl,
                totalScore = entry.totalScore
            )
        }
    }
} 