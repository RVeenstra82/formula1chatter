package com.f1chatter.backend.dto

data class PredictionResultDto(
    val userId: Long,
    val userName: String,
    val profilePictureUrl: String?,
    val score: Int,
    val prediction: PredictionDto,
    val seasonPosition: Int? = null,
    val previousSeasonPosition: Int? = null
) 