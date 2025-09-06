package com.f1chatter.backend.repository

import com.f1chatter.backend.model.SprintPrediction
import com.f1chatter.backend.model.SprintRace
import com.f1chatter.backend.model.User
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository

@Repository
interface SprintPredictionRepository : JpaRepository<SprintPrediction, Long> {
    fun findByUserAndSprintRace(user: User, sprintRace: SprintRace): SprintPrediction?
    
    fun findBySprintRaceOrderByScoreDesc(sprintRace: SprintRace): List<SprintPrediction>
    
    @Query("SELECT sp FROM SprintPrediction sp WHERE sp.sprintRace.id = :sprintRaceId ORDER BY sp.score DESC")
    fun findBySprintRaceIdOrderByScoreDesc(sprintRaceId: String): List<SprintPrediction>
    
    @Query("SELECT SUM(sp.score) FROM SprintPrediction sp WHERE sp.user.id = :userId AND sp.sprintRace.season = :season")
    fun getTotalSprintScoreByUserIdAndSeason(userId: Long, season: Int): Int?
    
    @Query("SELECT sp FROM SprintPrediction sp WHERE sp.sprintRace.season = :season")
    fun findBySeason(season: Int): List<SprintPrediction>
}
