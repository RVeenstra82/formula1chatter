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
    val firstPlaceDriverId: String?,
    val secondPlaceDriverId: String?,
    val thirdPlaceDriverId: String?,
    val fastestLapDriverId: String?,
    val driverOfTheDayId: String?,
    val completed: Boolean
) 