package com.f1chatter.backend.dto

data class PredictionDto(
    val firstPlaceDriverId: String,
    val secondPlaceDriverId: String,
    val thirdPlaceDriverId: String,
    val fastestLapDriverId: String,
    val driverOfTheDayId: String
) 