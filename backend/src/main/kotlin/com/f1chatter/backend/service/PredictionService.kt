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
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
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
        val user = userRepository.findById(userId)
            .orElseThrow { NoSuchElementException("User not found") }
        
        val race = raceRepository.findById(raceId)
            .orElseThrow { NoSuchElementException("Race not found") }
        
        val existingPrediction = predictionRepository.findByUserAndRace(user, race)
        
        return if (existingPrediction.isPresent) {
            val prediction = existingPrediction.get()
            updatePrediction(prediction, predictionDto)
        } else {
            createPrediction(user, race, predictionDto)
        }
    }
    
    private fun createPrediction(user: User, race: Race, predictionDto: PredictionDto): Prediction {
        val prediction = Prediction(
            user = user,
            race = race,
            firstPlaceDriverId = predictionDto.firstPlaceDriverId,
            secondPlaceDriverId = predictionDto.secondPlaceDriverId,
            thirdPlaceDriverId = predictionDto.thirdPlaceDriverId,
            fastestLapDriverId = predictionDto.fastestLapDriverId,
            driverOfTheDayId = predictionDto.driverOfTheDayId
        )
        
        return predictionRepository.save(prediction)
    }
    
    private fun updatePrediction(prediction: Prediction, predictionDto: PredictionDto): Prediction {
        val updatedPrediction = prediction.copy(
            firstPlaceDriverId = predictionDto.firstPlaceDriverId,
            secondPlaceDriverId = predictionDto.secondPlaceDriverId,
            thirdPlaceDriverId = predictionDto.thirdPlaceDriverId,
            fastestLapDriverId = predictionDto.fastestLapDriverId,
            driverOfTheDayId = predictionDto.driverOfTheDayId
        )
        
        return predictionRepository.save(updatedPrediction)
    }
    
    fun getUserPredictionForRace(userId: Long, raceId: String): PredictionDto? {
        val user = userRepository.findById(userId)
            .orElseThrow { NoSuchElementException("User not found") }
        
        val race = raceRepository.findById(raceId)
            .orElseThrow { NoSuchElementException("Race not found") }
        
        val prediction = predictionRepository.findByUserAndRace(user, race)
        
        return if (prediction.isPresent) {
            val p = prediction.get()
            PredictionDto(
                firstPlaceDriverId = p.firstPlaceDriverId,
                secondPlaceDriverId = p.secondPlaceDriverId,
                thirdPlaceDriverId = p.thirdPlaceDriverId,
                fastestLapDriverId = p.fastestLapDriverId,
                driverOfTheDayId = p.driverOfTheDayId
            )
        } else {
            null
        }
    }
    
    @Transactional
    fun calculateScores(raceId: String) {
        val race = raceRepository.findById(raceId)
            .orElseThrow { NoSuchElementException("Race not found") }
        
        if (!race.raceCompleted || race.firstPlaceDriverId == null) {
            throw IllegalStateException("Race results not available yet")
        }
        
        val predictions = predictionRepository.findByRaceIdOrderByScoreDesc(raceId)
        
        predictions.forEach { prediction ->
            var score = 0
            
            // First place prediction (5 points)
            if (prediction.firstPlaceDriverId == race.firstPlaceDriverId) {
                score += 5
            }
            
            // Second place prediction (3 points)
            if (prediction.secondPlaceDriverId == race.secondPlaceDriverId) {
                score += 3
            }
            
            // Third place prediction (1 point)
            if (prediction.thirdPlaceDriverId == race.thirdPlaceDriverId) {
                score += 1
            }
            
            // Fastest lap prediction (1 point)
            if (prediction.fastestLapDriverId == race.fastestLapDriverId) {
                score += 1
            }
            
            // Driver of the day prediction (1 point)
            if (prediction.driverOfTheDayId == race.driverOfTheDayId) {
                score += 1
            }
            
            val updatedPrediction = prediction.copy(score = score)
            predictionRepository.save(updatedPrediction)
        }
    }
    
    fun getRaceResults(raceId: String): List<PredictionResultDto> {
        val predictions = predictionRepository.findByRaceIdOrderByScoreDesc(raceId)
        val race = raceRepository.findById(raceId).orElseThrow()
        
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
                    firstPlaceDriverId = prediction.firstPlaceDriverId,
                    secondPlaceDriverId = prediction.secondPlaceDriverId,
                    thirdPlaceDriverId = prediction.thirdPlaceDriverId,
                    fastestLapDriverId = prediction.fastestLapDriverId,
                    driverOfTheDayId = prediction.driverOfTheDayId
                ),
                seasonPosition = currentPosition,
                previousSeasonPosition = previousPosition
            )
        }
    }
    
    fun getSeasonLeaderboard(season: Int = LocalDate.now().year): List<LeaderboardEntryDto> {
        val leaderboard = predictionRepository.getSeasonLeaderboard(season)
        
        return leaderboard.map { entry ->
            val user = userRepository.findById(entry.userId).orElseThrow()
            LeaderboardEntryDto(
                userId = user.id!!,
                userName = user.name,
                profilePictureUrl = user.profilePictureUrl,
                totalScore = entry.totalScore
            )
        }
    }
    
    fun getUserSeasonScore(userId: Long, season: Int = LocalDate.now().year): Int {
        return predictionRepository.getTotalScoreByUserIdAndSeason(userId, season)
    }
    
    fun getSeasonLeaderboardBeforeRace(raceId: String, season: Int): List<LeaderboardEntryDto> {
        val race = raceRepository.findById(raceId).orElseThrow()
        
        // Get all races in the season before this race
        val previousRaces = raceRepository.findBySeasonAndRoundLessThan(season, race.round)
        
        // Calculate leaderboard based on races before this race
        val leaderboard = predictionRepository.getSeasonLeaderboardBeforeRace(season, race.round)
        
        return leaderboard.map { entry ->
            val user = userRepository.findById(entry.userId).orElseThrow()
            LeaderboardEntryDto(
                userId = user.id!!,
                userName = user.name,
                profilePictureUrl = user.profilePictureUrl,
                totalScore = entry.totalScore
            )
        }
    }
} 