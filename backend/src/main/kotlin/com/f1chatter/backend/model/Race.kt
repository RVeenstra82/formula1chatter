package com.f1chatter.backend.model

import jakarta.persistence.CascadeType
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.OneToMany
import jakarta.persistence.Table
import java.time.LocalDate
import java.time.LocalTime

@Entity
@Table(name = "races")
data class Race(
    @Id
    val id: String, // season + round, e.g. "2023-1"
    
    val season: Int,
    val round: Int,
    val raceName: String,
    val circuitId: String,
    val circuitName: String,
    val country: String,
    val locality: String,
    
    val date: LocalDate,
    val time: LocalTime,
    
    // Practice sessions
    var practice1Date: LocalDate? = null,
    var practice1Time: LocalTime? = null,
    var practice2Date: LocalDate? = null,
    var practice2Time: LocalTime? = null,
    var practice3Date: LocalDate? = null,
    var practice3Time: LocalTime? = null,
    
    // Qualifying
    var qualifyingDate: LocalDate? = null,
    var qualifyingTime: LocalTime? = null,
    
    // Sprint weekend information
    var isSprintWeekend: Boolean? = null,
    var sprintDate: LocalDate? = null,
    var sprintTime: LocalTime? = null,
    var sprintQualifyingDate: LocalDate? = null,
    var sprintQualifyingTime: LocalTime? = null,
    
    var firstPlaceDriverId: String? = null,
    var secondPlaceDriverId: String? = null,
    var thirdPlaceDriverId: String? = null,
    var fastestLapDriverId: String? = null,
    var driverOfTheDayId: String? = null,
    
    var raceCompleted: Boolean = false,
    
    @OneToMany(mappedBy = "race", cascade = [CascadeType.ALL], orphanRemoval = true)
    val predictions: MutableList<Prediction> = mutableListOf()
) 