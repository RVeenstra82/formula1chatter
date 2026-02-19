package com.f1chatter.backend.service

import com.f1chatter.backend.model.ApiCache
import com.f1chatter.backend.repository.ApiCacheRepository
import com.f1chatter.backend.repository.PredictionRepository
import com.f1chatter.backend.repository.RaceRepository
import com.f1chatter.backend.repository.DriverRepository
import com.f1chatter.backend.repository.UserRepository
import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.databind.ObjectMapper
import mu.KotlinLogging
import org.springframework.cache.annotation.Cacheable
import org.springframework.stereotype.Service
import java.time.LocalDateTime

@Service
class StatsService(
    private val predictionRepository: PredictionRepository,
    private val raceRepository: RaceRepository,
    private val driverRepository: DriverRepository,
    private val userRepository: UserRepository,
    private val apiCacheRepository: ApiCacheRepository,
    private val objectMapper: ObjectMapper
) {
    private val logger = KotlinLogging.logger {}
    private val statsCacheTtlHours = 1L

    private val mapTypeRef = object : TypeReference<Map<String, Any?>>() {}

    /**
     * Check L2 database cache for stats. If found, return it (Caffeine L1 will auto-store via @Cacheable).
     * If not found, return null so the caller computes the result.
     */
    private fun getFromDbCache(cacheKey: String): Map<String, Any?>? {
        return try {
            val cached = apiCacheRepository.findValidCacheByUrl("stats://$cacheKey", LocalDateTime.now())
            if (cached != null) {
                logger.debug { "Stats cache hit (L2 database) for $cacheKey" }
                objectMapper.readValue(cached.responseData, mapTypeRef)
            } else {
                null
            }
        } catch (e: Exception) {
            logger.warn(e) { "Failed to load stats from database cache for $cacheKey" }
            null
        }
    }

    /**
     * Store computed stats in L2 database cache for survival across server restarts.
     */
    private fun storeInDbCache(cacheKey: String, result: Map<String, Any?>) {
        try {
            val json = objectMapper.writeValueAsString(result)
            val now = LocalDateTime.now()
            apiCacheRepository.save(
                ApiCache(
                    url = "stats://$cacheKey",
                    responseData = json,
                    lastFetched = now,
                    expiresAt = now.plusHours(statsCacheTtlHours),
                    responseSize = json.toByteArray().size
                )
            )
            logger.debug { "Stored stats in database cache (L2) for $cacheKey" }
        } catch (e: Exception) {
            logger.warn(e) { "Failed to store stats in database cache for $cacheKey" }
        }
    }

    @Cacheable("stats", key = "'driverPerformance'")
    fun getDriverPerformanceStats(): Map<String, Any> {
        getFromDbCache("driverPerformance")?.let {
            @Suppress("UNCHECKED_CAST")
            return it as Map<String, Any>
        }

        val completedRaces = raceRepository.findCompletedRacesWithPredictions()
        val allDrivers = driverRepository.findAll()

        // Pre-collect all predictions to avoid repeated lazy loading
        val allPredictions = completedRaces.flatMap { it.predictions }

        val driverStats = allDrivers.map { driver ->
            val podiumFinishes = completedRaces.count { race ->
                race.firstPlaceDriverId == driver.id ||
                race.secondPlaceDriverId == driver.id ||
                race.thirdPlaceDriverId == driver.id
            }

            val totalPredictions = allPredictions.count { prediction ->
                prediction.firstPlaceDriverId == driver.id ||
                prediction.secondPlaceDriverId == driver.id ||
                prediction.thirdPlaceDriverId == driver.id
            }

            val successRate = if (totalPredictions > 0) {
                (podiumFinishes.toDouble() / totalPredictions) * 100
            } else 0.0

            mapOf(
                "driverId" to driver.id,
                "driverName" to "${driver.givenName} ${driver.familyName}",
                "driverCode" to driver.code,
                "constructor" to driver.constructor?.name,
                "correctPredictions" to podiumFinishes,
                "totalPredictions" to totalPredictions,
                "successRate" to successRate,
                "podiumFinishes" to podiumFinishes
            )
        }.sortedByDescending { it["successRate"] as Double }

        val result = mapOf(
            "driverStats" to driverStats,
            "totalRaces" to completedRaces.size,
            "totalDrivers" to allDrivers.size
        )
        storeInDbCache("driverPerformance", result)
        return result
    }

    @Cacheable("stats", key = "'predictionAccuracy'")
    fun getPredictionAccuracyStats(): Map<String, Any> {
        getFromDbCache("predictionAccuracy")?.let {
            @Suppress("UNCHECKED_CAST")
            return it as Map<String, Any>
        }

        val completedRaces = raceRepository.findCompletedRacesWithPredictions()

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

        val result = mapOf(
            "accuracyByType" to accuracyByType,
            "totalRaces" to completedRaces.size
        )
        storeInDbCache("predictionAccuracy", result)
        return result
    }

    @Cacheable("stats", key = "'circuitDifficulty'")
    fun getCircuitDifficultyStats(): Map<String, Any> {
        getFromDbCache("circuitDifficulty")?.let {
            @Suppress("UNCHECKED_CAST")
            return it as Map<String, Any>
        }

        val completedRaces = raceRepository.findCompletedRacesWithPredictions()

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

        val result = mapOf(
            "circuitStats" to circuitStats,
            "totalCircuits" to circuitStats.size
        )
        storeInDbCache("circuitDifficulty", result)
        return result
    }

    @Cacheable("stats", key = "'userComparison'")
    fun getUserComparisonStats(): Map<String, Any> {
        getFromDbCache("userComparison")?.let {
            @Suppress("UNCHECKED_CAST")
            return it as Map<String, Any>
        }

        val users = userRepository.findAll()
        val completedRaces = raceRepository.findCompletedRacesWithPredictions()

        // Pre-collect all predictions once
        val allPredictions = completedRaces.flatMap { it.predictions }

        val userStats = users.map { user ->
            val userPredictions = allPredictions.filter { it.user.id == user.id }
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

        val result = mapOf(
            "userStats" to userStats,
            "totalUsers" to users.size
        )
        storeInDbCache("userComparison", result)
        return result
    }

    @Cacheable("stats", key = "'seasonProgress'")
    fun getSeasonProgressStats(): Map<String, Any> {
        getFromDbCache("seasonProgress")?.let {
            @Suppress("UNCHECKED_CAST")
            return it as Map<String, Any>
        }

        val completedRaces = raceRepository.findCompletedRacesWithPredictions().sortedBy { it.round }

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

        val result = mapOf(
            "raceProgress" to raceProgress,
            "totalRaces" to completedRaces.size
        )
        storeInDbCache("seasonProgress", result)
        return result
    }

    @Cacheable("stats", key = "'constructorPerformance'")
    fun getConstructorPerformanceStats(): Map<String, Any> {
        getFromDbCache("constructorPerformance")?.let {
            @Suppress("UNCHECKED_CAST")
            return it as Map<String, Any>
        }

        val completedRaces = raceRepository.findCompletedRacesWithPredictions()
        val allDrivers = driverRepository.findAll()
        val constructors = allDrivers.mapNotNull { it.constructor }.distinctBy { it.id }

        // Pre-build driver-to-constructor map
        val driverIdsByConstructor = allDrivers
            .filter { it.constructor != null }
            .groupBy { it.constructor!!.id }
            .mapValues { (_, drivers) -> drivers.map { it.id }.toSet() }

        val constructorStats = constructors.map { constructor ->
            val driverIds = driverIdsByConstructor[constructor.id] ?: emptySet()

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
                "driverCount" to driverIds.size
            )
        }.sortedByDescending { it["successRate"] as Double }

        val result = mapOf(
            "constructorStats" to constructorStats,
            "totalConstructors" to constructors.size
        )
        storeInDbCache("constructorPerformance", result)
        return result
    }

    @Cacheable("stats", key = "'overview'")
    fun getStatsOverview(): Map<String, Any?> {
        getFromDbCache("overview")?.let { return it }

        val totalUsers = userRepository.count()
        val totalRaces = raceRepository.count()
        val completedRaces = raceRepository.findByRaceCompletedTrue().size
        val totalPredictions = predictionRepository.count()
        val totalDrivers = driverRepository.count()

        val averageScore = if (totalPredictions > 0) {
            predictionRepository.getAverageScore() ?: 0.0
        } else 0.0

        // Load all predictions once and all drivers once for most-predicted calculation
        val allPredictions = predictionRepository.findAll()
        val allDrivers = driverRepository.findAll()

        // Count predictions per driver in-memory (single pass)
        val predictionCountByDriver = mutableMapOf<String, Int>()
        for (prediction in allPredictions) {
            listOf(prediction.firstPlaceDriverId, prediction.secondPlaceDriverId, prediction.thirdPlaceDriverId)
                .filter { it.isNotEmpty() }
                .forEach { driverId ->
                    predictionCountByDriver[driverId] = (predictionCountByDriver[driverId] ?: 0) + 1
                }
        }

        val mostPredictedDriverId = predictionCountByDriver.maxByOrNull { it.value }?.key
        val mostPredictedDriver = mostPredictedDriverId?.let { id -> allDrivers.find { it.id == id } }

        val mostPredictedDriverData = mostPredictedDriver?.let { driver ->
            mapOf(
                "driverId" to driver.id,
                "driverName" to "${driver.givenName} ${driver.familyName}",
                "driverCode" to driver.code
            )
        }

        val result = mapOf(
            "totalUsers" to totalUsers,
            "totalRaces" to totalRaces,
            "completedRaces" to completedRaces,
            "totalPredictions" to totalPredictions,
            "totalDrivers" to totalDrivers,
            "averageScore" to averageScore,
            "mostPredictedDriver" to mostPredictedDriverData
        )
        storeInDbCache("overview", result)
        return result
    }
}
