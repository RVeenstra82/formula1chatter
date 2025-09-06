package com.f1chatter.backend.model

import jakarta.persistence.CascadeType
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.OneToMany
import jakarta.persistence.Table
import java.time.LocalDate
import java.time.LocalTime

@Entity
@Table(name = "sprint_races")
data class SprintRace(
    @Id
    val id: String, // season + round + "sprint", e.g. "2023-1-sprint"
    
    val season: Int,
    val round: Int,
    val raceName: String,
    val circuitId: String,
    val circuitName: String,
    val country: String,
    val locality: String,
    
    val date: LocalDate,
    val time: LocalTime,
    
    // Sprint qualifying
    var sprintQualifyingDate: LocalDate? = null,
    var sprintQualifyingTime: LocalTime? = null,
    
    // Sprint race results
    var firstPlaceDriverId: String? = null,
    var secondPlaceDriverId: String? = null,
    var thirdPlaceDriverId: String? = null,
    
    var sprintCompleted: Boolean = false,
    
    @OneToMany(mappedBy = "sprintRace", cascade = [CascadeType.ALL], orphanRemoval = true)
    val sprintPredictions: MutableList<SprintPrediction> = mutableListOf()
)
