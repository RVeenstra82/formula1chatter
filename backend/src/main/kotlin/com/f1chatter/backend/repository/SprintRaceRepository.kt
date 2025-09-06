package com.f1chatter.backend.repository

import com.f1chatter.backend.model.SprintRace
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.time.LocalDate

@Repository
interface SprintRaceRepository : JpaRepository<SprintRace, String> {
    fun findBySeason(season: Int): List<SprintRace>
    
    @Query("SELECT sr FROM SprintRace sr WHERE sr.season = :season AND sr.round = :round")
    fun findBySeasonAndRound(season: Int, round: Int): SprintRace?
    
    @Query("SELECT sr FROM SprintRace sr WHERE sr.date >= :today ORDER BY sr.date ASC")
    fun findUpcomingSprintRaces(today: LocalDate): List<SprintRace>
}
