package com.f1chatter.backend.dto

data class LeaderboardEntryDto(
    val userId: Long,
    val userName: String,
    val profilePictureUrl: String?,
    val totalScore: Int
) 