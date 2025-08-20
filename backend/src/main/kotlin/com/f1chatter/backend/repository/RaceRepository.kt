package com.f1chatter.backend.repository

import com.f1chatter.backend.model.Race
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.time.LocalDate

@Repository
interface RaceRepository : JpaRepository<Race, String> {
    fun findBySeason(season: Int): List<Race>
    
    fun findBySeasonAndRound(season: Int, round: Int): Race?
    
    @Query("SELECT r FROM Race r WHERE r.date >= :today ORDER BY r.date ASC")
    fun findUpcomingRaces(today: LocalDate): List<Race>
    
    @Query("SELECT r FROM Race r WHERE r.date >= :today ORDER BY r.date ASC LIMIT 1")
    fun findNextRace(today: LocalDate): Race?
    
    @Query("SELECT r FROM Race r WHERE r.season = :season AND r.round < :round ORDER BY r.round ASC")
    fun findBySeasonAndRoundLessThan(season: Int, round: Int): List<Race>
    
    @Query("SELECT r FROM Race r WHERE r.season < :season")
    fun findBySeasonLessThan(season: Int): List<Race>
    
    @Query("SELECT MIN(r.season) FROM Race r")
    fun findOldestSeason(): Int?
} 