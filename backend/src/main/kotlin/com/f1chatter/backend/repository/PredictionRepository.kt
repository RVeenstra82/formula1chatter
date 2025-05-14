package com.f1chatter.backend.repository

import com.f1chatter.backend.model.Prediction
import com.f1chatter.backend.model.Race
import com.f1chatter.backend.model.User
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.util.Optional

@Repository
interface PredictionRepository : JpaRepository<Prediction, Long> {
    fun findByUserAndRace(user: User, race: Race): Optional<Prediction>
    
    fun findByRaceOrderByScoreDesc(race: Race): List<Prediction>
    
    @Query("SELECT p FROM Prediction p WHERE p.race.id = :raceId ORDER BY p.score DESC")
    fun findByRaceIdOrderByScoreDesc(raceId: String): List<Prediction>
    
    @Query("SELECT SUM(p.score) FROM Prediction p WHERE p.user.id = :userId AND p.race.season = :season")
    fun getTotalScoreByUserIdAndSeason(userId: Long, season: Int): Int
    
    @Query("SELECT p.user.id as userId, SUM(p.score) as totalScore FROM Prediction p WHERE p.race.season = :season GROUP BY p.user.id ORDER BY totalScore DESC")
    fun getSeasonLeaderboard(season: Int): List<UserScoreProjection>
} 