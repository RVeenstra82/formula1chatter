package com.f1chatter.backend.dto

import java.time.LocalDate
import java.time.LocalTime

data class SprintRaceDto(
    val id: String,
    val season: Int,
    val round: Int,
    val raceName: String,
    val circuitName: String,
    val country: String,
    val locality: String,
    val date: LocalDate,
    val time: LocalTime,
    
    // Sprint qualifying
    val sprintQualifyingDate: LocalDate?,
    val sprintQualifyingTime: LocalTime?,
    
    // Sprint race results
    val firstPlaceDriverId: String?,
    val secondPlaceDriverId: String?,
    val thirdPlaceDriverId: String?,
    val completed: Boolean
)
