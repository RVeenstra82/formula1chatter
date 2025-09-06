package com.f1chatter.backend.dto

import java.time.LocalDate
import java.time.LocalTime

data class RaceDto(
    val id: String,
    val season: Int,
    val round: Int,
    val raceName: String,
    val circuitName: String,
    val country: String,
    val locality: String,
    val date: LocalDate,
    val time: LocalTime,
    
    // Practice sessions
    val practice1Date: LocalDate?,
    val practice1Time: LocalTime?,
    val practice2Date: LocalDate?,
    val practice2Time: LocalTime?,
    val practice3Date: LocalDate?,
    val practice3Time: LocalTime?,
    
    // Qualifying
    val qualifyingDate: LocalDate?,
    val qualifyingTime: LocalTime?,
    
    // Sprint weekend information
    val isSprintWeekend: Boolean?,
    val sprintDate: LocalDate?,
    val sprintTime: LocalTime?,
    val sprintQualifyingDate: LocalDate?,
    val sprintQualifyingTime: LocalTime?,
    
    val firstPlaceDriverId: String?,
    val secondPlaceDriverId: String?,
    val thirdPlaceDriverId: String?,
    val fastestLapDriverId: String?,
    val driverOfTheDayId: String?,
    val completed: Boolean
) 