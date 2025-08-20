package com.f1chatter.backend.service

import com.f1chatter.backend.repository.PredictionRepository
import com.f1chatter.backend.repository.RaceRepository
import com.f1chatter.backend.repository.DriverRepository
import com.f1chatter.backend.repository.UserRepository
import com.f1chatter.backend.repository.UserScoreProjection
import org.springframework.stereotype.Service
import java.time.LocalDate

@Service
class StatsService(
    private val predictionRepository: PredictionRepository,
    private val raceRepository: RaceRepository,
    private val driverRepository: DriverRepository,
    private val userRepository: UserRepository
) {
    
    fun getDriverPerformanceStats(): Map<String, Any> {
        val completedRaces = raceRepository.findByRaceCompletedTrue()
        val allDrivers = driverRepository.findAll()
        
        val driverStats = allDrivers.map { driver ->
            val correctPredictions = completedRaces.count { race ->
                race.firstPlaceDriverId == driver.id || 
                race.secondPlaceDriverId == driver.id || 
                race.thirdPlaceDriverId == driver.id
            }
            
            val totalPredictions = completedRaces.sumOf { race ->
                race.predictions.count { prediction ->
                    prediction.firstPlaceDriverId == driver.id || 
                    prediction.secondPlaceDriverId == driver.id || 
                    prediction.thirdPlaceDriverId == driver.id
                }
            }
            
            val successRate = if (totalPredictions > 0) {
                (correctPredictions.toDouble() / totalPredictions) * 100
            } else 0.0
            
            mapOf(
                "driverId" to driver.id,
                "driverName" to "${driver.givenName} ${driver.familyName}",
                "driverCode" to driver.code,
                "constructor" to driver.constructor?.name,
                "correctPredictions" to correctPredictions,
                "totalPredictions" to totalPredictions,
                "successRate" to successRate,
                "podiumFinishes" to completedRaces.count { race ->
                    race.firstPlaceDriverId == driver.id || 
                    race.secondPlaceDriverId == driver.id || 
                    race.thirdPlaceDriverId == driver.id
                }
            )
        }.sortedByDescending { it["successRate"] as Double }
        
        return mapOf(
            "driverStats" to driverStats,
            "totalRaces" to completedRaces.size,
            "totalDrivers" to allDrivers.size
        )
    }
    
    fun getPredictionAccuracyStats(): Map<String, Any> {
        val completedRaces = raceRepository.findByRaceCompletedTrue()
        
        val predictionTypes = listOf("firstPlace", "secondPlace", "thirdPlace", "fastestLap", "driverOfTheDay")
        val accuracyByType = predictionTypes.associateWith { predictionType ->
            val totalPredictions = completedRaces.sumOf { race ->
                race.predictions.size
            }
            
            val correctPredictions = completedRaces.sumOf { race ->
                race.predictions.count { prediction ->
                    when (predictionType) {
                        "firstPlace" -> prediction.firstPlaceDriverId == race.firstPlaceDriverId
                        "secondPlace" -> prediction.secondPlaceDriverId == race.secondPlaceDriverId
                        "thirdPlace" -> prediction.thirdPlaceDriverId == race.thirdPlaceDriverId
                        "fastestLap" -> prediction.fastestLapDriverId == race.fastestLapDriverId
                        "driverOfTheDay" -> prediction.driverOfTheDayId == race.driverOfTheDayId
                        else -> false
                    }
                }
            }
            
            val accuracy = if (totalPredictions > 0) {
                (correctPredictions.toDouble() / totalPredictions) * 100
            } else 0.0
            
            mapOf(
                "totalPredictions" to totalPredictions,
                "correctPredictions" to correctPredictions,
                "accuracy" to accuracy
            )
        }
        
        return mapOf(
            "accuracyByType" to accuracyByType,
            "totalRaces" to completedRaces.size
        )
    }
    
    fun getCircuitDifficultyStats(): Map<String, Any> {
        val completedRaces = raceRepository.findByRaceCompletedTrue()
        
        val circuitStats = completedRaces.groupBy { it.circuitName }.mapValues { (circuitName, races) ->
            val totalPredictions = races.sumOf { it.predictions.size }
            val correctPredictions = races.sumOf { race ->
                race.predictions.count { prediction ->
                    (prediction.firstPlaceDriverId == race.firstPlaceDriverId) ||
                    (prediction.secondPlaceDriverId == race.secondPlaceDriverId) ||
                    (prediction.thirdPlaceDriverId == race.thirdPlaceDriverId)
                }
            }
            
            val accuracy = if (totalPredictions > 0) {
                (correctPredictions.toDouble() / totalPredictions) * 100
            } else 0.0
            
            mapOf(
                "circuitName" to circuitName,
                "totalPredictions" to totalPredictions,
                "correctPredictions" to correctPredictions,
                "accuracy" to accuracy,
                "difficulty" to (100 - accuracy), // Higher difficulty = lower accuracy
                "raceCount" to races.size,
                "country" to races.first().country
            )
        }.values.sortedBy { it["difficulty"] as Double }
        
        return mapOf(
            "circuitStats" to circuitStats,
            "totalCircuits" to circuitStats.size
        )
    }
    
    fun getUserComparisonStats(): Map<String, Any> {
        val users = userRepository.findAll()
        val completedRaces = raceRepository.findByRaceCompletedTrue()
        
        val userStats = users.map { user ->
            val userPredictions = completedRaces.flatMap { it.predictions }.filter { it.user.id == user.id }
            val totalPredictions = userPredictions.size
            
            val correctPredictions = userPredictions.count { prediction ->
                val race = prediction.race
                (prediction.firstPlaceDriverId == race.firstPlaceDriverId) ||
                (prediction.secondPlaceDriverId == race.secondPlaceDriverId) ||
                (prediction.thirdPlaceDriverId == race.thirdPlaceDriverId) ||
                (prediction.fastestLapDriverId == race.fastestLapDriverId) ||
                (prediction.driverOfTheDayId == race.driverOfTheDayId)
            }
            
            val accuracy = if (totalPredictions > 0) {
                (correctPredictions.toDouble() / totalPredictions) * 100
            } else 0.0
            
            val totalScore = userPredictions.sumOf { it.score ?: 0 }
            
            mapOf(
                "userId" to user.id,
                "userName" to user.name,
                "profilePictureUrl" to user.profilePictureUrl,
                "totalPredictions" to totalPredictions,
                "correctPredictions" to correctPredictions,
                "accuracy" to accuracy,
                "totalScore" to totalScore,
                "averageScore" to if (totalPredictions > 0) totalScore.toDouble() / totalPredictions else 0.0
            )
        }.sortedByDescending { it["totalScore"] as Int }
        
        return mapOf(
            "userStats" to userStats,
            "totalUsers" to users.size
        )
    }
    
    fun getSeasonProgressStats(): Map<String, Any> {
        val completedRaces = raceRepository.findByRaceCompletedTrue().sortedBy { it.round }
        
        val raceProgress = completedRaces.map { race ->
            val totalPredictions = race.predictions.size
            val correctPredictions = race.predictions.count { prediction ->
                (prediction.firstPlaceDriverId == race.firstPlaceDriverId) ||
                (prediction.secondPlaceDriverId == race.secondPlaceDriverId) ||
                (prediction.thirdPlaceDriverId == race.thirdPlaceDriverId) ||
                (prediction.fastestLapDriverId == race.fastestLapDriverId) ||
                (prediction.driverOfTheDayId == race.driverOfTheDayId)
            }
            
            val accuracy = if (totalPredictions > 0) {
                (correctPredictions.toDouble() / totalPredictions) * 100
            } else 0.0
            
            val averageScore = if (totalPredictions > 0) {
                race.predictions.sumOf { it.score ?: 0 }.toDouble() / totalPredictions
            } else 0.0
            
            mapOf(
                "raceId" to race.id,
                "raceName" to race.raceName,
                "round" to race.round,
                "circuitName" to race.circuitName,
                "totalPredictions" to totalPredictions,
                "correctPredictions" to correctPredictions,
                "accuracy" to accuracy,
                "averageScore" to averageScore,
                "date" to race.date.toString()
            )
        }
        
        return mapOf(
            "raceProgress" to raceProgress,
            "totalRaces" to completedRaces.size
        )
    }
    
    fun getConstructorPerformanceStats(): Map<String, Any> {
        val completedRaces = raceRepository.findByRaceCompletedTrue()
        val constructors = driverRepository.findAll().mapNotNull { it.constructor }.distinctBy { it.id }
        
        val constructorStats = constructors.map { constructor ->
            val drivers = driverRepository.findByConstructorId(constructor.id)
            val driverIds = drivers.map { it.id }
            
            val correctPredictions = completedRaces.sumOf { race ->
                race.predictions.count { prediction ->
                    val predictedDrivers = listOf(
                        prediction.firstPlaceDriverId,
                        prediction.secondPlaceDriverId,
                        prediction.thirdPlaceDriverId
                    )
                    val actualDrivers = listOfNotNull(
                        race.firstPlaceDriverId,
                        race.secondPlaceDriverId,
                        race.thirdPlaceDriverId
                    )
                    
                    predictedDrivers.any { it in driverIds } && 
                    actualDrivers.any { it in driverIds }
                }
            }
            
            val totalPredictions = completedRaces.sumOf { race ->
                race.predictions.count { prediction ->
                    val predictedDrivers = listOf(
                        prediction.firstPlaceDriverId,
                        prediction.secondPlaceDriverId,
                        prediction.thirdPlaceDriverId
                    )
                    predictedDrivers.any { it in driverIds }
                }
            }
            
            val successRate = if (totalPredictions > 0) {
                (correctPredictions.toDouble() / totalPredictions) * 100
            } else 0.0
            
            mapOf(
                "constructorId" to constructor.id,
                "constructorName" to constructor.name,
                "correctPredictions" to correctPredictions,
                "totalPredictions" to totalPredictions,
                "successRate" to successRate,
                "driverCount" to drivers.size
            )
        }.sortedByDescending { it["successRate"] as Double }
        
        return mapOf(
            "constructorStats" to constructorStats,
            "totalConstructors" to constructors.size
        )
    }
    
    fun getStatsOverview(): Map<String, Any?> {
        val totalUsers = userRepository.count()
        val totalRaces = raceRepository.count()
        val completedRaces = raceRepository.findByRaceCompletedTrue().size
        val totalPredictions = predictionRepository.count()
        val totalDrivers = driverRepository.count()
        
        val averageScore = if (totalPredictions > 0) {
            predictionRepository.findAll().mapNotNull { it.score }.average()
        } else 0.0
        
        val mostPredictedDriver = driverRepository.findAll().maxByOrNull { driver ->
            predictionRepository.findAll().count { prediction ->
                prediction.firstPlaceDriverId == driver.id ||
                prediction.secondPlaceDriverId == driver.id ||
                prediction.thirdPlaceDriverId == driver.id
            }
        }
        
        val mostPredictedDriverData = mostPredictedDriver?.let { driver ->
            mapOf(
                "driverId" to driver.id,
                "driverName" to "${driver.givenName} ${driver.familyName}",
                "driverCode" to driver.code
            )
        }
        
        return mapOf(
            "totalUsers" to totalUsers,
            "totalRaces" to totalRaces,
            "completedRaces" to completedRaces,
            "totalPredictions" to totalPredictions,
            "totalDrivers" to totalDrivers,
            "averageScore" to averageScore,
            "mostPredictedDriver" to mostPredictedDriverData
        )
    }
}
