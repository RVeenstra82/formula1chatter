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
    
    var firstPlaceDriverId: String? = null,
    var secondPlaceDriverId: String? = null,
    var thirdPlaceDriverId: String? = null,
    var fastestLapDriverId: String? = null,
    var driverOfTheDayId: String? = null,
    
    var raceCompleted: Boolean = false,
    
    @OneToMany(mappedBy = "race", cascade = [CascadeType.ALL], orphanRemoval = true)
    val predictions: MutableList<Prediction> = mutableListOf()
) 