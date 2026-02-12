package com.f1chatter.backend.service

import com.f1chatter.backend.dto.SprintPredictionDto
import com.f1chatter.backend.model.SprintPrediction
import com.f1chatter.backend.model.SprintRace
import com.f1chatter.backend.model.User
import com.f1chatter.backend.repository.SprintPredictionRepository
import com.f1chatter.backend.repository.SprintRaceRepository
import com.f1chatter.backend.repository.UserRepository
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime
import java.time.ZoneOffset
import java.util.NoSuchElementException

@Service
class SprintPredictionService(
    private val sprintPredictionRepository: SprintPredictionRepository,
    private val sprintRaceRepository: SprintRaceRepository,
    private val userRepository: UserRepository
) {
    @Transactional
    fun saveSprintPrediction(userId: Long, sprintRaceId: String, predictionDto: SprintPredictionDto): SprintPrediction {
        val user = if (userId == 0L) User.TEST_USER else
            userRepository.findByIdOrNull(userId)
                ?: throw NoSuchElementException("User not found")
        
        val sprintRace = sprintRaceRepository.findByIdOrNull(sprintRaceId)
            ?: throw NoSuchElementException("Sprint race not found")
        
        // Check if sprint race starts within 5 minutes
        if (isSprintRaceStartingWithinFiveMinutes(sprintRace)) {
            throw IllegalStateException("Sprint predictions are no longer accepted. Sprint race starts within 5 minutes.")
        }
        
        val existingPrediction = sprintPredictionRepository.findByUserAndSprintRace(user, sprintRace)
        
        return if (existingPrediction != null) {
            val prediction = existingPrediction
            updateSprintPrediction(prediction, predictionDto)
        } else {
            createSprintPrediction(user, sprintRace, predictionDto)
        }
    }
    
    private fun isSprintRaceStartingWithinFiveMinutes(sprintRace: SprintRace): Boolean {
        val now = LocalDateTime.now(ZoneOffset.UTC)
        // Treat sprint race time as UTC time to match frontend behavior
        val sprintRaceDateTime = LocalDateTime.of(sprintRace.date, sprintRace.time)
        val minutesUntilSprintRace = java.time.Duration.between(now, sprintRaceDateTime).toMinutes()
        
        return minutesUntilSprintRace <= 5 && minutesUntilSprintRace > 0
    }
    
    private fun createSprintPrediction(user: User, sprintRace: SprintRace, predictionDto: SprintPredictionDto): SprintPrediction {
        val prediction = SprintPrediction(
            user = user,
            sprintRace = sprintRace,
            firstPlaceDriverId = predictionDto.firstPlaceDriverId.ifEmpty { "" },
            secondPlaceDriverId = predictionDto.secondPlaceDriverId.ifEmpty { "" },
            thirdPlaceDriverId = predictionDto.thirdPlaceDriverId.ifEmpty { "" }
        )
        
        return sprintPredictionRepository.save(prediction)
    }
    
    private fun updateSprintPrediction(prediction: SprintPrediction, predictionDto: SprintPredictionDto): SprintPrediction {
        val updatedPrediction = prediction.copy(
            firstPlaceDriverId = predictionDto.firstPlaceDriverId.ifEmpty { "" },
            secondPlaceDriverId = predictionDto.secondPlaceDriverId.ifEmpty { "" },
            thirdPlaceDriverId = predictionDto.thirdPlaceDriverId.ifEmpty { "" }
        )
        
        return sprintPredictionRepository.save(updatedPrediction)
    }
    
    fun getUserSprintPredictionForRace(userId: Long, sprintRaceId: String): SprintPredictionDto? {
        val user = userRepository.findByIdOrNull(userId)
            ?: throw NoSuchElementException("User not found")
        
        val sprintRace = sprintRaceRepository.findByIdOrNull(sprintRaceId)
            ?: throw NoSuchElementException("Sprint race not found")
        
        val prediction = sprintPredictionRepository.findByUserAndSprintRace(user, sprintRace)
        
        return if (prediction != null) {
            val p = prediction
            SprintPredictionDto(
                firstPlaceDriverId = p.firstPlaceDriverId.takeIf { it.isNotEmpty() } ?: "",
                secondPlaceDriverId = p.secondPlaceDriverId.takeIf { it.isNotEmpty() } ?: "",
                thirdPlaceDriverId = p.thirdPlaceDriverId.takeIf { it.isNotEmpty() } ?: ""
            )
        } else {
            null
        }
    }
    
    @Transactional
    fun calculateSprintScores(sprintRaceId: String) {
        val sprintRace = sprintRaceRepository.findByIdOrNull(sprintRaceId)
            ?: throw NoSuchElementException("Sprint race not found")
        
        if (!sprintRace.sprintCompleted || sprintRace.firstPlaceDriverId == null) {
            throw IllegalStateException("Sprint race results not available yet")
        }
        
        val predictions = sprintPredictionRepository.findBySprintRaceIdOrderByScoreDesc(sprintRaceId)
        
        predictions.forEach { prediction ->
            var score = 0
            
            // First place prediction (5 points)
            if (prediction.firstPlaceDriverId.isNotEmpty() && prediction.firstPlaceDriverId == sprintRace.firstPlaceDriverId) {
                score += 5
            }
            
            // Second place prediction (3 points)
            if (prediction.secondPlaceDriverId.isNotEmpty() && prediction.secondPlaceDriverId == sprintRace.secondPlaceDriverId) {
                score += 3
            }
            
            // Third place prediction (1 point)
            if (prediction.thirdPlaceDriverId.isNotEmpty() && prediction.thirdPlaceDriverId == sprintRace.thirdPlaceDriverId) {
                score += 1
            }
            
            val updatedPrediction = prediction.copy(score = score)
            sprintPredictionRepository.save(updatedPrediction)
        }
    }
    
    fun getSprintRaceResults(sprintRaceId: String): List<SprintPredictionResultDto> {
        val predictions = sprintPredictionRepository.findBySprintRaceIdOrderByScoreDesc(sprintRaceId)
        val sprintRace = sprintRaceRepository.findByIdOrNull(sprintRaceId) ?: throw NoSuchElementException("Sprint race not found")
        
        return predictions.map { prediction ->
            SprintPredictionResultDto(
                userId = prediction.user.id!!,
                userName = prediction.user.name,
                profilePictureUrl = prediction.user.profilePictureUrl,
                score = prediction.score ?: 0,
                prediction = SprintPredictionDto(
                    firstPlaceDriverId = prediction.firstPlaceDriverId.takeIf { it.isNotEmpty() } ?: "",
                    secondPlaceDriverId = prediction.secondPlaceDriverId.takeIf { it.isNotEmpty() } ?: "",
                    thirdPlaceDriverId = prediction.thirdPlaceDriverId.takeIf { it.isNotEmpty() } ?: ""
                )
            )
        }
    }
}

data class SprintPredictionResultDto(
    val userId: Long,
    val userName: String,
    val profilePictureUrl: String?,
    val score: Int,
    val prediction: SprintPredictionDto
)
